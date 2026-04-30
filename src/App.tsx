import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppLayout } from "@/components/AppLayout";
import { ThingSpeakProvider } from "@/context/ThingSpeakContext";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import Devices from "./pages/Devices.tsx";
import Demo from "./pages/Demo.tsx";
import Reports from "./pages/Reports.tsx";
import Profile from "./pages/Profile.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <ThingSpeakProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/devices" element={<AppLayout><Devices /></AppLayout>} />
            <Route path="/demo" element={<AppLayout><Demo /></AppLayout>} />
            <Route path="/reports" element={<AppLayout><Reports /></AppLayout>} />
            <Route path="/profile" element={<AppLayout><Profile /></AppLayout>} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </ThingSpeakProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
