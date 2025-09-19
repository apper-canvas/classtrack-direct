import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/atoms/Card";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";
import GradeForm from "@/components/organisms/GradeForm";
import Classes from "@/components/pages/Classes";
import Loading from "@/components/ui/Loading";
import Empty from "@/components/ui/Empty";
import Error from "@/components/ui/Error";
import SearchBar from "@/components/molecules/SearchBar";
import gradeService from "@/services/api/gradeService";
import classService from "@/services/api/classService";
import studentService from "@/services/api/studentService";

const Grades = () => {
  const [grades, setGrades] = useState([]);
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
const [filteredGrades, setFilteredGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingGrade, setEditingGrade] = useState(null);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [gradeThreshold, setGradeThreshold] = useState({ min: 0, max: 100, type: "all" });
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
filterGrades();
  }, [grades, searchQuery, selectedClass, selectedCategory, dateRange, gradeThreshold]);

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const [gradeData, studentData, classData] = await Promise.all([
gradeService.getAll(),
        studentService.getAll(),
        classService.getAll()
      ]);
      setGrades(gradeData);
      setStudents(studentData);
      setClasses(classData);
    } catch (err) {
      setError("Failed to load grades. Please try again.");
      console.error("Error loading grades:", err);
    } finally {
      setLoading(false);
    }
  };

  const filterGrades = () => {
let filtered = grades;

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(grade => {
const student = students.find(s => s.Id === grade.studentId);
        const cls = classes.find(c => c.Id === grade.classId);
        return (
          grade.assignmentName.toLowerCase().includes(query) ||
          student?.name.toLowerCase().includes(query) ||
          cls?.name.toLowerCase().includes(query) ||
          grade.category.toLowerCase().includes(query)
        );
      });
    }

    // Filter by class
    if (selectedClass) {
filtered = filtered.filter(grade => grade.classId.toString() === selectedClass);
    }

    // Filter by category
    if (selectedCategory) {
filtered = filtered.filter(grade => grade.category === selectedCategory);
    }

    // Filter by date range
    if (dateRange.start || dateRange.end) {
      filtered = filtered.filter(grade => {
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
      });
    }

    // Filter by grade threshold
    if (gradeThreshold.type !== "all") {
      filtered = filtered.filter(grade => {
        const percentage = (grade.points / grade.maxPoints) * 100;
        
        if (gradeThreshold.type === "above") {
          return percentage >= gradeThreshold.min;
        } else if (gradeThreshold.type === "below") {
          return percentage <= gradeThreshold.max;
        } else if (gradeThreshold.type === "between") {
          return percentage >= gradeThreshold.min && percentage <= gradeThreshold.max;
        }
        return true;
      });
    }

    setFilteredGrades(filtered);
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const handleAddGrade = () => {
    setEditingGrade(null);
    setShowForm(true);
  };

  const handleEditGrade = (grade) => {
    setEditingGrade(grade);
    setShowForm(true);
  };

  const handleSaveGrade = async (gradeData) => {
    setShowForm(false);
    setEditingGrade(null);
    await loadData(); // Reload data to get fresh state
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingGrade(null);
  };

  const handleDeleteGrade = async (gradeId) => {
    if (!window.confirm("Are you sure you want to delete this grade? This action cannot be undone.")) {
      return;
    }

    try {
      await gradeService.delete(gradeId);
      toast.success("Grade deleted successfully!");
      await loadData();
    } catch (error) {
      toast.error("Failed to delete grade. Please try again.");
      console.error("Error deleting grade:", error);
    }
  };

  const getGradeBadgeVariant = (percentage) => {
    if (percentage >= 90) return "success";
    if (percentage >= 80) return "primary";
    if (percentage >= 70) return "warning";
    return "error";
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  };

  const categories = [...new Set(grades.map(g => g.category))];

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
            Back to Grades
          </Button>
        </div>
        <GradeForm
          grade={editingGrade}
          onSave={handleSaveGrade}
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
              Grades
            </h1>
            <p className="text-gray-600 mt-2">Track and manage student grades and assignments</p>
          </div>
          <Button onClick={handleAddGrade} size="lg">
            <ApperIcon name="Plus" className="w-4 h-4 mr-2" />
            Add Grade
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-6">
<div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
              <div className="md:col-span-6">
                <SearchBar
                  placeholder="Search by assignment, student, class, or category..."
                  onSearch={handleSearch}
                />
              </div>
              
              <div className="md:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Class</label>
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="flex w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">All Classes</option>
{classes.map(cls => (
                    <option key={cls.Id} value={cls.Id}>{cls.name}</option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="flex w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className="flex items-center gap-2"
              >
                <ApperIcon name="Filter" className="w-4 h-4" />
                {showAdvancedFilters ? "Hide Advanced" : "Advanced Filters"}
              </Button>
              <div className="text-sm text-gray-500">
                {filteredGrades.length} of {grades.length} grades
              </div>
            </div>

            {showAdvancedFilters && (
              <div className="bg-gray-50 p-4 rounded-lg border">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">Grade Threshold</label>
                    <div className="space-y-2">
                      <select
                        value={gradeThreshold.type}
                        onChange={(e) => setGradeThreshold(prev => ({ ...prev, type: e.target.value }))}
                        className="flex w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      >
                        <option value="all">All Grades</option>
                        <option value="above">Above 90% (A)</option>
                        <option value="below">Below 70% (C-)</option>
                        <option value="between">Custom Range</option>
                      </select>
                      {gradeThreshold.type === "above" && (
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={gradeThreshold.min}
                          onChange={(e) => setGradeThreshold(prev => ({ ...prev, min: Number(e.target.value) }))}
                          placeholder="Minimum %"
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
                          placeholder="Maximum %"
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

                  {/* Clear Filters */}
                  <div className="flex items-end">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSearchQuery("");
                        setSelectedClass("");
                        setSelectedCategory("");
                        setDateRange({ start: "", end: "" });
                        setGradeThreshold({ min: 0, max: 100, type: "all" });
                      }}
                      className="w-full flex items-center justify-center gap-2"
                    >
                      <ApperIcon name="X" className="w-4 h-4" />
                      Clear All Filters
                    </Button>
                  </div>
                </div>
              </div>
            )}
</div>
        </CardContent>
      </Card>

      {/* Grades Table */}
      {grades.length === 0 ? (
        <Empty
          title="No grades recorded"
          description="Start tracking student performance by adding your first grade"
          actionText="Add First Grade"
          onAction={handleAddGrade}
          icon="GraduationCap"
        />
      ) : filteredGrades.length === 0 ? (
        <Empty
          title="No matching grades"
          description={`No grades found matching your current filters`}
          icon="Search"
        />
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Assignment
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Class
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Grade
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredGrades
                  .sort((a, b) => new Date(b.date) - new Date(a.date))
                  .map((grade) => {
const student = students.find(s => s.Id === grade.studentId);
                    const cls = classes.find(c => c.Id === grade.classId);
                    const percentage = (grade.points / grade.maxPoints * 100);
                    
                    return (
<tr key={grade.Id} className="hover:bg-gray-50 transition-colors duration-150">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{grade.assignmentName}</div>
                          {grade.notes && (
                            <div className="text-xs text-gray-500 mt-1">{grade.notes}</div>
                          )}
                        </td>
<td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{student?.name || "Unknown"}</div>
                          <div className="text-xs text-gray-500">{student?.id}</div>
                        </td>
<td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{cls?.name || "Unknown"}</div>
                          <div className="text-xs text-gray-500">{cls?.subject}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                            {grade.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            <Badge variant={getGradeBadgeVariant(percentage)}>
                              {percentage.toFixed(1)}%
                            </Badge>
<span className="text-sm text-gray-500">
                              ({grade.points}/{grade.maxPoints})
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(grade.date)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEditGrade(grade)}
                              className="text-primary-600 hover:text-primary-800 transition-colors"
                            >
                              <ApperIcon name="Edit" className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteGrade(grade.Id)}
                              className="text-error-600 hover:text-error-800 transition-colors"
                            >
                              <ApperIcon name="Trash2" className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};

export default Grades;