import { lazy, Suspense, useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";

const TooltipProvider = lazy(() =>
  import("@/components/ui/tooltip").then((m) => ({ default: m.TooltipProvider })),
);

// Todas as outras páginas: lazy. Não viajam no bundle inicial da home.
const Auth = lazy(() => import("./pages/Auth.tsx"));
const Admin = lazy(() => import("./pages/Admin.tsx"));
const BatterySku = lazy(() => import("./pages/BatterySku.tsx"));
const Resultado = lazy(() => import("./pages/Resultado.tsx"));
const PedidoConfirmado = lazy(() => import("./pages/PedidoConfirmado.tsx"));
const City = lazy(() => import("./pages/City.tsx"));
const Neighborhood = lazy(() => import("./pages/Neighborhood.tsx"));
const VehicleSeo = lazy(() => import("./pages/VehicleSeo.tsx"));
const Brand = lazy(() => import("./pages/Brand.tsx"));
const Amperage = lazy(() => import("./pages/Amperage.tsx"));
const Catalogo = lazy(() => import("./pages/Catalogo.tsx"));
const Servicos = lazy(() => import("./pages/Servicos.tsx"));

const LazyToaster = lazy(() => import("@/components/LazyToaster"));

const queryClient = new QueryClient();

const Fallback = () => <div className="min-h-screen" />;
const wrap = (el: React.ReactNode) => <Suspense fallback={<Fallback />}>{el}</Suspense>;

function DeferredToaster() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const w = window as unknown as { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number };
    const schedule = w.requestIdleCallback ?? ((cb: () => void) => setTimeout(cb, 2000));
    const id = schedule(() => setShow(true), { timeout: 4000 });
    return () => {
      const cancel = (window as unknown as { cancelIdleCallback?: (id: number) => void }).cancelIdleCallback;
      if (cancel) cancel(id as number);
    };
  }, []);
  if (!show) return null;
  return (
    <Suspense fallback={null}>
      <LazyToaster />
    </Suspense>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <Suspense fallback={null}>
      <TooltipProvider>
        <DeferredToaster />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/catalogo" element={wrap(<Catalogo />)} />
            <Route path="/servicos" element={wrap(<Servicos />)} />
            <Route path="/resultado" element={wrap(<Resultado />)} />
            <Route path="/baterias/:slug" element={wrap(<City />)} />
            <Route path="/baterias/:citySlug/:slug" element={wrap(<Neighborhood />)} />
            <Route path="/baterias-para/:slug" element={wrap(<VehicleSeo />)} />
            <Route path="/baterias-para/:slug/:year" element={wrap(<VehicleSeo />)} />
            <Route path="/baterias/marca/:slug" element={wrap(<Brand />)} />
            <Route path="/baterias/amperagem/:ah" element={wrap(<Amperage />)} />
            <Route path="/bateria/:sku" element={wrap(<BatterySku />)} />
            <Route path="/auth" element={wrap(<Auth />)} />
            <Route path="/admin" element={wrap(<Admin />)} />
            <Route path="/pedido-confirmado" element={wrap(<PedidoConfirmado />)} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </Suspense>
  </QueryClientProvider>
);

export default App;
