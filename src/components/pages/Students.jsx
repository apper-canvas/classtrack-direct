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

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterStudents();
  }, [students, searchQuery]);

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
    if (!searchQuery.trim()) {
      setFilteredStudents(students);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = students.filter(student =>
      student.name.toLowerCase().includes(query) ||
      student.id.toLowerCase().includes(query) ||
      student.email.toLowerCase().includes(query)
    );
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
    if (studentGrades.length === 0) return undefined;
    
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
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <div className="w-full sm:w-96">
            <SearchBar
              placeholder="Search students by name, ID, or email..."
              onSearch={handleSearch}
            />
          </div>
          <div className="text-sm text-gray-500">
            {filteredStudents.length} of {students.length} students
          </div>
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