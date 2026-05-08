// Performance metrics utility — marca eventos com performance.mark/measure
// e expõe um relatório consolidado em window.__perfReport()
//
// Coleta automaticamente Web Vitals (TTFB, FCP, LCP, CLS, INP) via
// PerformanceObserver, sem dependência externa.

type MetricEntry = {
  name: string;
  time: number; // ms desde navigationStart
  duration?: number; // ms (para measures)
  value?: number; // valor numérico (ex.: CLS score)
};

const METRICS: MetricEntry[] = [];
const LISTENERS = new Set<() => void>();

// Em produção, todo o tracking é no-op a menos que o usuário entre com ?perf=1.
// Isso evita 5 PerformanceObservers competindo com o LCP na main thread.
const ENABLED: boolean = (() => {
  if (typeof window === "undefined") return false;
  if (import.meta.env.DEV) return true;
  try {
    return new URLSearchParams(window.location.search).get("perf") === "1";
  } catch {
    return false;
  }
})();

function notify() {
  LISTENERS.forEach((fn) => {
    try {
      fn();
    } catch {
      // ignore
    }
  });
}

function upsert(name: string, entry: MetricEntry) {
  const idx = METRICS.findIndex((m) => m.name === name);
  if (idx >= 0) METRICS[idx] = entry;
  else METRICS.push(entry);
  notify();
}

export function markEvent(name: string) {
  if (!ENABLED) return;
  if (typeof performance === "undefined") return;
  // Evita duplicados — só registra a primeira ocorrência de cada evento.
  if (METRICS.some((m) => m.name === name)) return;
  try {
    performance.mark(name);
  } catch {
    // ignore
  }
  METRICS.push({ name, time: performance.now() });
  notify();
}

export function measureBetween(name: string, startMark: string, endMark: string) {
  if (typeof performance === "undefined") return;
  try {
    performance.measure(name, startMark, endMark);
    const entries = performance.getEntriesByName(name, "measure");
    const last = entries[entries.length - 1];
    if (last) {
      upsert(name, { name, time: last.startTime + last.duration, duration: last.duration });
    }
  } catch {
    // ignore
  }
}

export function getMetrics(): MetricEntry[] {
  return [...METRICS];
}

export function subscribeMetrics(fn: () => void) {
  LISTENERS.add(fn);
  return () => LISTENERS.delete(fn);
}

// ───────────────────────── Web Vitals ─────────────────────────

let started = false;
let lcpValue = 0;
let clsValue = 0;
let inpValue = 0;

export function startLcpTracking() {
  if (!ENABLED) return;
  if (started || typeof PerformanceObserver === "undefined") return;
  started = true;

  // TTFB via Navigation Timing
  try {
    const nav = performance.getEntriesByType("navigation")[0] as
      | PerformanceNavigationTiming
      | undefined;
    if (nav) {
      upsert("TTFB", { name: "TTFB", time: nav.responseStart });
    }
  } catch {
    // ignore
  }

  // FCP via paint timing
  try {
    const obs = new PerformanceObserver((list) => {
      for (const e of list.getEntries()) {
        if (e.name === "first-contentful-paint") {
          upsert("FCP", { name: "FCP", time: e.startTime });
        }
      }
    });
    obs.observe({ type: "paint", buffered: true });
  } catch {
    // ignore
  }

  // LCP
  try {
    const obs = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const last = entries[entries.length - 1] as PerformanceEntry & {
        renderTime?: number;
        loadTime?: number;
      };
      const t = (last.renderTime ?? last.loadTime ?? last.startTime) || 0;
      if (t > lcpValue) {
        lcpValue = t;
        upsert("LCP", { name: "LCP", time: t });
      }
    });
    obs.observe({ type: "largest-contentful-paint", buffered: true });
  } catch {
    // ignore
  }

  // CLS — soma layout shifts sem input do usuário
  try {
    const obs = new PerformanceObserver((list) => {
      for (const e of list.getEntries() as Array<PerformanceEntry & {
        value: number;
        hadRecentInput: boolean;
      }>) {
        if (!e.hadRecentInput) {
          clsValue += e.value;
          upsert("CLS", { name: "CLS", time: e.startTime, value: clsValue });
        }
      }
    });
    obs.observe({ type: "layout-shift", buffered: true });
  } catch {
    // ignore
  }

  // INP — maior duração de interação observada (proxy do INP oficial)
  try {
    const obs = new PerformanceObserver((list) => {
      for (const e of list.getEntries() as Array<PerformanceEntry & { duration: number }>) {
        if (e.duration > inpValue) {
          inpValue = e.duration;
          upsert("INP", { name: "INP", time: e.startTime, duration: e.duration, value: inpValue });
        }
      }
    });
    // "event" só dispara quando duração > 16ms; ainda é o melhor proxy nativo.
    obs.observe({ type: "event", buffered: true, durationThreshold: 40 } as PerformanceObserverInit);
  } catch {
    // ignore
  }

  // Long tasks — soma total de bloqueio acima de 50ms
  try {
    let totalBlocking = 0;
    const obs = new PerformanceObserver((list) => {
      for (const e of list.getEntries()) {
        const blocking = Math.max(0, e.duration - 50);
        totalBlocking += blocking;
      }
      upsert("TBT", { name: "TBT", time: performance.now(), value: totalBlocking });
    });
    obs.observe({ type: "longtask", buffered: true });
  } catch {
    // ignore
  }
}

export function getLcp() {
  return lcpValue;
}

// Helper global para o usuário inspecionar no console
declare global {
  interface Window {
    __perfReport?: () => MetricEntry[];
  }
}
if (typeof window !== "undefined") {
  window.__perfReport = () => {
    const data = getMetrics();
    // eslint-disable-next-line no-console
    console.table(
      data.map((m) => ({
        name: m.name,
        time_ms: Math.round(m.time),
        duration_ms: m.duration ? Math.round(m.duration) : "",
        value: m.value != null ? Number(m.value.toFixed(3)) : "",
      })),
    );
    return data;
  };
}
