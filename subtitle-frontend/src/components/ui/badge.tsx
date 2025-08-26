import React from "react";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "outline";
  className?: string;
}

export function Badge({
  children,
  variant = "default",
  className = "",
}: BadgeProps) {
  const baseClasses =
    "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium";
  const variantClasses =
    variant === "outline"
      ? "border border-gray-200 text-gray-700"
      : "bg-gray-100 text-gray-800";

  return (
    <span className={`${baseClasses} ${variantClasses} ${className}`}>
      {children}
    </span>
  );
}
