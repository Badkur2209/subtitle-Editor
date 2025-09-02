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

const navigationItems = [
  { title: "Overview", url: "/", icon: LayoutDashboard },
  { title: "Activities", url: "/Activities", icon: FileText },
  { title: "PredictionsDaily", url: "/PredictionsDaily", icon: FileText },
  { title: "Predictions10Days", url: "/Predictions10Days", icon: FileText },
  { title: "Uploader", url: "/Uploader", icon: FileText },
  { title: "Task Status", url: "/UserManagement", icon: FileText },
  { title: "Update User Status", url: "/UpdateUserStatus", icon: FileText },
  { title: "Task Assignment", url: "/assign-task", icon: UserPlus },
  { title: "Stats Youtube", url: "/stats-youtube", icon: BarChart3 },
  { title: "User-info", url: "/user-info", icon: User },
  { title: "VTT files stats", url: "/vtt-files-stats", icon: FileText },
  { title: "Translate", url: "/translate", icon: FileText },
];

const bottomItems = [
  { title: "Settings", url: "/settings", icon: Settings },
  { title: "Help & Support", url: "/help-support", icon: HelpCircle },
  { title: "Logout", icon: LogOut, action: "logout" },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const collapsed = state === "collapsed";

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const getNavCls = (isActive: boolean) =>
    isActive
      ? "text-black font-semibold bg-gray-100"
      : "text-gray-400 hover:text-black hover:bg-gray-50";

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
                {navigationItems.map((item) => (
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
                  {bottomItems.map((item) => (
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

// import { useLocation, NavLink, useNavigate } from "react-router-dom";
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
//   { title: "Uploader", url: "/Uploader", icon: FileText },
//   { title: "Task Status", url: "/UserManagement", icon: FileText },
//   { title: "Update User Status", url: "/UpdateUserStatus", icon: FileText },
//   { title: "Task Assignment", url: "/assign-task", icon: UserPlus },
//   { title: "Stats Youtube", url: "/stats-youtube", icon: BarChart3 },
//   { title: "User-info", url: "/user-info", icon: User },
//   { title: "VTT files stats", url: "/vtt-files-stats", icon: FileText },
//   { title: "Translate", url: "/translate", icon: FileText },
// ];

// // Add an action field to logout
// const bottomItems = [
//   { title: "Settings", url: "/settings", icon: Settings },
//   { title: "Help & Support", url: "/help-support", icon: HelpCircle },
//   { title: "Logout", icon: LogOut, action: "logout" }, // No URL — action instead
// ];

// export function AppSidebar() {
//   const { state } = useSidebar();
//   const location = useLocation();
//   const navigate = useNavigate();

//   const collapsed = state === "collapsed";
//   const currentPath = location.pathname;

//   const { logout } = useAuth();

//   const handleLogout = () => {
//     logout();
//     navigate("/login"); // Redirect after logout
//   };

//   const isActive = (path: string) => currentPath === path;

//   const getNavCls = ({ isActive }: { isActive: boolean }) =>
//     isActive
//       ? "bg-sidebar-primary text-sidebar-primary-foreground font-medium rounded-lg"
//       : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground rounded-lg";

//   return (
//     <Sidebar
//       className={`border-r border-sidebar-border ${
//         collapsed ? "w-16" : "w-64"
//       }`}
//     >
//       <SidebarContent className="bg-sidebar p-4">
//         {/* Logo */}
//         <div className="flex items-center gap-3 mb-8 px-2">
//           <div className="w-8 h-8 bg-blue-stat rounded-lg flex items-center justify-center">
//             <Play className="w-5 h-5 text-white fill-white" />
//           </div>
//           {!collapsed && (
//             <span className="text-lg font-semibold text-foreground">
//               Subtitle Editor
//             </span>
//           )}
//         </div>

//         {/* Main Navigation */}
//         <SidebarGroup>
//           <SidebarGroupContent>
//             <SidebarMenu className="space-y-1">
//               {navigationItems.map((item) => (
//                 <SidebarMenuItem key={item.title}>
//                   <SidebarMenuButton asChild className="h-11">
//                     <NavLink to={item.url} className={getNavCls}>
//                       <item.icon
//                         className={`h-5 w-5 ${collapsed ? "" : "mr-3"}`}
//                       />
//                       {!collapsed && <span>{item.title}</span>}
//                     </NavLink>
//                   </SidebarMenuButton>
//                 </SidebarMenuItem>
//               ))}
//             </SidebarMenu>
//           </SidebarGroupContent>
//         </SidebarGroup>

//         {/* Bottom Navigation */}
//         <div className="mt-auto">
//           <SidebarGroup>
//             <SidebarGroupContent>
//               <SidebarMenu className="space-y-1">
//                 {bottomItems.map((item) => (
//                   <SidebarMenuItem key={item.title}>
//                     <SidebarMenuButton asChild className="h-11">
//                       {item.action === "logout" ? (
//                         <button
//                           onClick={handleLogout}
//                           className={getNavCls({ isActive: false })}
//                         >
//                           <item.icon
//                             className={`h-5 w-5 ${collapsed ? "" : "mr-3"}`}
//                           />
//                           {!collapsed && <span>{item.title}</span>}
//                         </button>
//                       ) : (
//                         <NavLink to={item.url!} className={getNavCls}>
//                           <item.icon
//                             className={`h-5 w-5 ${collapsed ? "" : "mr-3"}`}
//                           />
//                           {!collapsed && <span>{item.title}</span>}
//                         </NavLink>
//                       )}
//                     </SidebarMenuButton>
//                   </SidebarMenuItem>
//                 ))}
//               </SidebarMenu>
//             </SidebarGroupContent>
//           </SidebarGroup>
//         </div>
//       </SidebarContent>
//     </Sidebar>
//   );
// }

// // import { useState } from "react";
// // import { NavLink, useLocation } from "react-router-dom";
// // import { useAuth } from "@/contexts/AuthContext";

// // import {
// //   LayoutDashboard,
// //   UserPlus,
// //   BarChart3,
// //   User,
// //   FileText,
// //   Settings,
// //   HelpCircle,
// //   LogOut,
// //   Play,
// // } from "lucide-react";
// // import {
// //   Sidebar,
// //   SidebarContent,
// //   SidebarGroup,
// //   SidebarGroupContent,
// //   SidebarMenu,
// //   SidebarMenuButton,
// //   SidebarMenuItem,
// //   useSidebar,
// // } from "@/components/ui/sidebar";
// // import { title } from "process";

// // const navigationItems = [
// //   { title: "Overview", url: "/", icon: LayoutDashboard },
// //   { title: "Activities", url: "/Activities", icon: FileText },
// //   { title: "PredictionsDaily", url: "/PredictionsDaily", icon: FileText },
// //   { title: "Predictions10Days", url: "/Predictions10Days", icon: FileText },
// //   { title: "Uploader", url: "/Uploader", icon: FileText },
// //   { title: "Task Status", url: "/UserManagement", icon: FileText },
// //   { title: "Update User Status", url: "/UpdateUserStatus", icon: FileText },

// //   { title: "Task Assignment", url: "/assign-task", icon: UserPlus },
// //   { title: "Stats Youtube", url: "/stats-youtube", icon: BarChart3 },
// //   { title: "User-info", url: "/user-info", icon: User },
// //   { title: "VTT files stats", url: "/vtt-files-stats", icon: FileText },
// //   { title: "Translate", url: "/translate", icon: FileText },
// // ];

// // const bottomItems = [
// //   { title: "Settings", url: "/settings", icon: Settings },
// //   { title: "Help & Support", url: "/help-support", icon: HelpCircle },
// //   { title: "Logout", url: "/logout", icon: LogOut },
// // ];

// // export function AppSidebar() {
// //   const { state } = useSidebar();
// //   const location = useLocation();
// //   const currentPath = location.pathname;
// //   const collapsed = state === "collapsed";
// //   // In your sidebar component
// //   const { logout } = useAuth();

// //   const isActive = (path: string) => currentPath === path;

// //   const getNavCls = ({ isActive }: { isActive: boolean }) =>
// //     isActive
// //       ? "bg-sidebar-primary text-sidebar-primary-foreground font-medium rounded-lg"
// //       : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground rounded-lg";

// //   return (
// //     <Sidebar
// //       className={`border-r border-sidebar-border ${
// //         collapsed ? "w-16" : "w-64"
// //       }`}
// //     >
// //       <SidebarContent className="bg-sidebar p-4">
// //         {/* Logo */}
// //         <div className="flex items-center gap-3 mb-8 px-2">
// //           <div className="w-8 h-8 bg-blue-stat rounded-lg flex items-center justify-center">
// //             <Play className="w-5 h-5 text-white fill-white" />
// //           </div>
// //           {!collapsed && (
// //             <span className="text-lg font-semibold text-foreground">
// //               Subtitle Editor
// //             </span>
// //           )}
// //         </div>

// //         {/* Main Navigation */}
// //         <SidebarGroup>
// //           <SidebarGroupContent>
// //             <SidebarMenu className="space-y-1">
// //               {navigationItems.map((item) => (
// //                 <SidebarMenuItem key={item.title}>
// //                   <SidebarMenuButton asChild className="h-11">
// //                     <NavLink to={item.url} className={getNavCls}>
// //                       <item.icon
// //                         className={`h-5 w-5 ${collapsed ? "" : "mr-3"}`}
// //                       />
// //                       {!collapsed && <span>{item.title}</span>}
// //                     </NavLink>
// //                   </SidebarMenuButton>
// //                 </SidebarMenuItem>
// //               ))}
// //             </SidebarMenu>
// //           </SidebarGroupContent>
// //         </SidebarGroup>

// //         {/* Bottom Navigation */}
// //         <div className="mt-auto">
// //           <SidebarGroup>
// //             <SidebarGroupContent>
// //               <SidebarMenu className="space-y-1">
// //                 {bottomItems.map((item) => (
// //                   <SidebarMenuItem key={item.title}>
// //                     <SidebarMenuButton asChild className="h-11">
// //                       <NavLink to={item.url} className={getNavCls}>
// //                         <item.icon
// //                           className={`h-5 w-5 ${collapsed ? "" : "mr-3"}`}
// //                         />
// //                         {!collapsed && <span>{item.title}</span>}
// //                       </NavLink>
// //                     </SidebarMenuButton>
// //                   </SidebarMenuItem>
// //                 ))}
// //               </SidebarMenu>
// //             </SidebarGroupContent>
// //           </SidebarGroup>
// //         </div>
// //       </SidebarContent>
// //     </Sidebar>
// //   );
// // }
