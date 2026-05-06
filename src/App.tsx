import { lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import SplashScreen from "@/components/SplashScreen";

// Todas as outras páginas: lazy. Não viajam no bundle inicial da home.
const Auth = lazy(() => import("./pages/Auth.tsx"));
const Admin = lazy(() => import("./pages/Admin.tsx"));
const WhatsappLogs = lazy(() => import("./pages/WhatsappLogs.tsx"));
const WhatsappTest = lazy(() => import("./pages/WhatsappTest.tsx"));
const WhatsappDiagnose = lazy(() => import("./pages/WhatsappDiagnose.tsx"));
const BatterySku = lazy(() => import("./pages/BatterySku.tsx"));
const Resultado = lazy(() => import("./pages/Resultado.tsx"));
const CheckoutTest = lazy(() => import("./pages/CheckoutTest.tsx"));
const PedidoConfirmado = lazy(() => import("./pages/PedidoConfirmado.tsx"));
const City = lazy(() => import("./pages/City.tsx"));
const Neighborhood = lazy(() => import("./pages/Neighborhood.tsx"));
const VehicleSeo = lazy(() => import("./pages/VehicleSeo.tsx"));
const Brand = lazy(() => import("./pages/Brand.tsx"));
const Amperage = lazy(() => import("./pages/Amperage.tsx"));
const Blog = lazy(() => import("./pages/Blog.tsx"));
const BlogPost = lazy(() => import("./pages/BlogPost.tsx"));
const BlogTag = lazy(() => import("./pages/BlogTag.tsx"));

const LazyToaster = lazy(() => import("@/components/LazyToaster"));

const queryClient = new QueryClient();

const Fallback = () => <div className="min-h-screen" />;
const wrap = (el: React.ReactNode) => <Suspense fallback={<Fallback />}>{el}</Suspense>;

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Suspense fallback={null}>
        <LazyToaster />
      </Suspense>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/resultado" element={wrap(<Resultado />)} />
          <Route path="/baterias/:slug" element={wrap(<City />)} />
          <Route path="/baterias/:citySlug/:slug" element={wrap(<Neighborhood />)} />
          <Route path="/baterias-para/:slug" element={wrap(<VehicleSeo />)} />
          <Route path="/baterias-para/:slug/:year" element={wrap(<VehicleSeo />)} />
          <Route path="/baterias/marca/:slug" element={wrap(<Brand />)} />
          <Route path="/baterias/amperagem/:ah" element={wrap(<Amperage />)} />
          <Route path="/blog" element={wrap(<Blog />)} />
          <Route path="/blog/tag/:slug" element={wrap(<BlogTag />)} />
          <Route path="/blog/:slug" element={wrap(<BlogPost />)} />
          <Route path="/bateria/:sku" element={wrap(<BatterySku />)} />
          <Route path="/auth" element={wrap(<Auth />)} />
          <Route path="/admin" element={wrap(<Admin />)} />
          <Route path="/admin/whatsapp-logs" element={wrap(<WhatsappLogs />)} />
          <Route path="/admin/whatsapp-test" element={wrap(<WhatsappTest />)} />
          <Route path="/admin/whatsapp-diagnostico" element={wrap(<WhatsappDiagnose />)} />
          <Route path="/checkout-test" element={wrap(<CheckoutTest />)} />
          <Route path="/pedido-confirmado" element={wrap(<PedidoConfirmado />)} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
