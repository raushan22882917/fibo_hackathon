import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Gallery from "./pages/Gallery";
import MusicVideo from "./pages/MusicVideo";

import WorkflowBuilder from "./pages/WorkflowBuilder";
import JsonToImage from "./pages/JsonToImage";
import SystemArchitectureGenerator from "./pages/SystemArchitectureGenerator";
import NotFound from "./pages/NotFound";
import ApiStatus from "./components/debug/ApiStatus";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/music-video" element={<MusicVideo />} />

          <Route path="/workflow-builder" element={<WorkflowBuilder />} />
          <Route path="/json-to-image" element={<JsonToImage />} />
          <Route path="/system-architecture" element={<SystemArchitectureGenerator />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        <ApiStatus />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
