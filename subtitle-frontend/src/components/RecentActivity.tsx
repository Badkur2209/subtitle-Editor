import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface ActivityItem {
  id: string;
  name: string;
  uploadedTime: string;
  status: "processing" | "completed" | "queued";
  progress?: number;
  subtitleCount?: number;
}

const activityData: ActivityItem[] = [
  {
    id: "1",
    name: "Tutorial Part 1.vtt",
    uploadedTime: "2 hours ago",
    status: "processing",
    progress: 65,
  },
  {
    id: "2",
    name: "Introduction Video.vtt",
    uploadedTime: "4 hours ago",
    status: "completed",
    subtitleCount: 134,
  },
  {
    id: "3",
    name: "Product Demo.vtt",
    uploadedTime: "Product Demo.vtt",
    status: "queued",
  },
];

export function RecentActivity() {
  const getStatusBadge = (status: ActivityItem["status"]) => {
    switch (status) {
      case "processing":
        return <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-md">Processing</span>;
      case "completed":
        return <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-md">Completed</span>;
      case "queued":
        return <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-md">Queued</span>;
      default:
        return null;
    }
  };

  const getStatusDetail = (item: ActivityItem) => {
    switch (item.status) {
      case "processing":
        return (
          <div className="space-y-2">
            <Progress value={item.progress} className="h-2" />
          </div>
        );
      case "completed":
        return <div className="text-sm text-muted-foreground">{item.subtitleCount} subtitles</div>;
      case "queued":
        return <div className="text-sm text-muted-foreground">Waiting...</div>;
      default:
        return null;
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-5 h-5 bg-red-100 rounded flex items-center justify-center">
          <div className="w-2 h-2 bg-red-500 rounded"></div>
        </div>
        <h3 className="text-lg font-semibold">Recent Activity</h3>
      </div>
      
      <div className="space-y-4">
        {activityData.map((item) => (
          <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-sm">{item.name}</h4>
                {getStatusBadge(item.status)}
              </div>
              <div className="text-xs text-blue-600 mb-2">
                Uploaded {item.uploadedTime}
              </div>
              {getStatusDetail(item)}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}