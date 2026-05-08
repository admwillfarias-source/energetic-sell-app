// Carrega GTM + GA4 + Google Ads de forma diferida.
// Dispara após primeira interação do usuário OU em idle/load + timeout,
// o que ocorrer primeiro. Reduz drasticamente TBT/main-thread no LCP.
//
// Quando o app roda dentro de iframe (tema WP), pula a injeção: o parent
// já carrega GTM/GA4/Ads. Para conversões, faz postMessage para o parent.

import { isEmbedded } from "@/lib/isEmbedded";

const GTM_ID = "GTM-5JTRM2L";
const GA4_ID = "G-FJ1MK5SLS5";
const ADS_ID = "AW-994517528";
const ADS_CONVERSION = "AW-994517528/axHrCPb1w6gcEJjEnNoD";

let loaded = false;

function injectScript(src: string, async = true) {
  const s = document.createElement("script");
  s.src = src;
  s.async = async;
  document.head.appendChild(s);
  return s;
}

function loadAll() {
  if (loaded) return;
  loaded = true;

  // dataLayer + gtag stub já existem (criados em index.html)
  const w = window as unknown as {
    dataLayer: unknown[];
    gtag?: (...args: unknown[]) => void;
    gtag_report_conversion?: (url?: string) => boolean;
  };
  w.dataLayer = w.dataLayer || [];
  if (!w.gtag) {
    w.gtag = function gtag() {
      // eslint-disable-next-line prefer-rest-params
      w.dataLayer.push(arguments as unknown as Record<string, unknown>);
    };
  }

  // GA4 + Ads
  injectScript(`https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`);
  w.gtag!("js", new Date());
  w.gtag!("config", GA4_ID);
  w.gtag!("config", ADS_ID);

  // GTM
  injectScript(`https://www.googletagmanager.com/gtm.js?id=${GTM_ID}&l=dataLayer`);
  w.dataLayer.push({ "gtm.start": Date.now(), event: "gtm.js" });

  // Helper Google Ads conversion
  w.gtag_report_conversion = function (url?: string) {
    const cb = function () {
      if (typeof url !== "undefined") window.location.href = url!;
    };
    w.gtag!("event", "conversion", {
      send_to: ADS_CONVERSION,
      value: 1.0,
      currency: "BRL",
      transaction_id: "",
      event_callback: cb,
    });
    return false;
  };
}

export function initDeferredTracking() {
  if (typeof window === "undefined") return;

  // Gate: só liberamos o tracking depois que o LCP terminou,
  // para não competir com a renderização do herói.
  let lcpDone = false;
  let pendingTrigger = false;

  const events = ["scroll", "touchstart", "mousemove", "keydown", "click"] as const;
  const opts: AddEventListenerOptions = { once: true, passive: true, capture: true };

  function cleanup() {
    events.forEach((e) => window.removeEventListener(e, trigger, opts));
  }

  function trigger() {
    cleanup();
    if (lcpDone) {
      loadAll();
    } else {
      // Aguarda LCP; quando chegar, dispara.
      pendingTrigger = true;
    }
  }

  // Interação do usuário sempre tem prioridade — se ele já interagiu,
  // o LCP "perceptual" já passou e podemos carregar imediatamente.
  events.forEach((e) =>
    window.addEventListener(
      e,
      () => {
        cleanup();
        loadAll();
      },
      opts,
    ),
  );

  // Observa LCP via PerformanceObserver
  try {
    const PO = (window as unknown as { PerformanceObserver?: typeof PerformanceObserver }).PerformanceObserver;
    if (PO) {
      const po = new PO((list) => {
        if (list.getEntries().length > 0) {
          lcpDone = true;
          po.disconnect();
          if (pendingTrigger) loadAll();
        }
      });
      po.observe({ type: "largest-contentful-paint", buffered: true });
    } else {
      lcpDone = true;
    }
  } catch {
    lcpDone = true;
  }

  // Hard cap: garante que o LCP-gate não atrase indefinidamente.
  // Após 2.5s assumimos que o LCP já ocorreu.
  setTimeout(() => {
    lcpDone = true;
    if (pendingTrigger) loadAll();
  }, 2500);

  const w = window as unknown as { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number };
  const idle = w.requestIdleCallback;
  if (idle) {
    idle(trigger, { timeout: 2000 });
  } else {
    setTimeout(trigger, 2000);
  }
}
