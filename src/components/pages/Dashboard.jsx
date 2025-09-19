import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/atoms/Card";
import Badge from "@/components/atoms/Badge";
import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import studentService from "@/services/api/studentService";
import classService from "@/services/api/classService";
import gradeService from "@/services/api/gradeService";

const Dashboard = () => {
  const navigate = useNavigate();
  const [data, setData] = useState({
    students: [],
    classes: [],
    grades: [],
    recentGrades: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    setError("");
    try {
      const [students, classes, grades] = await Promise.all([
        studentService.getAll(),
        classService.getAll(),
        gradeService.getAll()
      ]);

      // Get recent grades (last 5)
      const recentGrades = grades
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5)
        .map(grade => ({
          ...grade,
          student: students.find(s => s.Id === grade.studentId),
          class: classes.find(c => c.Id === grade.classId)
        }));

      setData({ students, classes, grades, recentGrades });
    } catch (err) {
      setError("Failed to load dashboard data. Please try again.");
      console.error("Error loading dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;
  if (error) return <Error message={error} onRetry={loadDashboardData} />;

  const getClassAverage = (classId) => {
    const classGrades = data.grades.filter(g => g.classId === classId);
    if (classGrades.length === 0) return 0;
    
    const average = classGrades.reduce((sum, grade) => sum + (grade.points / grade.maxPoints * 100), 0) / classGrades.length;
    return average;
  };

  const getGradeBadgeVariant = (percentage) => {
    if (percentage >= 90) return "success";
    if (percentage >= 80) return "primary";
    if (percentage >= 70) return "warning";
    return "error";
  };

  const totalStudents = data.students.length;
  const totalClasses = data.classes.length;
  const totalGrades = data.grades.length;
  const overallAverage = data.grades.length > 0 
    ? data.grades.reduce((sum, grade) => sum + (grade.points / grade.maxPoints * 100), 0) / data.grades.length
    : 0;

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
          Dashboard
        </h1>
        <p className="text-gray-600 mt-2">Welcome back! Here's an overview of your classes and students.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-primary-50 to-primary-100 border-primary-200 hover:shadow-xl transition-all duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-primary-700">Total Students</p>
                <p className="text-3xl font-bold text-primary-900">{totalStudents}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
                <ApperIcon name="Users" className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-xl transition-all duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700">Total Classes</p>
                <p className="text-3xl font-bold text-blue-900">{totalClasses}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <ApperIcon name="BookOpen" className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-success-50 to-success-100 border-success-200 hover:shadow-xl transition-all duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-success-700">Total Grades</p>
                <p className="text-3xl font-bold text-success-900">{totalGrades}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-success-500 to-success-600 rounded-lg flex items-center justify-center">
                <ApperIcon name="GraduationCap" className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-warning-50 to-warning-100 border-warning-200 hover:shadow-xl transition-all duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-warning-700">Overall Average</p>
                <p className="text-3xl font-bold text-warning-900">{overallAverage.toFixed(1)}%</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-warning-500 to-warning-600 rounded-lg flex items-center justify-center">
                <ApperIcon name="TrendingUp" className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Grades */}
        <Card className="hover:shadow-xl transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <ApperIcon name="Clock" className="w-5 h-5 text-primary-600" />
              <span>Recent Grades</span>
            </CardTitle>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate("/grades")}
            >
              <ApperIcon name="ArrowRight" className="w-4 h-4" />
            </Button>
          </CardHeader>
          <CardContent>
            {data.recentGrades.length === 0 ? (
              <Empty
                title="No recent grades"
                description="Start adding grades to see them here"
                icon="GraduationCap"
              />
            ) : (
              <div className="space-y-4">
                {data.recentGrades.map((grade) => {
                  const percentage = (grade.points / grade.maxPoints * 100);
                  return (
                    <div key={grade.Id} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white rounded-lg border border-gray-100 hover:shadow-md transition-all duration-200">
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{grade.assignmentName}</p>
                        <p className="text-sm text-gray-500">
                          {grade.student?.name} • {grade.class?.name}
                        </p>
                        <p className="text-xs text-gray-400">
                          {new Date(grade.date).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge variant={getGradeBadgeVariant(percentage)}>
                          {percentage.toFixed(1)}%
                        </Badge>
                        <p className="text-sm text-gray-500 mt-1">
                          {grade.points}/{grade.maxPoints}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Class Overview */}
        <Card className="hover:shadow-xl transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <ApperIcon name="BookOpen" className="w-5 h-5 text-primary-600" />
              <span>Class Overview</span>
            </CardTitle>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate("/classes")}
            >
              <ApperIcon name="ArrowRight" className="w-4 h-4" />
            </Button>
          </CardHeader>
          <CardContent>
            {data.classes.length === 0 ? (
              <Empty
                title="No classes found"
                description="Create your first class to get started"
                icon="BookOpen"
              />
            ) : (
              <div className="space-y-4">
                {data.classes.map((cls) => {
                  const classStudents = data.students.filter(s => s.classId === cls.Id);
                  const classAverage = getClassAverage(cls.Id);
                  return (
                    <div key={cls.Id} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white rounded-lg border border-gray-100 hover:shadow-md transition-all duration-200">
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{cls.name}</p>
                        <p className="text-sm text-gray-500">{cls.subject}</p>
                        <p className="text-xs text-gray-400">
                          {classStudents.length} students
                        </p>
                      </div>
                      <div className="text-right">
                        {classAverage > 0 && (
                          <>
                            <Badge variant={getGradeBadgeVariant(classAverage)}>
                              {classAverage.toFixed(1)}%
                            </Badge>
                            <p className="text-xs text-gray-500 mt-1">Class Average</p>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="mt-8 hover:shadow-xl transition-all duration-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <ApperIcon name="Zap" className="w-5 h-5 text-primary-600" />
            <span>Quick Actions</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button 
              onClick={() => navigate("/students")} 
              variant="outline" 
              className="flex items-center justify-center p-4 h-auto"
            >
              <div className="text-center">
                <ApperIcon name="UserPlus" className="w-8 h-8 mx-auto mb-2 text-primary-600" />
                <span>Add Student</span>
              </div>
            </Button>
            <Button 
              onClick={() => navigate("/classes")} 
              variant="outline" 
              className="flex items-center justify-center p-4 h-auto"
            >
              <div className="text-center">
                <ApperIcon name="BookOpen" className="w-8 h-8 mx-auto mb-2 text-primary-600" />
                <span>Manage Classes</span>
              </div>
            </Button>
            <Button 
              onClick={() => navigate("/grades")} 
              variant="outline" 
              className="flex items-center justify-center p-4 h-auto"
            >
              <div className="text-center">
                <ApperIcon name="GraduationCap" className="w-8 h-8 mx-auto mb-2 text-primary-600" />
                <span>Enter Grades</span>
              </div>
            </Button>
            <Button 
              onClick={() => navigate("/reports")} 
              variant="outline" 
              className="flex items-center justify-center p-4 h-auto"
            >
              <div className="text-center">
                <ApperIcon name="FileText" className="w-8 h-8 mx-auto mb-2 text-primary-600" />
                <span>View Reports</span>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;