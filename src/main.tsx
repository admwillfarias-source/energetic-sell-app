import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import App from "./App.tsx";
import "./index.css";
import { startLcpTracking, markEvent } from "@/lib/perfMetrics";
import { initDeferredTracking } from "@/lib/loadTracking";
import { isEmbedded } from "@/lib/isEmbedded";

// Fontes carregadas de forma diferida e NÃO bloqueante.
// Pegamos as URLs hashadas dos CSS do @fontsource via ?url (não injeta <link>),
// e nós mesmos inserimos como <link rel="preload" as="style" onload="rel=stylesheet">
// para que nunca apareçam como render-blocking no Lighthouse.
// Fallback metrics-adjusted (Inter Fallback / Plus Jakarta Sans Fallback) em index.css cobre o swap.
import inter400Url from "@fontsource/inter/400.css?url";
import inter600Url from "@fontsource/inter/600.css?url";
import jakarta700Url from "@fontsource/plus-jakarta-sans/700.css?url";
import jakarta800Url from "@fontsource/plus-jakarta-sans/800.css?url";

function injectFontCssNonBlocking(href: string) {
  if (document.querySelector(`link[data-font-css="${href}"]`)) return;
  const link = document.createElement("link");
  link.rel = "preload";
  link.as = "style";
  link.href = href;
  link.setAttribute("data-font-css", href);
  link.onload = () => {
    link.onload = null;
    link.rel = "stylesheet";
  };
  document.head.appendChild(link);
}

function loadFontsDeferred() {
  const w = window as unknown as { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number };
  // Em iframe, atrasa ainda mais — fontes do hero já vêm preloaded em index.html.
  const idleTimeout = isEmbedded() ? 4000 : 2000;
  const fallbackDelay = isEmbedded() ? 1500 : 200;
  const schedule = w.requestIdleCallback ?? ((cb: () => void) => setTimeout(cb, fallbackDelay));
  schedule(() => {
    [inter400Url, inter600Url, jakarta700Url, jakarta800Url].forEach(injectFontCssNonBlocking);
  }, { timeout: idleTimeout });
}
loadFontsDeferred();

// Inicia o tracking de Web Vitals o quanto antes
startLcpTracking();
markEvent("app_boot");

// Preload do hero agora vive em index.html (paths estáveis em /public)
// para que o navegador o resolva antes do parse do JS bundle.

createRoot(document.getElementById("root")!).render(
  <HelmetProvider>
    <App />
  </HelmetProvider>,
);

// Inicializa GTM/GA4/Ads de forma diferida (após interação ou idle).
initDeferredTracking();
