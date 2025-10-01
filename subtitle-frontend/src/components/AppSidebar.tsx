// import { useLocation, NavLink, useNavigate } from "react-router-dom";
// const { user } = useAuth();

// import { useAuth } from "@/contexts/AuthContext";
// import {
//   LayoutDashboard,
//   UserPlus,
//   BarChart3,
//   User,
//   FileText,
//   Settings,
//   HelpCircle,
//   LogOut,
//   Play,
// } from "lucide-react";
// import {
//   Sidebar,
//   SidebarOverlay,
//   SidebarContent,
//   SidebarGroup,
//   SidebarGroupContent,
//   SidebarMenu,
//   SidebarMenuButton,
//   SidebarMenuItem,
//   useSidebar,
// } from "@/components/ui/sidebar";

// const navigationItems = [
//   { title: "Overview", url: "/", icon: LayoutDashboard },
//   { title: "Activities", url: "/Activities", icon: FileText },
//   { title: "PredictionsDaily", url: "/PredictionsDaily", icon: FileText },
//   { title: "Predictions10Days", url: "/Predictions10Days", icon: FileText },
//   { title: "Correction", url: "/Correction", icon: FileText },
//   {
//     title: "Correction101",
//     url: "/Correction/Correction101",
//     icon: FileText,
//   },

//   {
//     title: "Correction Activities",
//     url: "/CorrectionActivities",
//     icon: FileText,
//   },
//   { title: "Translate", url: "/translate", icon: FileText },
//   { title: "Uploader", url: "/Uploader", icon: FileText },
//   { title: "Task Status", url: "/TaskStatus", icon: FileText },
//   { title: "Update User Status", url: "/UpdateUserStatus", icon: FileText },
//   { title: "Task Assignment", url: "/assign-task", icon: UserPlus },
//   { title: "Stats Youtube", url: "/stats-youtube", icon: BarChart3 },
//   { title: "Approve", url: "/Approver", icon: FileText },
//   { title: "User-info", url: "/user-info", icon: User },
//   { title: "VTT files stats", url: "/vtt-files-stats", icon: FileText },
// ];

// const bottomItems = [
//   { title: "Settings", url: "/settings", icon: Settings },
//   { title: "Help & Support", url: "/help-support", icon: HelpCircle },
//   { title: "Logout", icon: LogOut, action: "logout" },
// ];

// export function AppSidebar() {
//   const { state } = useSidebar();
//   const location = useLocation();
//   const navigate = useNavigate();
//   const { logout } = useAuth();

//   const collapsed = state === "collapsed";

//   const handleLogout = () => {
//     logout();
//     navigate("/login");
//   };

//   const getNavCls = (isActive: boolean) =>
//     isActive
//       ? "text-black font-semibold bg-gray-100"
//       : "text-gray-400 hover:text-black hover:bg-gray-50";

//   return (
//     <>
//       <Sidebar>
//         <SidebarContent className="bg-white p-4 overflow-y-auto">
//           {/* Logo */}
//           <div className="flex items-center gap-3 mb-8 px-2">
//             <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
//               <Play className="w-5 h-5 text-white" />
//             </div>
//             {!collapsed && (
//               <span className="text-lg font-semibold text-gray-800">
//                 Subtitle Editor
//               </span>
//             )}
//           </div>

//           {/* Navigation */}
//           <SidebarGroup>
//             <SidebarGroupContent>
//               <SidebarMenu className="space-y-1">
//                 {navigationItems.map((item) => (
//                   <SidebarMenuItem key={item.title}>
//                     <SidebarMenuButton asChild className="h-11 w-full">
//                       <NavLink to={item.url}>
//                         {({ isActive }) => (
//                           <div
//                             className={`rounded-lg px-3 py-2 flex items-center transition-colors duration-200 ${getNavCls(
//                               isActive
//                             )}`}
//                           >
//                             <item.icon
//                               className={`h-5 w-5 ${collapsed ? "" : "mr-3"} ${
//                                 isActive ? "text-black" : "text-gray-400"
//                               }`}
//                             />
//                             {!collapsed && <span>{item.title}</span>}
//                           </div>
//                         )}
//                       </NavLink>
//                     </SidebarMenuButton>
//                   </SidebarMenuItem>
//                 ))}
//               </SidebarMenu>
//             </SidebarGroupContent>
//           </SidebarGroup>

