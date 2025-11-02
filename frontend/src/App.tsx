// src/App.tsx
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route } from "react-router-dom";
import VerifyImage from "./pages/VerifyImage";


// Import your page components
import IndexPage from "./pages/Index"; // This is your landing page (from screenshot 3)
import VerificationResultsPage from "./pages/VerificationResults"; // <-- NEW: Import the results page
import History from "./pages/History";
import Auth from "./pages/Auth";
import About from "./pages/About";
import NotFound from "./pages/NotFound";

// Import your UI components that provide the layout and background
import { Navigation } from "./components/Navigation";
import { AnimatedBackground } from "./components/AnimatedBackground";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />

      <AnimatedBackground>
        <Navigation />
        <Routes>
          {/* Main landing page (where the VerifyTabs are submitted) */}
          <Route path="/" element={<IndexPage />} />
          
          {/* NEW ROUTE: This is where the actual API call and results display happens */}
          <Route path="/verify" element={<VerificationResultsPage />} /> 

          {/* Other routes */}
          {/* If you have a specific ID for a verification, it should probably be handled on the results page */}
          <Route path="/verify/:id" element={<VerificationResultsPage />} /> 
          <Route path="/verify-image" element={<VerifyImage />} />
          <Route path="/history" element={<History />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/about" element={<About />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AnimatedBackground>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;