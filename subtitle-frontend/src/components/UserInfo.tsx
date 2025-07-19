import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { User } from "lucide-react";

export function UserInfo() {
  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <User className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-semibold">User Info</h3>
      </div>
      
      <div className="text-center space-y-4">
        {/* Avatar */}
        <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto flex items-center justify-center">
          <User className="w-8 h-8 text-gray-400" />
        </div>
        
        {/* User Details */}
        <div>
          <h4 className="font-semibold text-base">Neeraj Pandey</h4>
          <p className="text-sm text-muted-foreground">Neeraj Pandey</p>
        </div>
        
        {/* Plan and Usage */}
        <div className="space-y-4 pt-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Plan</span>
            <span className="text-sm font-medium">Premium</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Files Used</span>
            <span className="text-sm font-medium">47/100</span>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Storage</span>
              <span className="text-sm font-medium">2.4GB/10GB</span>
            </div>
            <Progress value={24} className="h-2" />
          </div>
        </div>
      </div>
    </Card>
  );
}