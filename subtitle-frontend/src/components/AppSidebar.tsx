import { useLocation, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  useState,
  useEffect,
  ForwardRefExoticComponent,
  RefAttributes,
} from "react";
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
  ChevronDown,
  LucideProps,
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
import { permissions } from "@/config/permissions";

// Navigation item types
type RegularMenuItem = {
  title: string;
  url: string;
  icon: ForwardRefExoticComponent<
    Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>
  >;
  subItems?: never;
};

type DropdownMenuItem = {
  title: string;
  icon: ForwardRefExoticComponent<
    Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>
  >;
  subItems: { title: string; url: string }[];
  url?: never;
};

type NavigationItem = RegularMenuItem | DropdownMenuItem;

// Bottom item types
type RegularBottomItem = {
  title: string;
  url: string;
  icon: ForwardRefExoticComponent<
    Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>
  >;
  action?: never;
};

type ActionBottomItem = {
  title: string;
  icon: ForwardRefExoticComponent<
    Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>
  >;
  action: string;
  url?: never;
};

type BottomItem = RegularBottomItem | ActionBottomItem;

const useMediaQuery = (query: string) => {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    const listener = () => {
      setMatches(media.matches);
    };

    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, [matches, query]);
  return matches;
};

// All available navigation items
const navigationItems: NavigationItem[] = [
  { title: "Overview", url: "/", icon: LayoutDashboard },
  {
    title: "Correction",
    icon: FileText,
    subItems: [
      { title: "Activities", url: "/CorrectionActivities" },
      { title: "Prediction Daily", url: "/CorrectionPredictionDaily" },
      { title: "Prediction 10 Days", url: "/CorrectionPrediction10Days" },
    ],
  },
  { title: "Activities", url: "/Activities", icon: FileText },
  { title: "PredictionsDaily", url: "/PredictionsDaily", icon: FileText },
  { title: "Predictions10Days", url: "/Predictions10Days", icon: FileText },

  { title: "Translate", url: "/translate", icon: FileText },
  { title: "Uploader", url: "/Uploader", icon: FileText },
  { title: "Task Status", url: "/TaskStatus", icon: FileText },
  { title: "Update User Status", url: "/UpdateUserStatus", icon: FileText },
  { title: "Task Assignment", url: "/assign-task", icon: UserPlus },
  { title: "Stats Youtube", url: "/stats-youtube", icon: BarChart3 },
  { title: "Approve", url: "/Approver", icon: FileText },
  { title: "User-info", url: "/user-info", icon: User },
  { title: "VTT files stats", url: "/vtt-files-stats", icon: FileText },
  { title: "Activity Parameters", url: "./ActivityParameters", icon: FileText },
  // { title: "subtitle editor", url: "./SubtitleEditor", icon: FileText },
];

// Bottom menu items
const bottomItems: BottomItem[] = [
  { title: "Settings", url: "/settings", icon: Settings },
  { title: "Help & Support", url: "/help-support", icon: HelpCircle },
  { title: "Logout", icon: LogOut, action: "logout" },
];

