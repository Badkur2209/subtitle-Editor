import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { DashboardHeader } from "@/components/DashboardHeader";
import { Outlet } from "react-router-dom";
// Pages
import Dashboard from "./pages/Dashboard";
import AssignTask from "./pages/AssignTask";
import StatsYoutube from "./pages/StatsYoutube";
import UserInfoPage from "./pages/UserInfoPage";
import VTTFilesStats from "./pages/VTTFilesStats";
import SettingsPage from "./pages/SettingsPage";
import HelpSupport from "./pages/HelpSupport";
import NotFound from "./pages/NotFound";
import Translate from "./pages/Translate";
// import TextBased from "./pages/TextBased";
import PredictionsDaily from "./pages/PredictionsDaily";
import Predictions10Days from "./pages/Predictions10Days";
import TaskStatus from "./pages/TaskStatus";
import UpdateUserStatus from "./pages/UpdateUserStatus";
import Activities from "./pages/Activities";
import Uploader from "./pages/Uploader";
import Login from "./pages/Login";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Approver from "./pages/Approver";
import Correction from "./pages/Correction";
import Correction101 from "./components/Correction/Correction101";
import CorrectionActivities from "./pages/CorrectionActivities";

import CorrectionPredictionDaily from "./pages/CorrectionPredictionDaily";
import CorrectionPrediction10Days from "./pages/CorrectionPrediction10Days";
const queryClient = new QueryClient();

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// Main App Layout (with sidebar and header)
const AppLayout: React.FC = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <DashboardHeader />
          <main className="flex-1 overflow-auto">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/Correction" element={<Correction />} />
              <Route path="/uploader" element={<Uploader />} />
              <Route path="/UpdateUserStatus" element={<UpdateUserStatus />} />
              <Route
                path="/Predictions10Days"
                element={<Predictions10Days />}
              />
              <Route path="/PredictionsDaily" element={<PredictionsDaily />} />
              <Route
                path="/CorrectionActivities"
                element={<CorrectionActivities />}
              />
              <Route
                path="/CorrectionPredictionDaily"
                element={<CorrectionPredictionDaily />}
              />
              <Route
                path="/CorrectionPrediction10Days"
                element={<CorrectionPrediction10Days />}
              />
              {/* <Route path="/text-based" element={<TextBased />} /> */}
              <Route path="/activities" element={<Activities />} />
              <Route path="/Approver" element={<Approver />} />
              <Route
                path="/Correction/Correction101"
                element={<Correction101 />}
              />
              <Route path="/translate" element={<Translate />} />
              <Route path="/assign-task" element={<AssignTask />} />
              <Route path="/stats-youtube" element={<StatsYoutube />} />
              <Route path="/user-info" element={<UserInfoPage />} />
              <Route path="/vtt-files-stats" element={<VTTFilesStats />} />
              <Route path="/TaskStatus" element={<TaskStatus />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/help-support" element={<HelpSupport />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

// Login Route (no sidebar/header)
const LoginRoute: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return <Login />;
};

// Main App Component
const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              {/* Login route - no layout */}
              <Route path="/login" element={<LoginRoute />} />

              {/* Protected routes - with layout */}
              <Route
                path="/*"
                element={
                  <ProtectedRoute>
                    <AppLayout />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
