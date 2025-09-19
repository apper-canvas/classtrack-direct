import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import Button from "@/components/atoms/Button";
import SearchBar from "@/components/molecules/SearchBar";
import StudentCard from "@/components/molecules/StudentCard";
import StudentForm from "@/components/organisms/StudentForm";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import ApperIcon from "@/components/ApperIcon";
import studentService from "@/services/api/studentService";
import gradeService from "@/services/api/gradeService";

const Students = () => {
const [students, setStudents] = useState([]);
  const [grades, setGrades] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [gradeThreshold, setGradeThreshold] = useState({ min: 0, max: 100, type: "above" });
  const [assignmentType, setAssignmentType] = useState("");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterStudents();
}, [students, searchQuery, dateRange, gradeThreshold, assignmentType]);

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
const [studentData, gradeData] = await Promise.all([
        studentService.getAll(),
        gradeService.getAll()
      ]);
      setStudents(studentData);
      setGrades(gradeData);
    } catch (err) {
      setError("Failed to load students. Please try again.");
      console.error("Error loading students:", err);
    } finally {
      setLoading(false);
    }
  };

const filterStudents = () => {
    let filtered = students;

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(student =>
student.name.toLowerCase().includes(query) ||
        student.id.toLowerCase().includes(query) ||
        student.email.toLowerCase().includes(query)
      );
    }

    // Filter by grade average thresholds
    if (gradeThreshold.type !== "all") {
      filtered = filtered.filter(student => {
        const average = getStudentAverage(student.Id);
        if (average === undefined) return true; // Include students with no grades
        
        if (gradeThreshold.type === "above") {
          return average >= gradeThreshold.min;
        } else if (gradeThreshold.type === "below") {
          return average <= gradeThreshold.max;
        } else if (gradeThreshold.type === "between") {
          return average >= gradeThreshold.min && average <= gradeThreshold.max;
        }
        return true;
      });
    }

    // Filter by assignment type (based on student's grades in that category)
    if (assignmentType) {
      const studentsWithAssignmentType = grades
        .filter(grade => grade.category === assignmentType)
        .map(grade => grade.studentId);
      filtered = filtered.filter(student => 
        studentsWithAssignmentType.includes(student.Id)
      );
    }

    // Filter by date range (based on student's grade dates)
    if (dateRange.start || dateRange.end) {
      const studentsInDateRange = grades
        .filter(grade => {
          const gradeDate = new Date(grade.date);
          const startDate = dateRange.start ? new Date(dateRange.start) : null;
          const endDate = dateRange.end ? new Date(dateRange.end) : null;
          
          if (startDate && endDate) {
            return gradeDate >= startDate && gradeDate <= endDate;
          } else if (startDate) {
            return gradeDate >= startDate;
          } else if (endDate) {
            return gradeDate <= endDate;
          }
          return true;
        })
        .map(grade => grade.studentId);
      
      if (studentsInDateRange.length > 0) {
        filtered = filtered.filter(student => 
          studentsInDateRange.includes(student.Id)
        );
      }
    }

    setFilteredStudents(filtered);
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const handleAddStudent = () => {
    setEditingStudent(null);
    setShowForm(true);
  };

  const handleEditStudent = (student) => {
    setEditingStudent(student);
    setShowForm(true);
  };

  const handleSaveStudent = async (studentData) => {
    setShowForm(false);
    setEditingStudent(null);
    await loadData(); // Reload data to get fresh state
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingStudent(null);
  };

  const handleDeleteStudent = async (studentId) => {
    if (!window.confirm("Are you sure you want to delete this student? This action cannot be undone.")) {
      return;
    }

    try {
      await studentService.delete(studentId);
      toast.success("Student deleted successfully!");
      await loadData();
    } catch (error) {
      toast.error("Failed to delete student. Please try again.");
      console.error("Error deleting student:", error);
    }
  };

  const getStudentAverage = (studentId) => {
const studentGrades = grades.filter(g => g.studentId === studentId);
    if (studentGrades.length === 0) return null;
    
    const average = studentGrades.reduce((sum, grade) => {
      return sum + (grade.points / grade.maxPoints * 100);
    }, 0) / studentGrades.length;
    
    return average;
  };

  if (loading) return <Loading />;
  if (error) return <Error message={error} onRetry={loadData} />;

  if (showForm) {
    return (
      <div className="p-6 lg:p-8">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={handleCancelForm}
            className="mb-4"
          >
            <ApperIcon name="ArrowLeft" className="w-4 h-4 mr-2" />
            Back to Students
          </Button>
        </div>
        <StudentForm
          student={editingStudent}
          onSave={handleSaveStudent}
          onCancel={handleCancelForm}
        />
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
              Students
            </h1>
            <p className="text-gray-600 mt-2">Manage your student roster and academic records</p>
          </div>
          <Button onClick={handleAddStudent} size="lg">
            <ApperIcon name="UserPlus" className="w-4 h-4 mr-2" />
            Add Student
          </Button>
        </div>
      </div>

      {/* Search and Filter */}
<div className="mb-6">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="w-full sm:w-96">
              <SearchBar
                placeholder="Search students by name, ID, or email..."
                onSearch={handleSearch}
              />
            </div>
            <div className="flex gap-2 items-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className="flex items-center gap-2"
              >
                <ApperIcon name="Filter" className="w-4 h-4" />
                {showAdvancedFilters ? "Hide Filters" : "Advanced Filters"}
              </Button>
              <div className="text-sm text-gray-500">
                {filteredStudents.length} of {students.length} students
              </div>
            </div>
          </div>

          {showAdvancedFilters && (
            <div className="bg-gray-50 p-4 rounded-lg border">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Date Range Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
                  <div className="space-y-2">
                    <input
                      type="date"
                      value={dateRange.start}
                      onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                      placeholder="Start date"
                      className="flex w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                    <input
                      type="date"
                      value={dateRange.end}
                      onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                      placeholder="End date"
                      className="flex w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                </div>

                {/* Grade Threshold Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Grade Filter</label>
                  <div className="space-y-2">
                    <select
                      value={gradeThreshold.type}
                      onChange={(e) => setGradeThreshold(prev => ({ ...prev, type: e.target.value }))}
                      className="flex w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="all">All Grades</option>
                      <option value="above">Above Threshold</option>
                      <option value="below">Below Threshold</option>
                      <option value="between">Between Range</option>
                    </select>
                    {gradeThreshold.type === "above" && (
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={gradeThreshold.min}
                        onChange={(e) => setGradeThreshold(prev => ({ ...prev, min: Number(e.target.value) }))}
                        placeholder="Min grade %"
                        className="flex w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                    )}
                    {gradeThreshold.type === "below" && (
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={gradeThreshold.max}
                        onChange={(e) => setGradeThreshold(prev => ({ ...prev, max: Number(e.target.value) }))}
                        placeholder="Max grade %"
                        className="flex w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                    )}
                    {gradeThreshold.type === "between" && (
                      <div className="flex gap-2">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={gradeThreshold.min}
                          onChange={(e) => setGradeThreshold(prev => ({ ...prev, min: Number(e.target.value) }))}
                          placeholder="Min %"
                          className="flex w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        />
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={gradeThreshold.max}
                          onChange={(e) => setGradeThreshold(prev => ({ ...prev, max: Number(e.target.value) }))}
                          placeholder="Max %"
                          className="flex w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Assignment Type Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Assignment Type</label>
                  <select
                    value={assignmentType}
                    onChange={(e) => setAssignmentType(e.target.value)}
                    className="flex w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">All Types</option>
                    <option value="Quiz">Quiz</option>
                    <option value="Test">Test</option>
                    <option value="Homework">Homework</option>
                    <option value="Essay">Essay</option>
                    <option value="Lab Report">Lab Report</option>
                  </select>
                </div>

                {/* Clear Filters */}
                <div className="flex items-end">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchQuery("");
                      setDateRange({ start: "", end: "" });
                      setGradeThreshold({ min: 0, max: 100, type: "all" });
                      setAssignmentType("");
                    }}
                    className="w-full flex items-center justify-center gap-2"
                  >
                    <ApperIcon name="X" className="w-4 h-4" />
                    Clear All
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Students Grid */}
      {students.length === 0 ? (
        <Empty
          title="No students found"
          description="Start building your class roster by adding your first student"
          actionText="Add First Student"
          onAction={handleAddStudent}
          icon="Users"
        />
      ) : filteredStudents.length === 0 ? (
        <Empty
          title="No matching students"
          description={`No students found matching "${searchQuery}"`}
          icon="Search"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStudents.map((student) => (
            <StudentCard
key={student.Id}
              student={student}
              averageGrade={getStudentAverage(student.Id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Students;