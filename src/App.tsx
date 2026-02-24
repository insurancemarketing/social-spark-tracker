import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import ContentTracker from "./pages/ContentTracker";
import DMPipeline from "./pages/DMPipeline";
import YouTubePage from "./pages/YouTubePage";
import YouTubeCallback from "./pages/YouTubeCallback";
import FacebookCallback from "./pages/FacebookCallback";
import TikTokPage from "./pages/TikTokPage";
import InstagramPage from "./pages/InstagramPage";
import FacebookPage from "./pages/FacebookPage";
import Settings from "./pages/Settings";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import DataDeletion from "./pages/DataDeletion";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/data-deletion" element={<DataDeletion />} />

            {/* OAuth callback routes (need to be accessible) */}
            <Route path="/youtube/callback" element={<YouTubeCallback />} />
            <Route path="/facebook/callback" element={<FacebookCallback />} />

            {/* Protected routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/content"
              element={
                <ProtectedRoute>
                  <ContentTracker />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dm-pipeline"
              element={
                <ProtectedRoute>
                  <DMPipeline />
                </ProtectedRoute>
              }
            />
            <Route
              path="/youtube"
              element={
                <ProtectedRoute>
                  <YouTubePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tiktok"
              element={
                <ProtectedRoute>
                  <TikTokPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/instagram"
              element={
                <ProtectedRoute>
                  <InstagramPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/facebook"
              element={
                <ProtectedRoute>
                  <FacebookPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
