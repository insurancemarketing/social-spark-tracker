import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import ContentTracker from "./pages/ContentTracker";
import DMPipeline from "./pages/DMPipeline";
import YouTubePage from "./pages/YouTubePage";
import YouTubeCallback from "./pages/YouTubeCallback";
import TikTokPage from "./pages/TikTokPage";
import InstagramPage from "./pages/InstagramPage";
import FacebookPage from "./pages/FacebookPage";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/content" element={<ContentTracker />} />
          <Route path="/dm-pipeline" element={<DMPipeline />} />
          <Route path="/youtube" element={<YouTubePage />} />
          <Route path="/youtube/callback" element={<YouTubeCallback />} />
          <Route path="/tiktok" element={<TikTokPage />} />
          <Route path="/instagram" element={<InstagramPage />} />
          <Route path="/facebook" element={<FacebookPage />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
