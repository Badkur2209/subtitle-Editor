import React from "react";

interface AlertProps {
  children: React.ReactNode;
  variant?: "default" | "destructive";
}

export function Alert({ children, variant = "default" }: AlertProps) {
  const classes =
    variant === "destructive"
      ? "bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded"
      : "bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded";

  return <div className={classes}>{children}</div>;
}

export function AlertDescription({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>;
}
