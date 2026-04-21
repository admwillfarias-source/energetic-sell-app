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
  const heroSearchReady = metrics.find((m) => m.name === "hero_search_ready");
  const lcp = metrics.find((m) => m.name === "LCP");
  const heroMounted = metrics.find((m) => m.name === "hero_mounted");
  const firstInteractive = metrics.find((m) => m.name === "hero_search_interactive");

  const fmt = (n?: number) => (n == null ? "—" : `${Math.round(n)} ms`);
  const score = (n?: number, good = 2500, ok = 4000) => {
    if (n == null) return "text-muted-foreground";
    if (n <= good) return "text-awr-green";
    if (n <= ok) return "text-accent";
    return "text-destructive";
  };

  return (
    <div className="fixed bottom-24 right-3 z-[10000] w-72 rounded-xl border border-border bg-card/95 p-3 text-xs shadow-2xl backdrop-blur lg:bottom-3">
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

      <dl className="grid grid-cols-2 gap-y-1">
        <dt className="text-muted-foreground">LCP</dt>
        <dd className={`text-right font-mono font-semibold ${score(lcp?.time)}`}>{fmt(lcp?.time)}</dd>

        <dt className="text-muted-foreground">Hero montado</dt>
        <dd className="text-right font-mono">{fmt(heroMounted?.time)}</dd>

        <dt className="text-muted-foreground">Busca interativa</dt>
        <dd className={`text-right font-mono font-semibold ${score(firstInteractive?.time, 1500, 3000)}`}>
          {fmt(firstInteractive?.time)}
        </dd>

        <dt className="text-muted-foreground">Catálogo pronto</dt>
        <dd className={`text-right font-mono font-semibold ${score(heroSearchReady?.time, 2500, 5000)}`}>
          {fmt(heroSearchReady?.time)}
        </dd>
      </dl>

      <p className="mt-2 border-t border-border pt-2 text-[10px] text-muted-foreground">
        Toggle: <kbd className="rounded bg-muted px-1">Ctrl+Shift+P</kbd> ou <code>?perf=1</code>.
        Console: <code>__perfReport()</code>.
      </p>
    </div>
  );
}
