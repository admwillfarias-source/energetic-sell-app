// Performance metrics utility — marca eventos com performance.mark/measure
// e expõe um relatório consolidado em window.__perfReport()

type MetricEntry = {
  name: string;
  time: number; // ms desde navigationStart
  duration?: number; // ms (para measures)
};

const METRICS: MetricEntry[] = [];
const LISTENERS = new Set<() => void>();

function notify() {
  LISTENERS.forEach((fn) => {
    try {
      fn();
    } catch {
      // ignore
    }
  });
}

export function markEvent(name: string) {
  if (typeof performance === "undefined") return;
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
      METRICS.push({ name, time: last.startTime + last.duration, duration: last.duration });
      notify();
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

// LCP via PerformanceObserver
let lcpObserver: PerformanceObserver | null = null;
let lcpValue = 0;

export function startLcpTracking() {
  if (typeof PerformanceObserver === "undefined" || lcpObserver) return;
  try {
    lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const last = entries[entries.length - 1] as PerformanceEntry & { renderTime?: number; loadTime?: number };
      const t = (last.renderTime ?? last.loadTime ?? last.startTime) || 0;
      if (t > lcpValue) {
        lcpValue = t;
        // Substitui qualquer entrada anterior de LCP
        const idx = METRICS.findIndex((m) => m.name === "LCP");
        const entry = { name: "LCP", time: t };
        if (idx >= 0) METRICS[idx] = entry;
        else METRICS.push(entry);
        notify();
      }
    });
    lcpObserver.observe({ type: "largest-contentful-paint", buffered: true });
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
    console.table(data.map((m) => ({ name: m.name, time_ms: Math.round(m.time), duration_ms: m.duration ? Math.round(m.duration) : "" })));
    return data;
  };
}
