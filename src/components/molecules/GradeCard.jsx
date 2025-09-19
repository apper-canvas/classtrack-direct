import { Card, CardContent } from "@/components/atoms/Card";
import Badge from "@/components/atoms/Badge";

const GradeCard = ({ grade, maxGrade, assignment, category, date }) => {
  const percentage = (grade / maxGrade) * 100;
  
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

  return (
    <Card className="hover:shadow-lg transition-all duration-200">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <h4 className="font-semibold text-gray-900 mb-1">{assignment}</h4>
            <p className="text-sm text-gray-500">{category}</p>
          </div>
          <Badge variant={getGradeBadgeVariant(percentage)}>
            {percentage.toFixed(1)}%
          </Badge>
        </div>
        <div className="flex justify-between items-center">
          <div className="text-lg font-bold text-gray-900">
            {grade}/{maxGrade}
          </div>
          <div className="text-sm text-gray-500">
            {formatDate(date)}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default GradeCard;