//           {/* Bottom Items */}
//           <div className="mt-auto">
//             <SidebarGroup>
//               <SidebarGroupContent>
//                 <SidebarMenu className="space-y-1">
//                   {bottomItems.map((item) => (
//                     <SidebarMenuItem key={item.title}>
//                       <SidebarMenuButton asChild className="h-11 w-full">
//                         {item.action === "logout" ? (
//                           <button
//                             onClick={handleLogout}
//                             className="flex items-center text-gray-400 hover:text-black hover:bg-gray-50 px-3 py-2 rounded-lg w-full transition-colors duration-200"
//                           >
//                             <item.icon
//                               className={`h-5 w-5 ${
//                                 collapsed ? "" : "mr-3"
//                               } text-gray-400`}
//                             />
//                             {!collapsed && <span>{item.title}</span>}
//                           </button>
//                         ) : (
//                           <NavLink to={item.url!}>
//                             {({ isActive }) => (
//                               <div
//                                 className={`rounded-lg px-3 py-2 flex items-center transition-colors duration-200 ${getNavCls(
//                                   isActive
//                                 )}`}
//                               >
//                                 <item.icon
//                                   className={`h-5 w-5 ${
//                                     collapsed ? "" : "mr-3"
//                                   } ${
//                                     isActive ? "text-black" : "text-gray-400"
//                                   }`}
//                                 />
//                                 {!collapsed && <span>{item.title}</span>}
//                               </div>
//                             )}
//                           </NavLink>
//                         )}
//                       </SidebarMenuButton>
//                     </SidebarMenuItem>
//                   ))}
//                 </SidebarMenu>
//               </SidebarGroupContent>
//             </SidebarGroup>
//           </div>
//         </SidebarContent>
//       </Sidebar>

