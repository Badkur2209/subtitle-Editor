import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { DashboardHeader } from "@/components/DashboardHeader";

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
import TextBased from "./pages/TextBased";
import PredictionsDaily from "./pages/PredictionsDaily";
import Predictions10Days from "./pages/Predictions10Days";
import UserManagement from './pages/UserManagement';
import UpdateUserStatus from './pages/UpdateUserStatus';
import Activities from './pages/Activities';


const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <SidebarProvider>
          <div className="min-h-screen flex w-full bg-gray-50">
            <AppSidebar />
            <div className="flex-1 flex flex-col">
              <DashboardHeader />
              <main className="flex-1 overflow-auto">
                <Routes>
                  <Route path="/UpdateUserStatus" element={<UpdateUserStatus />} />
                  <Route path="/UserManagement" element={<UserManagement />} />
                    <Route path="/Predictions10Days" element={<Predictions10Days />} />
                    <Route path="/PredictionsDaily" element={<PredictionsDaily />} />
                  <Route path="/" element={<Dashboard />} />
                    <Route path="/text-based" element={<TextBased />} />
                    <Route path="/activities" element={<Activities />} />

                  <Route path="/translate" element={<Translate />} />
                  <Route path="/assign-task" element={<AssignTask />} />
                  <Route path="/stats-youtube" element={<StatsYoutube />} />
                  <Route path="/user-info" element={<UserInfoPage />} />
                  <Route path="/vtt-files-stats" element={<VTTFilesStats />} />
                  <Route path="/settings" element={<SettingsPage />} />
                  <Route path="/help-support" element={<HelpSupport />} />
                  <Route path="/logout" element={<Dashboard />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
            </div>
          </div>
        </SidebarProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
