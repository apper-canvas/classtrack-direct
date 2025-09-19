import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Button from "@/components/atoms/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/atoms/Card";
import Badge from "@/components/atoms/Badge";
import GradeCard from "@/components/molecules/GradeCard";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import ApperIcon from "@/components/ApperIcon";
import studentService from "@/services/api/studentService";
import gradeService from "@/services/api/gradeService";
import classService from "@/services/api/classService";

const StudentProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [grades, setGrades] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadStudentData();
  }, [id]);

  const loadStudentData = async () => {
    setLoading(true);
    setError("");
    try {
      const [studentData, gradeData, classData] = await Promise.all([
studentService.getById(parseInt(id)),
        gradeService.getAll(),
        classService.getAll()
      ]);

      if (!studentData) {
        setError("Student not found");
        return;
      }

      setStudent(studentData);
setGrades(gradeData.filter(g => g.studentId === studentData.Id));
      setClasses(classData);
    } catch (err) {
      setError("Failed to load student data. Please try again.");
      console.error("Error loading student data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteStudent = async () => {
    if (!window.confirm("Are you sure you want to delete this student? This action cannot be undone.")) {
      return;
    }

    try {
      await studentService.delete(student.Id);
      toast.success("Student deleted successfully!");
      navigate("/students");
    } catch (error) {
      toast.error("Failed to delete student. Please try again.");
      console.error("Error deleting student:", error);
    }
  };

  if (loading) return <Loading />;
  if (error) return <Error message={error} onRetry={loadStudentData} />;
  if (!student) return <Error message="Student not found" />;

const studentClass = classes.find(c => c.Id === student.classId);
  
  const getGradesByCategory = () => {
    const categories = {};
    grades.forEach(grade => {
      if (!categories[grade.category]) {
        categories[grade.category] = [];
      }
      categories[grade.category].push(grade);
    });
    return categories;
  };

  const getCategoryAverage = (categoryGrades) => {
    if (categoryGrades.length === 0) return 0;
    const average = categoryGrades.reduce((sum, grade) => {
      return sum + (grade.points / grade.maxPoints * 100);
    }, 0) / categoryGrades.length;
    return average;
  };

  const overallAverage = grades.length > 0 
    ? grades.reduce((sum, grade) => sum + (grade.points / grade.maxPoints * 100), 0) / grades.length
    : 0;

  const getGradeBadgeVariant = (percentage) => {
    if (percentage >= 90) return "success";
    if (percentage >= 80) return "primary";
    if (percentage >= 70) return "warning";
    return "error";
  };

  const gradesByCategory = getGradesByCategory();

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={() => navigate("/students")}
        className="mb-6"
      >
        <ApperIcon name="ArrowLeft" className="w-4 h-4 mr-2" />
        Back to Students
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Student Info Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Basic Info */}
          <Card className="bg-gradient-to-br from-white to-gray-50 hover:shadow-xl transition-all duration-200">
            <CardContent className="p-6">
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ApperIcon name="User" className="w-10 h-10 text-primary-700" />
                </div>
<h2 className="text-2xl font-bold text-gray-900 mb-1">{student.name}</h2>
                <p className="text-gray-500">Student ID: {student.id}</p>
              </div>

              {overallAverage > 0 && (
                <div className="text-center mb-6">
                  <Badge variant={getGradeBadgeVariant(overallAverage)} className="text-lg px-4 py-2">
                    {overallAverage.toFixed(1)}% Overall
                  </Badge>
                </div>
              )}

              <div className="space-y-4">
                <div className="flex items-center text-gray-600">
                  <ApperIcon name="Mail" className="w-5 h-5 mr-3 text-gray-400" />
<span className="break-all">{student.email}</span>
                </div>
                <div className="flex items-center text-gray-600">
<ApperIcon name="Phone" className="w-5 h-5 mr-3 text-gray-400" />
                  <span>{student.phone}</span>
                </div>
{studentClass && (
                  <div className="flex items-center text-gray-600">
                    <ApperIcon name="BookOpen" className="w-5 h-5 mr-3 text-gray-400" />
                    <span>{studentClass.name}</span>
                  </div>
                )}
<div className="flex items-center text-gray-600">
                  <ApperIcon name="Calendar" className="w-5 h-5 mr-3 text-gray-400" />
                  <span>Enrolled: {new Date(student.enrollmentDate).toLocaleDateString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Parent Contact */}
          {student.parentContact && (student.parentContact.name || student.parentContact.email || student.parentContact.phone) && (
            <Card className="hover:shadow-xl transition-all duration-200">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-lg">
                  <ApperIcon name="Users" className="w-5 h-5 text-primary-600" />
                  <span>Parent/Guardian</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {student.parentContact.name && (
                    <div className="flex items-center text-gray-600">
                      <ApperIcon name="User" className="w-4 h-4 mr-3 text-gray-400" />
                      <span>{student.parentContact.name}</span>
                    </div>
                  )}
                  {student.parentContact.email && (
                    <div className="flex items-center text-gray-600">
                      <ApperIcon name="Mail" className="w-4 h-4 mr-3 text-gray-400" />
                      <span className="break-all">{student.parentContact.email}</span>
                    </div>
                  )}
                  {student.parentContact.phone && (
                    <div className="flex items-center text-gray-600">
                      <ApperIcon name="Phone" className="w-4 h-4 mr-3 text-gray-400" />
                      <span>{student.parentContact.phone}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <Card className="hover:shadow-xl transition-all duration-200">
            <CardHeader>
              <CardTitle className="text-lg">Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button 
                  variant="primary" 
                  className="w-full"
                  onClick={() => navigate("/grades")}
                >
                  <ApperIcon name="GraduationCap" className="w-4 h-4 mr-2" />
                  Add Grade
                </Button>
                <Button 
                  variant="secondary" 
                  className="w-full"
onClick={() => navigate(`/students/${student.Id}/edit`)}
                >
                  <ApperIcon name="Edit" className="w-4 h-4 mr-2" />
                  Edit Student
                </Button>
                <Button 
                  variant="danger" 
                  className="w-full"
                  onClick={handleDeleteStudent}
                >
                  <ApperIcon name="Trash2" className="w-4 h-4 mr-2" />
                  Delete Student
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Grades Content */}
        <div className="lg:col-span-2">
          <div className="mb-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Academic Record</h3>
            <p className="text-gray-600">
              {grades.length} grades recorded • {overallAverage.toFixed(1)}% overall average
            </p>
          </div>

          {grades.length === 0 ? (
            <Empty
              title="No grades recorded"
              description="This student doesn't have any grades yet. Start by adding their first grade."
              actionText="Add First Grade"
              onAction={() => navigate("/grades")}
              icon="GraduationCap"
            />
          ) : (
            <div className="space-y-8">
              {/* Category Summaries */}
              <Card className="hover:shadow-xl transition-all duration-200">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <ApperIcon name="BarChart3" className="w-5 h-5 text-primary-600" />
                    <span>Grade Summary by Category</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Object.entries(gradesByCategory).map(([category, categoryGrades]) => {
                      const average = getCategoryAverage(categoryGrades);
                      return (
                        <div key={category} className="p-4 bg-gradient-to-r from-gray-50 to-white rounded-lg border border-gray-100">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-gray-900">{category}</h4>
                            <Badge variant={getGradeBadgeVariant(average)}>
                              {average.toFixed(1)}%
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-500">
                            {categoryGrades.length} assignment{categoryGrades.length !== 1 ? 's' : ''}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Detailed Grades */}
              <Card className="hover:shadow-xl transition-all duration-200">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <ApperIcon name="List" className="w-5 h-5 text-primary-600" />
                    <span>All Grades</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {grades
                      .sort((a, b) => new Date(b.date) - new Date(a.date))
                      .map((grade) => (
                        <GradeCard
key={grade.Id}
                          grade={grade.points}
                          maxGrade={grade.maxPoints}
                          assignment={grade.assignmentName}
                          category={grade.category}
                          date={grade.date}
                        />
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;