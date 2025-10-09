// App.tsx
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { DashboardHeader } from "@/components/DashboardHeader";

// Import your pages
import Dashboard from "./pages/Dashboard";
import AssignTask from "./pages/AssignTask";
import StatsYoutube from "./pages/StatsYoutube";
import UserInfoPage from "./pages/UserInfoPage";
import VTTFilesStats from "./pages/VTTFilesStats";
import SettingsPage from "./pages/SettingsPage";
import HelpSupport from "./pages/HelpSupport";
import NotFound from "./pages/NotFound";
import Translate from "./pages/Translate";
import PredictionsDaily from "./pages/PredictionsDaily";
import Predictions10Days from "./pages/Predictions10Days";
import TaskStatus from "./pages/TaskStatus";
import UpdateUserStatus from "./pages/UpdateUserStatus";
import Activities from "./pages/Activities";
import Uploader from "./pages/Uploader";
import Login from "./pages/Login";
import Approver from "./pages/Approver";
import CorrectionActivities from "./pages/CorrectionActivities";
import CorrectionPredictionDaily from "./pages/CorrectionPredictionDaily";
import CorrectionPrediction10Days from "./pages/CorrectionPrediction10Days";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import ActivityParameters from "./pages/ActivityParameters";

const queryClient = new QueryClient();

// A simpler layout component that renders the sidebar, header, and a placeholder for the page content.
const AppLayout = () => (
  <SidebarProvider>
    <div className="min-h-screen flex w-full bg-gray-50">
      <AppSidebar />
      <div className="flex-1 flex flex-col">
        <DashboardHeader />
        <main className="flex-1 overflow-auto p-4 md:p-6">
          <Outlet /> {/* Child routes will be rendered here */}
        </main>
      </div>
    </div>
  </SidebarProvider>
);

// A route component specifically for the login page to handle redirection if already logged in.
const LoginRoute = () => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  return user ? <Navigate to="/" replace /> : <Login />;
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              {/* Public route */}
              <Route path="/login" element={<LoginRoute />} />
              {/* All routes inside are protected and use the AppLayout */}
              <Route element={<AppLayout />}>
                {/* Routes for ANY authenticated user */}
                <Route element={<ProtectedRoute />}>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/TaskStatus" element={<TaskStatus />} />
                  <Route path="/help-support" element={<HelpSupport />} />
                </Route>
                {/* <Route path="/subtitles" element={<VideoManagement />} />
                <Route
                  path="/subtitles/edit/:videoId"
                  element={<SubtitleEditor />}
                /> */}
                {/* Routes for Uploader */}
                <Route element={<ProtectedRoute allowedRoles={["uploader"]} />}>
                  <Route path="/uploader" element={<Uploader />} />
                </Route>

                {/* Routes for Assigner */}
                <Route element={<ProtectedRoute allowedRoles={["assigner"]} />}>
                  <Route path="/assign-task" element={<AssignTask />} />
                  <Route
                    path="/UpdateUserStatus"
                    element={<UpdateUserStatus />}
                  />
                  <Route path="/user-info" element={<UserInfoPage />} />
                </Route>

                {/* Routes for Translator */}
                <Route
                  element={<ProtectedRoute allowedRoles={["translator"]} />}
                >
                  <Route path="/translate" element={<Translate />} />
                </Route>

                {/* Routes for Editor */}
                <Route element={<ProtectedRoute allowedRoles={["editor"]} />}>
                  <Route
                    path="/CorrectionActivities"
                    element={<CorrectionActivities />}
                  />
                  <Route
                    path="/ActivityParameters"
                    element={<ActivityParameters />}
                  />
                  <Route
                    path="/CorrectionPredictionDaily"
                    element={<CorrectionPredictionDaily />}
                  />
                  <Route
                    path="/CorrectionPrediction10Days"
                    element={<CorrectionPrediction10Days />}
                  />
                </Route>

                {/* Routes for Reviewer */}
                <Route element={<ProtectedRoute allowedRoles={["reviewer"]} />}>
                  <Route path="/Approver" element={<Approver />} />
                </Route>

                {/* Routes ONLY for Admin */}
                <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
                  <Route path="/Activities" element={<Activities />} />
                  <Route
                    path="/PredictionsDaily"
                    element={<PredictionsDaily />}
                  />
                  <Route
                    path="/Predictions10Days"
                    element={<Predictions10Days />}
                  />
                  <Route path="/stats-youtube" element={<StatsYoutube />} />
                  <Route path="/vtt-files-stats" element={<VTTFilesStats />} />
                  <Route path="/settings" element={<SettingsPage />} />
                </Route>
              </Route>{" "}
              {/* End of AppLayout */}
              {/* Fallback Not Found Route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
