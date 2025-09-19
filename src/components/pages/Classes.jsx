import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import Button from "@/components/atoms/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/atoms/Card";
import Badge from "@/components/atoms/Badge";
import SearchBar from "@/components/molecules/SearchBar";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import ApperIcon from "@/components/ApperIcon";
import classService from "@/services/api/classService";
import studentService from "@/services/api/studentService";
import gradeService from "@/services/api/gradeService";

const Classes = () => {
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [grades, setGrades] = useState([]);
  const [filteredClasses, setFilteredClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    subject: "",
    term: "",
    gradeCategories: ["Homework", "Quiz", "Test", "Project"]
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterClasses();
  }, [classes, searchQuery]);

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const [classData, studentData, gradeData] = await Promise.all([
        classService.getAll(),
        studentService.getAll(),
        gradeService.getAll()
      ]);
      setClasses(classData);
      setStudents(studentData);
      setGrades(gradeData);
    } catch (err) {
      setError("Failed to load classes. Please try again.");
      console.error("Error loading classes:", err);
    } finally {
      setLoading(false);
    }
  };

  const filterClasses = () => {
    if (!searchQuery.trim()) {
      setFilteredClasses(classes);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = classes.filter(cls =>
      cls.name.toLowerCase().includes(query) ||
      cls.subject.toLowerCase().includes(query) ||
      cls.term.toLowerCase().includes(query)
    );
    setFilteredClasses(filtered);
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const handleAddClass = () => {
    setEditingClass(null);
    setFormData({
      name: "",
      subject: "",
      term: "",
      gradeCategories: ["Homework", "Quiz", "Test", "Project"]
    });
    setShowForm(true);
  };

  const handleEditClass = (cls) => {
    setEditingClass(cls);
    setFormData({
      name: cls.name,
      subject: cls.subject,
      term: cls.term,
      gradeCategories: cls.gradeCategories || ["Homework", "Quiz", "Test", "Project"]
    });
    setShowForm(true);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveClass = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.subject.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      const classData = {
        ...formData,
        studentIds: editingClass?.studentIds || []
      };

      if (editingClass) {
        await classService.update(editingClass.Id, classData);
        toast.success("Class updated successfully!");
      } else {
        await classService.create(classData);
        toast.success("Class created successfully!");
      }
      
      setShowForm(false);
      setEditingClass(null);
      await loadData();
    } catch (error) {
      toast.error("Failed to save class. Please try again.");
      console.error("Error saving class:", error);
    }
  };

  const handleDeleteClass = async (classId) => {
    if (!window.confirm("Are you sure you want to delete this class? This action cannot be undone.")) {
      return;
    }

    try {
      await classService.delete(classId);
      toast.success("Class deleted successfully!");
      await loadData();
    } catch (error) {
      toast.error("Failed to delete class. Please try again.");
      console.error("Error deleting class:", error);
    }
  };

  const getClassStudents = (classId) => {
    return students.filter(s => s.classId === classId);
  };

  const getClassAverage = (classId) => {
    const classGrades = grades.filter(g => g.classId === classId);
    if (classGrades.length === 0) return null;
    
    const average = classGrades.reduce((sum, grade) => sum + (grade.points / grade.maxPoints * 100), 0) / classGrades.length;
    return average;
  };

  const getGradeBadgeVariant = (percentage) => {
    if (percentage >= 90) return "success";
    if (percentage >= 80) return "primary";
    if (percentage >= 70) return "warning";
    return "error";
  };

  if (loading) return <Loading />;
  if (error) return <Error message={error} onRetry={loadData} />;

  if (showForm) {
    return (
      <div className="p-6 lg:p-8 max-w-2xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => setShowForm(false)}
          className="mb-6"
        >
          <ApperIcon name="ArrowLeft" className="w-4 h-4 mr-2" />
          Back to Classes
        </Button>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <ApperIcon name="BookOpen" className="w-6 h-6 text-primary-600" />
              <span>{editingClass ? "Edit Class" : "Add New Class"}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveClass} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Class Name *</label>
                  <input
                    name="name"
                    value={formData.name}
                    onChange={handleFormChange}
                    placeholder="Enter class name"
                    className="flex w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Subject *</label>
                  <input
                    name="subject"
                    value={formData.subject}
                    onChange={handleFormChange}
                    placeholder="Enter subject"
                    className="flex w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Term/Semester</label>
                <input
                  name="term"
                  value={formData.term}
                  onChange={handleFormChange}
                  placeholder="e.g., Fall 2024, Spring 2024"
                  className="flex w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  <ApperIcon name="Save" className="w-4 h-4 mr-2" />
                  {editingClass ? "Update Class" : "Create Class"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Classes
            </h1>
            <p className="text-gray-600 mt-2">Manage your classes and course sections</p>
          </div>
          <Button onClick={handleAddClass} size="lg">
            <ApperIcon name="Plus" className="w-4 h-4 mr-2" />
            Add Class
          </Button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <div className="w-full sm:w-96">
            <SearchBar
              placeholder="Search classes by name, subject, or term..."
              onSearch={handleSearch}
            />
          </div>
          <div className="text-sm text-gray-500">
            {filteredClasses.length} of {classes.length} classes
          </div>
        </div>
      </div>

      {/* Classes Grid */}
      {classes.length === 0 ? (
        <Empty
          title="No classes found"
          description="Start organizing your curriculum by creating your first class"
          actionText="Create First Class"
          onAction={handleAddClass}
          icon="BookOpen"
        />
      ) : filteredClasses.length === 0 ? (
        <Empty
          title="No matching classes"
          description={`No classes found matching "${searchQuery}"`}
          icon="Search"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClasses.map((cls) => {
            const classStudents = getClassStudents(cls.Id);
            const classAverage = getClassAverage(cls.Id);
            
            return (
              <Card key={cls.Id} className="hover:shadow-xl transition-all duration-200 hover:scale-[1.02] bg-gradient-to-br from-white to-gray-50">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center">
                        <ApperIcon name="BookOpen" className="w-6 h-6 text-blue-700" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg text-gray-900">{cls.name}</h3>
                        <p className="text-sm text-gray-500">{cls.subject}</p>
                      </div>
                    </div>
                    {classAverage && (
                      <Badge variant={getGradeBadgeVariant(classAverage)}>
                        {classAverage.toFixed(1)}%
                      </Badge>
                    )}
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    {cls.term && (
                      <div className="flex items-center text-sm text-gray-600">
                        <ApperIcon name="Calendar" className="w-4 h-4 mr-2" />
                        {cls.term}
                      </div>
                    )}
                    <div className="flex items-center text-sm text-gray-600">
                      <ApperIcon name="Users" className="w-4 h-4 mr-2" />
                      {classStudents.length} student{classStudents.length !== 1 ? 's' : ''}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <ApperIcon name="GraduationCap" className="w-4 h-4 mr-2" />
                      {grades.filter(g => g.classId === cls.Id).length} grades recorded
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditClass(cls)}
                      className="flex-1"
                    >
                      <ApperIcon name="Edit" className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteClass(cls.Id)}
                      className="text-error-600 hover:text-error-700 hover:bg-error-50"
                    >
                      <ApperIcon name="Trash2" className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Classes;