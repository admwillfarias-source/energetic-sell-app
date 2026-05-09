// perfMetrics: marcadores leves para medir latências específicas
// (ex.: tempo até o SearchOverlay abrir). Não inclui Web Vitals — apenas
// `mark`/`measure` e log no console em DEV ou quando ?perf=1.

const ENABLED: boolean = (() => {
  if (typeof window === "undefined") return false;
  if (typeof performance === "undefined") return false;
  if ((import.meta as unknown as { env?: { DEV?: boolean } }).env?.DEV) return true;
  try {
    return new URLSearchParams(window.location.search).get("perf") === "1";
  } catch {
    return false;
  }
})();

const MARKS = new Map<string, number>();
const MEASURES = new Map<string, number>();

export function markEvent(name: string): void {
  if (!ENABLED) return;
  if (MARKS.has(name)) return; // primeira ocorrência apenas
  try {
    performance.mark(name);
  } catch {
    /* noop */
  }
  MARKS.set(name, performance.now());
}

export function measureBetween(name: string, startMark: string, endMark: string): void {
  if (!ENABLED) return;
  if (!MARKS.has(startMark) || !MARKS.has(endMark)) return;
  let duration = 0;
  try {
    performance.measure(name, startMark, endMark);
    const entries = performance.getEntriesByName(name, "measure");
    const last = entries[entries.length - 1];
    duration = last ? last.duration : (MARKS.get(endMark)! - MARKS.get(startMark)!);
  } catch {
    duration = MARKS.get(endMark)! - MARKS.get(startMark)!;
  }
  MEASURES.set(name, duration);
}

// no-ops mantidos para compat
export function startLcpTracking(): void {}
export function getLcp(): number { return 0; }
export function getMetrics(): Array<{ name: string; value: number; type: "mark" | "measure" }> {
  const out: Array<{ name: string; value: number; type: "mark" | "measure" }> = [];
  MARKS.forEach((v, k) => out.push({ name: k, value: v, type: "mark" }));
  MEASURES.forEach((v, k) => out.push({ name: k, value: v, type: "measure" }));
  return out;
}
export function subscribeMetrics(_fn: () => void): () => void { return () => {}; }

declare global {
  interface Window {
    __perfReport?: () => ReturnType<typeof getMetrics>;
  }
}
if (typeof window !== "undefined") {
  window.__perfReport = () => {
    const data = getMetrics();
    // eslint-disable-next-line no-console
    console.table(data.map((d) => ({ name: d.name, type: d.type, value_ms: Math.round(d.value * 10) / 10 })));
    return data;
  };
}
