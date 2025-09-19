import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import Button from "@/components/atoms/Button";
import FormField from "@/components/molecules/FormField";
import Input from "@/components/atoms/Input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/atoms/Card";
import ApperIcon from "@/components/ApperIcon";
import gradeService from "@/services/api/gradeService";
import studentService from "@/services/api/studentService";
import classService from "@/services/api/classService";
import assignmentService from "@/services/api/assignmentService";

const GradeForm = ({ grade, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    studentId: grade?.studentId || "",
    classId: grade?.classId || "",
    assignmentName: grade?.assignmentName || "",
    category: grade?.category || "Homework",
    points: grade?.points || "",
    maxPoints: grade?.maxPoints || "",
    date: grade?.date || new Date().toISOString().split("T")[0],
    notes: grade?.notes || ""
  });
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [assignments, setAssignments] = useState([]);

  const categories = ["Homework", "Quiz", "Test", "Project", "Participation", "Extra Credit"];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [studentData, classData, assignmentData] = await Promise.all([
        studentService.getAll(),
        classService.getAll(),
        assignmentService.getAll()
      ]);
      setStudents(studentData);
      setClasses(classData);
      setAssignments(assignmentData);
    } catch (error) {
      console.error("Failed to load data:", error);
      toast.error("Failed to load required data");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const handleAssignmentSelect = (e) => {
    const assignmentId = e.target.value;
    const assignment = assignments.find(a => a.Id.toString() === assignmentId);
    
    if (assignment) {
      setFormData(prev => ({
        ...prev,
        assignmentName: assignment.name,
        category: assignment.category,
        maxPoints: assignment.maxPoints.toString(),
        classId: assignment.classId.toString()
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.studentId) newErrors.studentId = "Student is required";
    if (!formData.classId) newErrors.classId = "Class is required";
    if (!formData.assignmentName.trim()) newErrors.assignmentName = "Assignment name is required";
    if (!formData.points) newErrors.points = "Points earned is required";
    else if (isNaN(formData.points) || parseFloat(formData.points) < 0) {
      newErrors.points = "Points must be a valid number";
    }
    if (!formData.maxPoints) newErrors.maxPoints = "Maximum points is required";
    else if (isNaN(formData.maxPoints) || parseFloat(formData.maxPoints) <= 0) {
      newErrors.maxPoints = "Maximum points must be a positive number";
    }
    if (formData.points && formData.maxPoints && parseFloat(formData.points) > parseFloat(formData.maxPoints)) {
      newErrors.points = "Points earned cannot exceed maximum points";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      const gradeData = {
        ...formData,
        points: parseFloat(formData.points),
        maxPoints: parseFloat(formData.maxPoints)
      };

      let savedGrade;
      if (grade?.Id) {
        savedGrade = await gradeService.update(grade.Id, gradeData);
        toast.success("Grade updated successfully!");
      } else {
        savedGrade = await gradeService.create(gradeData);
        toast.success("Grade added successfully!");
      }
      
      onSave(savedGrade);
    } catch (error) {
      toast.error("Failed to save grade. Please try again.");
      console.error("Error saving grade:", error);
    } finally {
      setLoading(false);
    }
  };

  const getSelectedStudent = () => {
    return students.find(s => s.Id.toString() === formData.studentId);
  };

  const getSelectedClass = () => {
    return classes.find(c => c.Id.toString() === formData.classId);
  };

  const percentage = formData.points && formData.maxPoints 
    ? ((parseFloat(formData.points) / parseFloat(formData.maxPoints)) * 100).toFixed(1)
    : null;

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <ApperIcon name="GraduationCap" className="w-6 h-6 text-primary-600" />
          <span>{grade ? "Edit Grade" : "Add New Grade"}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField label="Student" error={errors.studentId}>
              <select
                name="studentId"
                value={formData.studentId}
                onChange={handleChange}
                className="flex w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Select a student</option>
                {students.map(student => (
                  <option key={student.Id} value={student.Id}>
                    {student.name} ({student.id})
                  </option>
                ))}
              </select>
            </FormField>

            <FormField label="Class" error={errors.classId}>
              <select
                name="classId"
                value={formData.classId}
                onChange={handleChange}
                className="flex w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Select a class</option>
                {classes.map(cls => (
                  <option key={cls.Id} value={cls.Id}>
                    {cls.name} - {cls.subject}
                  </option>
                ))}
              </select>
            </FormField>
          </div>

          <FormField label="Select Existing Assignment (Optional)">
            <select
              onChange={handleAssignmentSelect}
              className="flex w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">Choose an existing assignment or enter new below</option>
              {assignments
                .filter(a => !formData.classId || a.classId.toString() === formData.classId)
                .map(assignment => (
                  <option key={assignment.Id} value={assignment.Id}>
                    {assignment.name} ({assignment.category}) - {assignment.maxPoints} pts
                  </option>
                ))}
            </select>
          </FormField>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField label="Assignment Name" error={errors.assignmentName}>
              <Input
                name="assignmentName"
                value={formData.assignmentName}
                onChange={handleChange}
                placeholder="Enter assignment name"
                error={errors.assignmentName}
              />
            </FormField>

            <FormField label="Category" error={errors.category}>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="flex w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </FormField>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FormField label="Points Earned" error={errors.points}>
              <Input
                name="points"
                type="number"
                step="0.1"
                min="0"
                value={formData.points}
                onChange={handleChange}
                placeholder="0"
                error={errors.points}
              />
            </FormField>

            <FormField label="Maximum Points" error={errors.maxPoints}>
              <Input
                name="maxPoints"
                type="number"
                step="0.1"
                min="0.1"
                value={formData.maxPoints}
                onChange={handleChange}
                placeholder="100"
                error={errors.maxPoints}
              />
            </FormField>

            <FormField label="Percentage">
              <div className="flex w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm">
                <span className={`font-semibold ${
                  percentage >= 90 ? "text-success-600" :
                  percentage >= 80 ? "text-primary-600" :
                  percentage >= 70 ? "text-warning-600" : "text-error-600"
                }`}>
                  {percentage ? `${percentage}%` : "--"}
                </span>
              </div>
            </FormField>
          </div>

          <FormField label="Date">
            <Input
              name="date"
              type="date"
              value={formData.date}
              onChange={handleChange}
            />
          </FormField>

          <FormField label="Notes (Optional)">
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Add any additional notes about this grade"
              rows="3"
              className="flex w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
            />
          </FormField>

          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <Button 
              type="button" 
              variant="secondary" 
              onClick={onCancel}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <ApperIcon name="Loader" className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <ApperIcon name="Save" className="w-4 h-4 mr-2" />
                  {grade ? "Update Grade" : "Add Grade"}
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default GradeForm;