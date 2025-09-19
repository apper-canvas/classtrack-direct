import { useState } from "react";
import { toast } from "react-toastify";
import Button from "@/components/atoms/Button";
import FormField from "@/components/molecules/FormField";
import Input from "@/components/atoms/Input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/atoms/Card";
import ApperIcon from "@/components/ApperIcon";
import studentService from "@/services/api/studentService";
import classService from "@/services/api/classService";

const StudentForm = ({ student, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    id: student?.id || "",
    name: student?.name || "",
    email: student?.email || "",
    phone: student?.phone || "",
    classId: student?.classId || "",
    enrollmentDate: student?.enrollmentDate || new Date().toISOString().split("T")[0],
    parentContact: {
      name: student?.parentContact?.name || "",
      email: student?.parentContact?.email || "",
      phone: student?.parentContact?.phone || ""
    }
  });
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [classes, setClasses] = useState([]);

  useState(() => {
    loadClasses();
  }, []);

  const loadClasses = async () => {
    try {
      const classData = await classService.getAll();
      setClasses(classData);
    } catch (error) {
      console.error("Failed to load classes:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.startsWith("parent.")) {
      const field = name.replace("parent.", "");
      setFormData(prev => ({
        ...prev,
        parentContact: {
          ...prev.parentContact,
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }
    if (!formData.phone.trim()) newErrors.phone = "Phone is required";
    if (!formData.id.trim()) newErrors.id = "Student ID is required";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      let savedStudent;
      if (student?.Id) {
        savedStudent = await studentService.update(student.Id, formData);
        toast.success("Student updated successfully!");
      } else {
        savedStudent = await studentService.create(formData);
        toast.success("Student created successfully!");
      }
      
      onSave(savedStudent);
    } catch (error) {
      toast.error("Failed to save student. Please try again.");
      console.error("Error saving student:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <ApperIcon name="UserPlus" className="w-6 h-6 text-primary-600" />
          <span>{student ? "Edit Student" : "Add New Student"}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField label="Student ID" error={errors.id}>
              <Input
                name="id"
                value={formData.id}
                onChange={handleChange}
                placeholder="Enter student ID"
                disabled={!!student}
                error={errors.id}
              />
            </FormField>

            <FormField label="Full Name" error={errors.name}>
              <Input
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter full name"
                error={errors.name}
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField label="Email Address" error={errors.email}>
              <Input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter email address"
                error={errors.email}
              />
            </FormField>

            <FormField label="Phone Number" error={errors.phone}>
              <Input
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Enter phone number"
                error={errors.phone}
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField label="Class">
              <select
                name="classId"
                value={formData.classId}
                onChange={handleChange}
                className="flex w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Select a class</option>
                {classes.map(cls => (
<option key={cls.Id} value={cls.Id}>{cls.name}</option>
                ))}
              </select>
            </FormField>

            <FormField label="Enrollment Date">
              <Input
                name="enrollmentDate"
                type="date"
                value={formData.enrollmentDate}
                onChange={handleChange}
              />
            </FormField>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Parent/Guardian Contact</h3>
            
            <div className="space-y-4">
              <FormField label="Parent/Guardian Name">
                <Input
                  name="parent.name"
                  value={formData.parentContact.name}
                  onChange={handleChange}
                  placeholder="Enter parent/guardian name"
                />
              </FormField>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField label="Parent/Guardian Email">
                  <Input
                    name="parent.email"
                    type="email"
                    value={formData.parentContact.email}
                    onChange={handleChange}
                    placeholder="Enter parent/guardian email"
                  />
                </FormField>

                <FormField label="Parent/Guardian Phone">
                  <Input
                    name="parent.phone"
                    value={formData.parentContact.phone}
                    onChange={handleChange}
                    placeholder="Enter parent/guardian phone"
                  />
                </FormField>
              </div>
            </div>
          </div>

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
                  {student ? "Update Student" : "Create Student"}
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default StudentForm;