export function AppSidebar() {
  const { state, toggleMobile } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const isSmallScreen = useMediaQuery("(max-width: 768px)");
  const collapsed = state === "collapsed";

  const handleLogout = () => {
    logout();
    navigate("/login");
    if (isSmallScreen) {
      toggleMobile();
    }
  };

  const handleNavigation = () => {
    if (isSmallScreen) {
      toggleMobile();
    }
  };

  const getNavCls = (isActive: boolean) =>
    isActive
      ? "text-black font-semibold bg-gray-100"
      : "text-gray-400 hover:text-black hover:bg-gray-50";

  useEffect(() => {
    // Check if the current path belongs to a sub-menu and open it
    const activeParent = navigationItems.find((item) => {
      if ("subItems" in item) {
        return item.subItems.some((sub) =>
          location.pathname.startsWith(sub.url)
        );
      }
      return false;
    });

    if (activeParent) {
      setOpenMenu(activeParent.title);
    }
  }, [location.pathname]);

  // Conditional Filtering Logic
  // Replace the filtering logic section with this:
  const filteredNavigationItems = user
    ? navigationItems.reduce((acc, item) => {
        const userRole = user.role;
        const allowedPages =
          permissions[userRole as keyof typeof permissions] || [];

        // Admins see everything
        if (userRole === "admin") {
          acc.push(item);
          return acc;
        }

        // Handle items with sub-menus (like "Correction")
        if ("subItems" in item) {
          const allowedSubItems = item.subItems.filter((subItem) =>
            allowedPages.includes(subItem.title)
          );

          if (allowedSubItems.length > 0) {
            // Explicitly construct DropdownMenuItem without spreading
            const filteredDropdownItem: DropdownMenuItem = {
              title: item.title,
              icon: item.icon,
              subItems: allowedSubItems,
            };
            acc.push(filteredDropdownItem);
          }
        }
        // Handle regular menu items
        else if (allowedPages.includes(item.title)) {
          acc.push(item);
        }

        return acc;
      }, [] as NavigationItem[])
    : [];

  const filteredBottomItems = user
    ? bottomItems.filter((item) => {
        if ("action" in item) return true; // Always show logout
        if (user.role !== "admin" && item.title === "Settings") {
          return false;
        }
        return true;
      })
    : bottomItems.filter(
        (item) => "action" in item && item.action === "logout"
      );

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
                {filteredNavigationItems.map((item) => {
                  // If item has subItems, render a collapsible dropdown
                  if ("subItems" in item) {
                    const isParentActive = item.subItems.some((sub) =>
                      location.pathname.startsWith(sub.url)
                    );
                    const isOpen = openMenu === item.title;
                    return (
                      <SidebarMenuItem key={item.title}>
                        <button
                          onClick={() =>
                            setOpenMenu(isOpen ? null : item.title)
                          }
                          className={`h-11 w-full flex items-center justify-between rounded-lg px-3 py-2 transition-colors duration-200 ${getNavCls(
                            isParentActive
                          )}`}
                        >
                          <div className="flex items-center">
                            <item.icon
                              className={`h-5 w-5 ${collapsed ? "" : "mr-3"} ${
                                isParentActive ? "text-black" : "text-gray-400"
                              }`}
                            />
                            {!collapsed && <span>{item.title}</span>}
                          </div>
                          {!collapsed && (
                            <ChevronDown
                              className={`h-4 w-4 transition-transform duration-200 ${
                                isOpen ? "rotate-180" : ""
                              }`}
                            />
                          )}
                        </button>
                        {/* Render sub-menu if it's open and the sidebar is not collapsed */}
                        {!collapsed && isOpen && (
                          <div className="mt-1 space-y-1">
                            {item.subItems.map((subItem) => (
                              <NavLink
                                key={subItem.url}
                                to={subItem.url}
                                onClick={handleNavigation}
                              >
                                {({ isActive }) => (
                                  <div
                                    className={`w-full rounded-lg px-3 py-2 flex items-center transition-colors duration-200 pl-12 h-11 ${getNavCls(
                                      isActive
                                    )}`}
                                  >
                                    <span>{subItem.title}</span>
                                  </div>
                                )}
                              </NavLink>
                            ))}
                          </div>
                        )}
                      </SidebarMenuItem>
                    );
                  }

                  // Otherwise, render a normal link
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild className="h-11 w-full">
                        <NavLink to={item.url} onClick={handleNavigation}>
                          {({ isActive }) => (
                            <div
                              className={`rounded-lg px-3 py-2 flex items-center transition-colors duration-200 ${getNavCls(
                                isActive
                              )}`}
                            >
                              <item.icon
                                className={`h-5 w-5 ${
                                  collapsed ? "" : "mr-3"
                                } ${isActive ? "text-black" : "text-gray-400"}`}
                              />
                              {!collapsed && <span>{item.title}</span>}
                            </div>
                          )}
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
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
                        {"action" in item ? (
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
                          <NavLink to={item.url} onClick={handleNavigation}>
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

      <SidebarOverlay />
    </>
  );
}

// import { useLocation, NavLink, useNavigate } from "react-router-dom";
// import { useAuth } from "@/contexts/AuthContext";
// import {
//   useState,
//   useEffect,
//   useInsertionEffect,
//   ForwardRefExoticComponent,
//   RefAttributes,
// } from "react";
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
//   ChevronDown,
//   LucideProps,
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
// import { permissions } from "@/config/permissions";
// type RegularMenuItem = {
//   title: string;
//   url: string;
//   icon: ForwardRefExoticComponent<
//     Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>
//   >;
//   subItems?: never;
// };

// type DropdownMenuItem = {
//   title: string;
//   icon: ForwardRefExoticComponent<
//     Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>
//   >;
//   subItems: { title: string; url: string }[];
//   url?: never;
// };

// type NavigationItem = RegularMenuItem | DropdownMenuItem;
// const useMediaQuery = (query: string) => {
//   const [matches, setMatches] = useState(false);
//   useEffect(() => {
//     const media = window.matchMedia(query);
//     if (media.matches !== matches) {
//       setMatches(media.matches);
//     }
//     const listener = () => {
//       setMatches(media.matches);
//     };

//     media.addEventListener("change", listener);
//     return () => media.removeEventListener("change", listener);
//   }, [matches, query]);
//   return matches;
// };

// // All available navigation items
// const navigationItems: NavigationItem[] = [
//   { title: "Overview", url: "/", icon: LayoutDashboard },
//   { title: "Activities", url: "/Activities", icon: FileText },
//   { title: "PredictionsDaily", url: "/PredictionsDaily", icon: FileText },
//   { title: "Predictions10Days", url: "/Predictions10Days", icon: FileText },
//   {
//     title: "Correction",
//     icon: FileText,
//     subItems: [
//       { title: "Activities", url: "/CorrectionActivities" },
//       { title: "Prediction Daily", url: "/CorrectionPredictionDaily" },
//       { title: "Prediction 10 Days", url: "/CorrectionPrediction10Days" },
//     ],
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

// // Bottom menu items
// const bottomItems = [
//   { title: "Settings", url: "/settings", icon: Settings },
//   { title: "Help & Support", url: "/help-support", icon: HelpCircle },
//   { title: "Logout", icon: LogOut, action: "logout" },
// ];

// // Dummy permission check
// const hasPermission = (role: string, page: string) => {
//   // Replace with actual permission logic
//   return true;
// };

// // Dummy role-based filter function
// const getFilteredNavigationItems = (role: string, items: any[]) => {
//   // Replace with actual logic based on `role`
//   return items; // For now, return all
// };

// export function AppSidebar() {
//   const { state, toggleMobile } = useSidebar();
//   const location = useLocation();
//   const navigate = useNavigate();
//   const { user, logout } = useAuth();
//   const [openMenu, setOpenMenu] = useState<string | null>(null);
//   const isSmallScreen = useMediaQuery("(max-width: 768px)");
//   const collapsed = state === "collapsed";

//   const handleLogout = () => {
//     logout();
//     navigate("/login");
//     if (isSmallScreen) {
//       toggleMobile();
//     }
//   };
//   const handleNavigation = () => {
//     if (isSmallScreen) {
//       toggleMobile();
//     }
//   };
//   const getNavCls = (isActive: boolean) =>
//     isActive
//       ? "text-black font-semibold bg-gray-100"
//       : "text-gray-400 hover:text-black hover:bg-gray-50";

//   useEffect(() => {
//     // Check if the current path belongs to a sub-menu and open it
//     const activeParent = navigationItems.find((item) =>
//       item.subItems?.some((sub) => location.pathname.startsWith(sub.url))
//     );
//     if (activeParent) {
//       setOpenMenu(activeParent.title);
//     }
//   }, [location.pathname]);

//   // ----------------------------------------
//   // Conditional Filtering Logic
//   // ----------------------------------------
//   const filteredNavigationItems = user
//     ? navigationItems.reduce((acc, item) => {
//         const userRole = user.role;
//         const allowedPages =
//           permissions[userRole as keyof typeof permissions] || [];

//         // Admins see everything
//         if (userRole === "admin") {
//           acc.push(item);
//           return acc;
//         }

//         // Handle items with sub-menus (like "Correction")
//         if (item.subItems) {
//           const allowedSubItems = item.subItems.filter((subItem) =>
//             allowedPages.includes(subItem.title)
//           );

//           if (allowedSubItems.length > 0) {
//             // If the user can see at least one sub-item, show the parent
//             // with only the allowed sub-items.
//             acc.push({ ...item, subItems: allowedSubItems });
//           }
//         }
//         // Handle regular menu items
//         else if (allowedPages.includes(item.title)) {
//           acc.push(item);
//         }

//         return acc;
//       }, [] as typeof navigationItems)
//     : [];

//   const filteredBottomItems = user
//     ? bottomItems.filter((item) => {
//         if (user.role !== "admin" && item.title === "Settings") {
//           return false;
//         }
//         return true;
//       })
//     : bottomItems.filter((item) => item.action === "logout");

//   // if (user?.username === "b.dhanumjaya@gmail.com") {
//   //   // Only show Correction Activities + Logout
//   //   filteredNavigationItems = navigationItems.filter(
//   //     (item) => item.title === "Correction Activities"
//   //   );
//   //   filteredBottomItems = bottomItems.filter(
//   //     (item) => item.action === "logout"
//   //   );
//   // } else if (user) {
//   //   // Filter by role
//   //   filteredNavigationItems = getFilteredNavigationItems(
//   //     user.role,
//   //     navigationItems
//   //   );
//   //   filteredBottomItems = bottomItems.filter((item) => {
//   //     if (item.title === "Settings") {
//   //       return hasPermission(user.role, "Settings");
//   //     }
//   //     return true;
//   //   });
//   // }

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
//                 {/* =============================================================== */}
//                 {/* START: UPDATED RENDERING LOGIC WITH DROPDOWN SUPPORT           */}
//                 {/* =============================================================== */}
//                 {filteredNavigationItems.map((item) => {
//                   // If item has subItems, render a collapsible dropdown
//                   if (item.subItems) {
//                     const isParentActive = item.subItems.some((sub) =>
//                       location.pathname.startsWith(sub.url)
//                     );
//                     const isOpen = openMenu === item.title;
//                     return (
//                       <SidebarMenuItem key={item.title}>
//                         <button
//                           onClick={() =>
//                             setOpenMenu(isOpen ? null : item.title)
//                           }
//                           className={`h-11 w-full flex items-center justify-between rounded-lg px-3 py-2 transition-colors duration-200 ${getNavCls(
//                             isParentActive
//                           )}`}
//                         >
//                           <div className="flex items-center">
//                             <item.icon
//                               className={`h-5 w-5 ${collapsed ? "" : "mr-3"} ${
//                                 isParentActive ? "text-black" : "text-gray-400"
//                               }`}
//                             />
//                             {!collapsed && <span>{item.title}</span>}
//                           </div>
//                           {!collapsed && (
//                             <ChevronDown
//                               className={`h-4 w-4 transition-transform duration-200 ${
//                                 isOpen ? "rotate-180" : ""
//                               }`}
//                             />
//                           )}
//                         </button>
//                         {/* Render sub-menu if it's open and the sidebar is not collapsed */}
//                         {!collapsed && isOpen && (
//                           <div className="mt-1 space-y-1">
//                             {item.subItems.map((subItem) => (
//                               <NavLink
//                                 key={subItem.url}
//                                 to={subItem.url}
//                                 onClick={handleNavigation}
//                               >
//                                 {({ isActive }) => (
//                                   <div
//                                     className={`w-full rounded-lg px-3 py-2 flex items-center transition-colors duration-200 pl-12 h-11 ${getNavCls(
//                                       isActive
//                                     )}`}
//                                   >
//                                     <span>{subItem.title}</span>
//                                   </div>
//                                 )}
//                               </NavLink>
//                             ))}
//                           </div>
//                         )}
//                       </SidebarMenuItem>
//                     );
//                   }

//                   // Otherwise, render a normal link
//                   return (
//                     <SidebarMenuItem key={item.title}>
//                       <SidebarMenuButton asChild className="h-11 w-full">
//                         <NavLink to={item.url!} onClick={handleNavigation}>
//                           {({ isActive }) => (
//                             <div
//                               className={`rounded-lg px-3 py-2 flex items-center transition-colors duration-200 ${getNavCls(
//                                 isActive
//                               )}`}
//                             >
//                               <item.icon
//                                 className={`h-5 w-5 ${
//                                   collapsed ? "" : "mr-3"
//                                 } ${isActive ? "text-black" : "text-gray-400"}`}
//                               />
//                               {!collapsed && <span>{item.title}</span>}
//                             </div>
//                           )}
//                         </NavLink>
//                       </SidebarMenuButton>
//                     </SidebarMenuItem>
//                   );
//                 })}
//                 {/* =============================================================== */}
//                 {/* END: UPDATED RENDERING LOGIC                                  */}
//                 {/* =============================================================== */}
//               </SidebarMenu>
//             </SidebarGroupContent>
//           </SidebarGroup>

//           {/* Bottom Items */}
//           <div className="mt-auto">
//             <SidebarGroup>
//               <SidebarGroupContent>
//                 <SidebarMenu className="space-y-1">
//                   {filteredBottomItems.map((item) => (
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
//                           <NavLink to={item.url!} onClick={handleNavigation}>
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

//       <SidebarOverlay />
//     </>
//   );
// }
