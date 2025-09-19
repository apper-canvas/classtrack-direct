import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/atoms/Card";
import Badge from "@/components/atoms/Badge";
import ApperIcon from "@/components/ApperIcon";

const StudentCard = ({ student, averageGrade }) => {
  const navigate = useNavigate();

  const getGradeBadgeVariant = (grade) => {
    if (grade >= 90) return "success";
    if (grade >= 80) return "primary";
    if (grade >= 70) return "warning";
    return "error";
  };

  const handleClick = () => {
    navigate(`/students/${student.Id}`);
  };

  return (
    <Card 
      className="cursor-pointer hover:shadow-xl transition-all duration-200 hover:scale-[1.02] bg-gradient-to-br from-white to-gray-50"
      onClick={handleClick}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center">
              <ApperIcon name="User" className="w-6 h-6 text-primary-700" />
            </div>
            <div>
              <h3 className="font-semibold text-lg text-gray-900">{student.name}</h3>
              <p className="text-sm text-gray-500">ID: {student.id}</p>
            </div>
          </div>
          {averageGrade !== undefined && (
            <Badge variant={getGradeBadgeVariant(averageGrade)}>
              {averageGrade.toFixed(1)}%
            </Badge>
          )}
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center text-sm text-gray-600">
            <ApperIcon name="Mail" className="w-4 h-4 mr-2" />
            {student.email}
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <ApperIcon name="Phone" className="w-4 h-4 mr-2" />
            {student.phone}
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <ApperIcon name="Calendar" className="w-4 h-4 mr-2" />
            Enrolled: {new Date(student.enrollmentDate).toLocaleDateString()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StudentCard;