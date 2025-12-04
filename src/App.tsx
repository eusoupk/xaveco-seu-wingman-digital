import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import ResponseMode from "./pages/ResponseMode";
import StartConversationMode from "./pages/StartConversationMode";
import EmbarrassingMode from "./pages/EmbarrassingMode";
import Welcome from "./pages/Welcome";
import XavecoMain from "./pages/XavecoMain";
import NotFound from "./pages/NotFound";
import TrialPage from "./pages/TrialPage";
import CheckoutSuccess from "./pages/CheckoutSuccess";
const queryClient = new QueryClient();
const App = () => <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Welcome />} className="bg-[#78160e]" />
          <Route path="/trial" element={<TrialPage />} />
          <Route path="/success" element={<CheckoutSuccess />} />
          <Route path="/wizard" element={<Home />} className="bg-[#78160e]" />
          <Route path="/response-mode" element={<ResponseMode />} />
          <Route path="/start-conversation" element={<StartConversationMode />} />
          <Route path="/embarrassing-mode" element={<EmbarrassingMode />} />
          <Route path="/old-xaveco" element={<XavecoMain />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>;
export default App;