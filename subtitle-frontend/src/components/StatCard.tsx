import { Card } from "@/components/ui/card";

interface StatCardProps {
  title: string;
  value: string;
  subtitle: string;
  trend: string;
  trendDirection: "up" | "down";
  variant: "blue" | "red" | "green" | "purple";
}

export function StatCard({ title, value, subtitle, trend, trendDirection, variant }: StatCardProps) {
  const getVariantClasses = () => {
    switch (variant) {
      case "blue":
        return "bg-blue-stat text-white";
      case "red":
        return "bg-red-stat text-white";
      case "green":
        return "bg-green-stat text-white";
      case "purple":
        return "bg-purple-stat text-white";
      default:
        return "bg-blue-stat text-white";
    }
  };

  const getTrendColor = () => {
    if (variant === "purple") {
      return trendDirection === "up" ? "text-red-200" : "text-green-200";
    }
    return trendDirection === "up" ? "text-green-200" : "text-red-200";
  };

  return (
    <Card className={`p-6 rounded-xl ${getVariantClasses()}`}>
      <div className="space-y-3">
        <h3 className="text-sm font-medium opacity-90">{title}</h3>
        <div className="space-y-1">
          <div className="text-3xl font-bold">{value}</div>
          <div className="text-sm opacity-90">{subtitle}</div>
          <div className={`text-xs font-medium ${getTrendColor()}`}>
            {trendDirection === "up" ? "+" : ""}{trend} last month
          </div>
        </div>
      </div>
    </Card>
  );
}