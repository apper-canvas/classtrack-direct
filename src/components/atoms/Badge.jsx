import { forwardRef } from "react";
import { cn } from "@/utils/cn";

const Badge = forwardRef(({ className, variant = "default", ...props }, ref) => {
  const variants = {
    default: "bg-gray-100 text-gray-800 border-gray-200",
    primary: "bg-gradient-to-r from-primary-100 to-primary-200 text-primary-800 border-primary-300",
    success: "bg-gradient-to-r from-success-100 to-success-200 text-success-800 border-success-300",
    warning: "bg-gradient-to-r from-warning-100 to-warning-200 text-warning-800 border-warning-300",
    error: "bg-gradient-to-r from-error-100 to-error-200 text-error-800 border-error-300",
    secondary: "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 border-gray-300",
    outline: "border border-gray-300 text-gray-700 bg-transparent"
  };

  return (
    <div
      ref={ref}
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border",
        variants[variant],
        className
      )}
      {...props}
    />
  );
});

Badge.displayName = "Badge";

export default Badge;