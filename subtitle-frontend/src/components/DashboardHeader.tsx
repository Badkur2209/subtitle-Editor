import React from "react";
import { Search, Mail, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SidebarTrigger } from "@/components/ui/sidebar";

export function DashboardHeader() {
  return (
    <header className="h-16 border-b border-gray-200 bg-white px-6 flex items-center justify-between">
      <div className="flex items-center gap-4">
        {/* Sidebar toggle button visible only on small screens */}
        <SidebarTrigger className="lg:hidden" />

        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search"
            className="pl-10 w-80 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            aria-label="Search"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Mail icon button */}
        <Button
          variant="ghost"
          size="icon"
          className="text-gray-600 hover:text-gray-900"
          aria-label="Mail"
        >
          <Mail className="h-5 w-5" />
        </Button>

        {/* Notification bell button */}
        <Button
          variant="ghost"
          size="icon"
          className="text-gray-600 hover:text-gray-900"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
        </Button>

        {/* Logged in user info */}
        <div className="text-sm text-gray-600">
          Logged in as{" "}
          <span className="font-medium text-gray-900">Neeraj Pandey</span>
        </div>
      </div>
    </header>
  );
}

// import { Search, Mail, Bell } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { SidebarTrigger } from "@/components/ui/sidebar";

// export function DashboardHeader() {
//   return (
//     <header className="h-16 border-b border-gray-200 bg-white px-6 flex items-center justify-between">
//       <div className="flex items-center gap-4">
//         <SidebarTrigger className="lg:hidden" />
//         <div className="relative max-w-md">
//           <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
//           <Input
//             placeholder="Search"
//             className="pl-10 w-80 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
//           />
//         </div>
//       </div>

//       <div className="flex items-center gap-4">
//         <Button variant="ghost" size="icon" className="text-gray-600 hover:text-gray-900">
//           <Mail className="h-5 w-5" />
//         </Button>
//         <Button variant="ghost" size="icon" className="text-gray-600 hover:text-gray-900">
//           <Bell className="h-5 w-5" />
//         </Button>
//         <div className="text-sm text-gray-600">
//           Logged as in <span className="font-medium text-gray-900">Neeraj Pandey</span>
//         </div>
//       </div>
//     </header>
//   );
// }
