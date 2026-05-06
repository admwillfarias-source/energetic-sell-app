import { useEffect, useState } from "react";
import { Activity, X } from "lucide-react";
import { getMetrics, subscribeMetrics, startLcpTracking } from "@/lib/perfMetrics";

export default function PerfReport() {
  const [open, setOpen] = useState(false);
  const [, force] = useState(0);

  useEffect(() => {
    startLcpTracking();
    const unsub = subscribeMetrics(() => force((n) => n + 1));
    return () => {
      unsub();
    };
  }, []);

  // Habilita via ?perf=1 ou tecla Ctrl+Shift+P
  useEffect(() => {
    const url = new URL(window.location.href);
    if (url.searchParams.get("perf") === "1") setOpen(true);
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "p") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  if (!open) return null;

  const metrics = getMetrics();
  const find = (n: string) => metrics.find((m) => m.name === n);

  const ttfb = find("TTFB");
  const fcp = find("FCP");
  const lcp = find("LCP");
  const cls = find("CLS");
  const inp = find("INP");
  const tbt = find("TBT");

  const heroMounted = find("hero_mounted");
  const firstInteractive = find("hero_search_interactive");
  const catalogReady = find("hero_search_ready");
  const splashHidden = find("splash_hidden");
  const bestSellersReady = find("best_sellers_ready");
  const batteryGridReady = find("battery_grid_ready");

  const fmt = (n?: number) => (n == null ? "—" : `${Math.round(n)} ms`);
  const fmtVal = (n?: number, digits = 3) => (n == null ? "—" : n.toFixed(digits));
  const score = (n?: number, good = 2500, ok = 4000) => {
    if (n == null) return "text-muted-foreground";
    if (n <= good) return "text-awr-green";
    if (n <= ok) return "text-accent";
    return "text-destructive";
  };
  const scoreCls = (n?: number) => {
    if (n == null) return "text-muted-foreground";
    if (n <= 0.1) return "text-awr-green";
    if (n <= 0.25) return "text-accent";
    return "text-destructive";
  };

  return (
    <div className="fixed bottom-24 right-3 z-[10000] w-80 max-h-[70vh] overflow-y-auto rounded-xl border border-border bg-card/95 p-3 text-xs shadow-2xl backdrop-blur lg:bottom-3">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-1.5 font-semibold">
          <Activity className="h-3.5 w-3.5 text-primary" />
          Performance
        </div>
        <button
          onClick={() => setOpen(false)}
          className="text-muted-foreground hover:text-foreground"
          aria-label="Fechar relatório"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="mb-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
        Web Vitals
      </div>
      <dl className="grid grid-cols-2 gap-y-1">
        <dt className="text-muted-foreground">TTFB</dt>
        <dd className={`text-right font-mono font-semibold ${score(ttfb?.time, 800, 1800)}`}>
          {fmt(ttfb?.time)}
        </dd>

        <dt className="text-muted-foreground">FCP</dt>
        <dd className={`text-right font-mono font-semibold ${score(fcp?.time, 1800, 3000)}`}>
          {fmt(fcp?.time)}
        </dd>

        <dt className="text-muted-foreground">LCP</dt>
        <dd className={`text-right font-mono font-semibold ${score(lcp?.time, 2500, 4000)}`}>
          {fmt(lcp?.time)}
        </dd>

        <dt className="text-muted-foreground">CLS</dt>
        <dd className={`text-right font-mono font-semibold ${scoreCls(cls?.value)}`}>
          {fmtVal(cls?.value)}
        </dd>

        <dt className="text-muted-foreground">INP</dt>
        <dd className={`text-right font-mono font-semibold ${score(inp?.duration, 200, 500)}`}>
          {fmt(inp?.duration)}
        </dd>

        <dt className="text-muted-foreground">TBT (long tasks)</dt>
        <dd className={`text-right font-mono font-semibold ${score(tbt?.value, 200, 600)}`}>
          {fmt(tbt?.value)}
        </dd>
      </dl>

      <div className="mt-3 mb-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
        Marcos da página
      </div>
      <dl className="grid grid-cols-2 gap-y-1">
        <dt className="text-muted-foreground">Splash escondido</dt>
        <dd className="text-right font-mono">{fmt(splashHidden?.time)}</dd>

        <dt className="text-muted-foreground">Hero montado</dt>
        <dd className="text-right font-mono">{fmt(heroMounted?.time)}</dd>

        <dt className="text-muted-foreground">Busca interativa</dt>
        <dd className={`text-right font-mono font-semibold ${score(firstInteractive?.time, 1500, 3000)}`}>
          {fmt(firstInteractive?.time)}
        </dd>

        <dt className="text-muted-foreground">Catálogo pronto</dt>
        <dd className={`text-right font-mono font-semibold ${score(catalogReady?.time, 2500, 5000)}`}>
          {fmt(catalogReady?.time)}
        </dd>

        <dt className="text-muted-foreground">Mais vendidas</dt>
        <dd className={`text-right font-mono font-semibold ${score(bestSellersReady?.time, 2500, 5000)}`}>
          {fmt(bestSellersReady?.time)}
        </dd>

        <dt className="text-muted-foreground">Grid de baterias</dt>
        <dd className={`text-right font-mono font-semibold ${score(batteryGridReady?.time, 2500, 5000)}`}>
          {fmt(batteryGridReady?.time)}
        </dd>
      </dl>

      <p className="mt-2 border-t border-border pt-2 text-[10px] text-muted-foreground">
        Toggle: <kbd className="rounded bg-muted px-1">Ctrl+Shift+P</kbd> ou <code>?perf=1</code>.
        Console: <code>__perfReport()</code>.
      </p>
    </div>
  );
}
