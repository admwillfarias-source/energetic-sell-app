import { lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import Auth from "./pages/Auth.tsx";
import Admin from "./pages/Admin.tsx";
import WhatsappLogs from "./pages/WhatsappLogs.tsx";
import WhatsappTest from "./pages/WhatsappTest.tsx";
import WhatsappDiagnose from "./pages/WhatsappDiagnose.tsx";
import BatterySku from "./pages/BatterySku.tsx";
import Resultado from "./pages/Resultado.tsx";
import CheckoutTest from "./pages/CheckoutTest.tsx";

// Lazy: páginas de cidade são acessadas via deep-link e não precisam estar no bundle inicial.
const City = lazy(() => import("./pages/City.tsx"));
const Neighborhood = lazy(() => import("./pages/Neighborhood.tsx"));
const VehicleSeo = lazy(() => import("./pages/VehicleSeo.tsx"));
const Brand = lazy(() => import("./pages/Brand.tsx"));
const Amperage = lazy(() => import("./pages/Amperage.tsx"));
const Blog = lazy(() => import("./pages/Blog.tsx"));
const BlogPost = lazy(() => import("./pages/BlogPost.tsx"));

const Toaster = lazy(() => import("@/components/ui/toaster").then((m) => ({ default: m.Toaster })));
const Sonner = lazy(() => import("@/components/ui/sonner").then((m) => ({ default: m.Toaster })));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Suspense fallback={null}>
        <Toaster />
        <Sonner />
      </Suspense>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/resultado" element={<Resultado />} />
          <Route
            path="/baterias/:slug"
            element={
              <Suspense fallback={<div className="min-h-screen" />}>
                <City />
              </Suspense>
            }
          />
          <Route
            path="/baterias/:citySlug/:slug"
            element={
              <Suspense fallback={<div className="min-h-screen" />}>
                <Neighborhood />
              </Suspense>
            }
          />
          <Route
            path="/baterias-para/:slug"
            element={
              <Suspense fallback={<div className="min-h-screen" />}>
                <VehicleSeo />
              </Suspense>
            }
          />
          <Route
            path="/baterias-para/:slug/:year"
            element={
              <Suspense fallback={<div className="min-h-screen" />}>
                <VehicleSeo />
              </Suspense>
            }
          />
          <Route
            path="/baterias/marca/:slug"
            element={
              <Suspense fallback={<div className="min-h-screen" />}>
                <Brand />
              </Suspense>
            }
          />
          <Route
            path="/baterias/amperagem/:ah"
            element={
              <Suspense fallback={<div className="min-h-screen" />}>
                <Amperage />
              </Suspense>
            }
          />
          <Route
            path="/blog"
            element={
              <Suspense fallback={<div className="min-h-screen" />}>
                <Blog />
              </Suspense>
            }
          />
          <Route
            path="/blog/:slug"
            element={
              <Suspense fallback={<div className="min-h-screen" />}>
                <BlogPost />
              </Suspense>
            }
          />
          <Route path="/bateria/:sku" element={<BatterySku />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/admin/whatsapp-logs" element={<WhatsappLogs />} />
          <Route path="/admin/whatsapp-test" element={<WhatsappTest />} />
          <Route path="/admin/whatsapp-diagnostico" element={<WhatsappDiagnose />} />
          <Route path="/checkout-test" element={<CheckoutTest />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
