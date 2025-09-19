import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/atoms/Card";
import Badge from "@/components/atoms/Badge";
import Button from "@/components/atoms/Button";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import ApperIcon from "@/components/ApperIcon";
import Chart from "react-apexcharts";
import studentService from "@/services/api/studentService";
import classService from "@/services/api/classService";
import gradeService from "@/services/api/gradeService";

const Reports = () => {
  const [data, setData] = useState({
    students: [],
    classes: [],
    grades: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedClass, setSelectedClass] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const [studentData, classData, gradeData] = await Promise.all([
        studentService.getAll(),
        classService.getAll(),
        gradeService.getAll()
      ]);
      setData({ 
        students: studentData, 
        classes: classData, 
        grades: gradeData 
      });
    } catch (err) {
      setError("Failed to load report data. Please try again.");
      console.error("Error loading report data:", err);
    } finally {
      setLoading(false);
    }
  };

  const getGradeBadgeVariant = (percentage) => {
    if (percentage >= 90) return "success";
    if (percentage >= 80) return "primary";
    if (percentage >= 70) return "warning";
    return "error";
  };

  const getClassStats = (classId = null) => {
    const filteredGrades = classId 
      ? data.grades.filter(g => g.classId.toString() === classId)
      : data.grades;
    
    if (filteredGrades.length === 0) return null;

    const percentages = filteredGrades.map(g => (g.points / g.maxPoints) * 100);
    const average = percentages.reduce((sum, p) => sum + p, 0) / percentages.length;
    const highest = Math.max(...percentages);
    const lowest = Math.min(...percentages);

    // Grade distribution
    const aCount = percentages.filter(p => p >= 90).length;
    const bCount = percentages.filter(p => p >= 80 && p < 90).length;
    const cCount = percentages.filter(p => p >= 70 && p < 80).length;
    const dCount = percentages.filter(p => p >= 60 && p < 70).length;
    const fCount = percentages.filter(p => p < 60).length;

    return {
      average,
      highest,
      lowest,
      totalGrades: filteredGrades.length,
      distribution: { aCount, bCount, cCount, dCount, fCount }
    };
  };

  const getStudentRankings = () => {
    const studentGrades = {};
    
    data.grades.forEach(grade => {
      if (!studentGrades[grade.studentId]) {
        studentGrades[grade.studentId] = [];
      }
      studentGrades[grade.studentId].push((grade.points / grade.maxPoints) * 100);
    });

    const rankings = Object.entries(studentGrades).map(([studentId, grades]) => {
      const student = data.students.find(s => s.Id.toString() === studentId);
      const average = grades.reduce((sum, g) => sum + g, 0) / grades.length;
      return {
        student,
        average,
        gradeCount: grades.length
      };
    }).sort((a, b) => b.average - a.average);

    return rankings;
  };

  const getCategoryPerformance = () => {
    const categories = {};
    
    data.grades.forEach(grade => {
      if (!categories[grade.category]) {
        categories[grade.category] = [];
      }
      categories[grade.category].push((grade.points / grade.maxPoints) * 100);
    });

    return Object.entries(categories).map(([category, grades]) => ({
      category,
      average: grades.reduce((sum, g) => sum + g, 0) / grades.length,
      count: grades.length
    })).sort((a, b) => b.average - a.average);
  };

  const exportToCSV = () => {
    const csvData = data.grades.map(grade => {
      const student = data.students.find(s => s.Id === grade.studentId);
      const cls = data.classes.find(c => c.Id === grade.classId);
      return {
        Student: student?.name || "Unknown",
        "Student ID": student?.id || "Unknown",
        Class: cls?.name || "Unknown",
        Subject: cls?.subject || "Unknown",
        Assignment: grade.assignmentName,
        Category: grade.category,
        Points: grade.points,
        "Max Points": grade.maxPoints,
        Percentage: ((grade.points / grade.maxPoints) * 100).toFixed(1),
        Date: grade.date,
        Notes: grade.notes || ""
      };
    });

    const headers = Object.keys(csvData[0]).join(",");
    const rows = csvData.map(row => Object.values(row).join(","));
    const csv = [headers, ...rows].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "grade_report.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) return <Loading />;
  if (error) return <Error message={error} onRetry={loadData} />;

  if (data.grades.length === 0) {
    return (
      <div className="p-6 lg:p-8 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            Reports
          </h1>
          <p className="text-gray-600 mt-2">Analyze student performance and generate insights</p>
        </div>
        <Empty
          title="No data available for reports"
          description="Start adding grades to generate meaningful reports and analytics"
          actionText="Go to Grades"
          onAction={() => window.location.href = "/grades"}
          icon="FileText"
        />
      </div>
    );
  }

  const overallStats = getClassStats();
  const selectedStats = selectedClass ? getClassStats(selectedClass) : overallStats;
  const studentRankings = getStudentRankings();
  const categoryPerformance = getCategoryPerformance();

  // Chart data for grade distribution
  const distributionData = selectedStats ? {
    series: [
      selectedStats.distribution.aCount,
      selectedStats.distribution.bCount,
      selectedStats.distribution.cCount,
      selectedStats.distribution.dCount,
      selectedStats.distribution.fCount
    ],
    options: {
      chart: {
        type: 'donut',
        height: 350
      },
      labels: ['A (90-100%)', 'B (80-89%)', 'C (70-79%)', 'D (60-69%)', 'F (0-59%)'],
      colors: ['#10b981', '#2563eb', '#f59e0b', '#fb923c', '#ef4444'],
      legend: {
        position: 'bottom'
      },
      responsive: [{
        breakpoint: 480,
        options: {
          chart: {
            width: 200
          },
          legend: {
            position: 'bottom'
          }
        }
      }]
    }
  } : null;

  // Chart data for category performance
  const categoryData = {
    series: [{
      name: 'Average Grade',
      data: categoryPerformance.map(cat => cat.average.toFixed(1))
    }],
    options: {
      chart: {
        type: 'bar',
        height: 350
      },
      plotOptions: {
        bar: {
          borderRadius: 4,
          horizontal: true,
        }
      },
      dataLabels: {
        enabled: false
      },
      xaxis: {
        categories: categoryPerformance.map(cat => cat.category),
      },
      colors: ['#2563eb']
    }
  };

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Reports
            </h1>
            <p className="text-gray-600 mt-2">Analyze student performance and generate insights</p>
          </div>
          <Button onClick={exportToCSV} variant="outline">
            <ApperIcon name="Download" className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Class Filter */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <label className="text-sm font-medium text-gray-700">View reports for:</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="flex w-full sm:w-64 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">All Classes</option>
              {data.classes.map(cls => (
                <option key={cls.Id} value={cls.Id.toString()}>{cls.name}</option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      {selectedStats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-primary-50 to-primary-100 border-primary-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-primary-700">Class Average</p>
                  <p className="text-3xl font-bold text-primary-900">{selectedStats.average.toFixed(1)}%</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
                  <ApperIcon name="TrendingUp" className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-success-50 to-success-100 border-success-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-success-700">Highest Grade</p>
                  <p className="text-3xl font-bold text-success-900">{selectedStats.highest.toFixed(1)}%</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-success-500 to-success-600 rounded-lg flex items-center justify-center">
                  <ApperIcon name="Award" className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-warning-50 to-warning-100 border-warning-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-warning-700">Lowest Grade</p>
                  <p className="text-3xl font-bold text-warning-900">{selectedStats.lowest.toFixed(1)}%</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-warning-500 to-warning-600 rounded-lg flex items-center justify-center">
                  <ApperIcon name="AlertTriangle" className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-700">Total Grades</p>
                  <p className="text-3xl font-bold text-blue-900">{selectedStats.totalGrades}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <ApperIcon name="GraduationCap" className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Grade Distribution Chart */}
        {distributionData && (
          <Card className="hover:shadow-xl transition-all duration-200">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <ApperIcon name="PieChart" className="w-5 h-5 text-primary-600" />
                <span>Grade Distribution</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Chart
                options={distributionData.options}
                series={distributionData.series}
                type="donut"
                height={350}
              />
            </CardContent>
          </Card>
        )}

        {/* Category Performance Chart */}
        <Card className="hover:shadow-xl transition-all duration-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <ApperIcon name="BarChart3" className="w-5 h-5 text-primary-600" />
              <span>Performance by Category</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {categoryPerformance.length > 0 ? (
              <Chart
                options={categoryData.options}
                series={categoryData.series}
                type="bar"
                height={350}
              />
            ) : (
              <Empty
                title="No category data"
                description="Add more grades to see performance by category"
                icon="BarChart3"
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Student Rankings */}
      <Card className="hover:shadow-xl transition-all duration-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <ApperIcon name="Trophy" className="w-5 h-5 text-primary-600" />
            <span>Student Rankings</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {studentRankings.length > 0 ? (
            <div className="space-y-4">
              {studentRankings.slice(0, 10).map((ranking, index) => (
                <div key={ranking.student.Id} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white rounded-lg border border-gray-100">
                  <div className="flex items-center space-x-4">
                    <div className="w-8 h-8 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-primary-700">#{index + 1}</span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{ranking.student.name}</p>
                      <p className="text-sm text-gray-500">
                        {ranking.gradeCount} grade{ranking.gradeCount !== 1 ? 's' : ''} recorded
                      </p>
                    </div>
                  </div>
                  <Badge variant={getGradeBadgeVariant(ranking.average)}>
                    {ranking.average.toFixed(1)}%
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <Empty
              title="No student rankings"
              description="Add grades to see student performance rankings"
              icon="Trophy"
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;