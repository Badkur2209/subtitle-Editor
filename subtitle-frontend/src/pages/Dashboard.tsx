import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { RecentActivity } from "@/components/RecentActivity";
import { UserInfo } from "@/components/UserInfo";
import { VTTFilesTable } from "@/components/VTTFilesTable";

export default function Dashboard() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Subtitle Dashboard</h1>
          <p className="text-gray-600">Manage and analyze your subtitle files with powerful insights</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
          <Plus className="w-4 h-4 mr-2" />
          Create New Subtitle
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Subtitles"
          value="47"
          subtitle="Active subtitle files"
          trend="+12%"
          trendDirection="up"
          variant="blue"
        />
        <StatCard
          title="YouTube Videos"
          value="25"
          subtitle="Videos with subtitles"
          trend="+11%"
          trendDirection="up"
          variant="red"
        />
        <StatCard
          title="Total Users"
          value="1,247"
          subtitle="Active users"
          trend="+5%"
          trendDirection="up"
          variant="green"
        />
        <StatCard
          title="Processing Time"
          value="2.4m"
          subtitle="Average processing"
          trend="-14%"
          trendDirection="down"
          variant="purple"
        />
      </div>

      {/* Activity and User Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentActivity />
        </div>
        <div>
          <UserInfo />
        </div>
      </div>

      {/* VTT Files Table */}
      <VTTFilesTable />
    </div>
  );
}