//       {/* Overlay for mobile */}
//       <SidebarOverlay />
//     </>
//   );
// }
import { useLocation, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  LayoutDashboard,
  UserPlus,
  BarChart3,
  User,
  FileText,
  Settings,
  HelpCircle,
  LogOut,
  Play,
} from "lucide-react";
import {
  Sidebar,
  SidebarOverlay,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

// All available navigation items
const navigationItems = [
  { title: "Overview", url: "/", icon: LayoutDashboard },
  { title: "Activities", url: "/Activities", icon: FileText },
  { title: "PredictionsDaily", url: "/PredictionsDaily", icon: FileText },
  { title: "Predictions10Days", url: "/Predictions10Days", icon: FileText },
  { title: "Correction", url: "/Correction", icon: FileText },
  { title: "Correction101", url: "/Correction/Correction101", icon: FileText },
  {
    title: "Correction Activities",
    url: "/CorrectionActivities",
    icon: FileText,
  },
  {
    title: "Correction Prediction Daily",
    url: "/CorrectionPredictionDaily",
    icon: FileText,
  },
  {
    title: "Correction Prediction 10 Days",
    url: "/CorrectionPrediction10Days",
    icon: FileText,
  },
  { title: "Translate", url: "/translate", icon: FileText },
  { title: "Uploader", url: "/Uploader", icon: FileText },
  { title: "Task Status", url: "/TaskStatus", icon: FileText },
  { title: "Update User Status", url: "/UpdateUserStatus", icon: FileText },
  { title: "Task Assignment", url: "/assign-task", icon: UserPlus },
  { title: "Stats Youtube", url: "/stats-youtube", icon: BarChart3 },
  { title: "Approve", url: "/Approver", icon: FileText },
  { title: "User-info", url: "/user-info", icon: User },
  { title: "VTT files stats", url: "/vtt-files-stats", icon: FileText },
];

// Bottom menu items
const bottomItems = [
  { title: "Settings", url: "/settings", icon: Settings },
  { title: "Help & Support", url: "/help-support", icon: HelpCircle },
  { title: "Logout", icon: LogOut, action: "logout" },
];

// Dummy permission check
const hasPermission = (role: string, page: string) => {
  // Replace with actual permission logic
  return true;
};

// Dummy role-based filter function
const getFilteredNavigationItems = (role: string, items: any[]) => {
  // Replace with actual logic based on `role`
  return items; // For now, return all
};

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const collapsed = state === "collapsed";

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const getNavCls = (isActive: boolean) =>
    isActive
      ? "text-black font-semibold bg-gray-100"
      : "text-gray-400 hover:text-black hover:bg-gray-50";

  // ----------------------------------------
  // Conditional Filtering Logic
  // ----------------------------------------
  let filteredNavigationItems = [];
  let filteredBottomItems = bottomItems;

  if (user?.username === "b.dhanumjaya@gmail.com") {
    // Only show Correction Activities + Logout
    filteredNavigationItems = navigationItems.filter(
      (item) => item.title === "Correction Activities"
    );
    filteredBottomItems = bottomItems.filter(
      (item) => item.action === "logout"
    );
  } else if (user) {
    // Filter by role
    filteredNavigationItems = getFilteredNavigationItems(
      user.role,
      navigationItems
    );
    filteredBottomItems = bottomItems.filter((item) => {
      if (item.title === "Settings") {
        return hasPermission(user.role, "Settings");
      }
      return true;
    });
  }

  return (
    <>
      <Sidebar>
        <SidebarContent className="bg-white p-4 overflow-y-auto">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-8 px-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Play className="w-5 h-5 text-white" />
            </div>
            {!collapsed && (
              <span className="text-lg font-semibold text-gray-800">
                Subtitle Editor
              </span>
            )}
          </div>

          {/* Navigation */}
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu className="space-y-1">
                {filteredNavigationItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild className="h-11 w-full">
                      <NavLink to={item.url}>
                        {({ isActive }) => (
                          <div
                            className={`rounded-lg px-3 py-2 flex items-center transition-colors duration-200 ${getNavCls(
                              isActive
                            )}`}
                          >
                            <item.icon
                              className={`h-5 w-5 ${collapsed ? "" : "mr-3"} ${
                                isActive ? "text-black" : "text-gray-400"
                              }`}
                            />
                            {!collapsed && <span>{item.title}</span>}
                          </div>
                        )}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* Bottom Items */}
          <div className="mt-auto">
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu className="space-y-1">
                  {filteredBottomItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild className="h-11 w-full">
                        {item.action === "logout" ? (
                          <button
                            onClick={handleLogout}
                            className="flex items-center text-gray-400 hover:text-black hover:bg-gray-50 px-3 py-2 rounded-lg w-full transition-colors duration-200"
                          >
                            <item.icon
                              className={`h-5 w-5 ${
                                collapsed ? "" : "mr-3"
                              } text-gray-400`}
                            />
                            {!collapsed && <span>{item.title}</span>}
                          </button>
                        ) : (
                          <NavLink to={item.url!}>
                            {({ isActive }) => (
                              <div
                                className={`rounded-lg px-3 py-2 flex items-center transition-colors duration-200 ${getNavCls(
                                  isActive
                                )}`}
                              >
                                <item.icon
                                  className={`h-5 w-5 ${
                                    collapsed ? "" : "mr-3"
                                  } ${
                                    isActive ? "text-black" : "text-gray-400"
                                  }`}
                                />
                                {!collapsed && <span>{item.title}</span>}
                              </div>
                            )}
                          </NavLink>
                        )}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </div>
        </SidebarContent>
      </Sidebar>

      {/* Overlay for mobile */}
      <SidebarOverlay />
    </>
  );
}
