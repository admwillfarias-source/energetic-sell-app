import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import App from "./App.tsx";
import "@fontsource/inter/400.css";
import "@fontsource/inter/600.css";
import "@fontsource/plus-jakarta-sans/700.css";
import "@fontsource/plus-jakarta-sans/800.css";
import "./index.css";
import heroBg from "@/assets/hero-bg.webp";
import heroBgSm from "@/assets/hero-bg-sm.webp";
import { startLcpTracking, markEvent } from "@/lib/perfMetrics";
import { initDeferredTracking } from "@/lib/loadTracking";

// Inicia o tracking de Web Vitals o quanto antes
startLcpTracking();
markEvent("app_boot");

// Preload hero LCP com URL hasheada (Vite resolve em build)
const preloadHero = () => {
  const isMobile = window.matchMedia("(max-width: 768px)").matches;
  const link = document.createElement("link");
  link.rel = "preload";
  link.as = "image";
  link.href = isMobile ? heroBgSm : heroBg;
  link.fetchPriority = "high" as never;
  document.head.appendChild(link);
};
preloadHero();

createRoot(document.getElementById("root")!).render(
  <HelmetProvider>
    <App />
  </HelmetProvider>,
);

// Inicializa GTM/GA4/Ads de forma diferida (após interação ou idle).
initDeferredTracking();
