import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import Auth from "./pages/Auth.tsx";
import Admin from "./pages/Admin.tsx";
import WhatsappLogs from "./pages/WhatsappLogs.tsx";
import WhatsappTest from "./pages/WhatsappTest.tsx";
import WhatsappDiagnose from "./pages/WhatsappDiagnose.tsx";
import City from "./pages/City.tsx";
import BatterySku from "./pages/BatterySku.tsx";
import Resultado from "./pages/Resultado.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/resultado" element={<Resultado />} />
          <Route path="/baterias/:slug" element={<City />} />
          <Route path="/bateria/:sku" element={<BatterySku />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/admin/whatsapp-logs" element={<WhatsappLogs />} />
          <Route path="/admin/whatsapp-test" element={<WhatsappTest />} />
          <Route path="/admin/whatsapp-diagnostico" element={<WhatsappDiagnose />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
