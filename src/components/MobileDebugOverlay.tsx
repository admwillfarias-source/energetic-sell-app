import { useEffect, useState } from "react";

/**
 * Overlay de depuração mobile — ativado com ?debug=1 (ou ?debug=mobile).
 *
 * Mostra em tempo real:
 *  - Tamanho do viewport (innerWidth x innerHeight) e visualViewport
 *  - scrollY e devicePixelRatio
 *  - Altura/posição do header fixo, da barra fixa mobile e do resumo sticky do checkout
 *  - Linhas-guia horizontais sobre o topo da barra fixa e o topo do resumo sticky,
 *    permitindo enxergar visualmente qualquer sobreposição
 *
 * Também adiciona controles para simular scroll programático e abrir/fechar o checkout.
 */

type Rect = { top: number; bottom: number; height: number; width: number };

function rectOf(el: Element | null): Rect | null {
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return { top: r.top, bottom: r.bottom, height: r.height, width: r.width };
}

function isDebugEnabled(): boolean {
  if (typeof window === "undefined") return false;
  const params = new URLSearchParams(window.location.search);
  const v = params.get("debug");
  return v === "1" || v === "mobile" || v === "true";
}

export default function MobileDebugOverlay() {
  const [enabled, setEnabled] = useState(false);
  const [, force] = useState(0);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    setEnabled(isDebugEnabled());
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const tick = () => force((n) => (n + 1) % 1_000_000);
    const onScroll = () => tick();
    const onResize = () => tick();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    window.visualViewport?.addEventListener("resize", onResize);
    window.visualViewport?.addEventListener("scroll", onScroll);
    const id = window.setInterval(tick, 500); // captura mudanças assíncronas (dialog abrir/fechar)
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      window.visualViewport?.removeEventListener("resize", onResize);
      window.visualViewport?.removeEventListener("scroll", onScroll);
      window.clearInterval(id);
    };
  }, [enabled]);

  if (!enabled) return null;

  const header = rectOf(document.querySelector("header"));
  const actionBar = rectOf(document.querySelector('[data-debug-id="mobile-action-bar"]'));
  const stickySummary = rectOf(document.querySelector('[data-debug-id="checkout-sticky-summary"]'));
  const dialog = rectOf(document.querySelector('[role="dialog"]'));

  const overlap =
    actionBar && stickySummary
      ? Math.max(0, Math.min(actionBar.bottom, stickySummary.bottom) - Math.max(actionBar.top, stickySummary.top))
      : 0;

  const vv = window.visualViewport;
  const lines: { y: number; color: string; label: string }[] = [];
  if (actionBar) {
    lines.push({ y: actionBar.top, color: "rgb(59,130,246)", label: "barra topo" });
    lines.push({ y: actionBar.bottom, color: "rgb(59,130,246)", label: "barra base" });
  }
  if (stickySummary) {
    lines.push({ y: stickySummary.top, color: "rgb(234,88,12)", label: "resumo topo" });
  }
  if (header) {
    lines.push({ y: header.bottom, color: "rgb(16,185,129)", label: "header base" });
  }

  const scrollTo = (y: number) => window.scrollTo({ top: y, behavior: "smooth" });

  return (
    <>
      {/* Linhas-guia horizontais cobrindo a tela inteira */}
      <div className="pointer-events-none fixed inset-0 z-[9998]">
        {lines.map((l, i) => (
          <div
            key={i}
            style={{
              position: "fixed",
              left: 0,
              right: 0,
              top: l.y,
              height: 0,
              borderTop: `1px dashed ${l.color}`,
            }}
          >
            <span
              style={{
                position: "absolute",
                left: 4,
                top: -10,
                fontSize: 10,
                fontFamily: "ui-monospace, monospace",
                background: l.color,
                color: "white",
                padding: "1px 4px",
                borderRadius: 3,
              }}
            >
              {l.label} · {Math.round(l.y)}px
            </span>
          </div>
        ))}
      </div>

      {/* Painel flutuante */}
      <div
        className="fixed z-[9999] rounded-lg border border-border bg-background/95 text-foreground shadow-xl backdrop-blur"
        style={{
          right: 8,
          bottom: 8,
          maxWidth: 280,
          fontFamily: "ui-monospace, SFMono-Regular, monospace",
          fontSize: 11,
        }}
      >
        <div className="flex items-center justify-between border-b border-border px-2 py-1">
          <strong className="text-[11px]">debug · mobile</strong>
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => setCollapsed((c) => !c)}
              className="rounded bg-muted px-1.5 py-0.5 text-[10px]"
            >
              {collapsed ? "+" : "–"}
            </button>
            <button
              type="button"
              onClick={() => {
                const u = new URL(window.location.href);
                u.searchParams.delete("debug");
                window.location.href = u.toString();
              }}
              className="rounded bg-muted px-1.5 py-0.5 text-[10px]"
            >
              ✕
            </button>
          </div>
        </div>

        {!collapsed && (
          <div className="space-y-1 px-2 py-2">
            <div>
              viewport: <b>{window.innerWidth}×{window.innerHeight}</b>
              {vv && (
                <>
                  {" "}
                  · vv: <b>{Math.round(vv.width)}×{Math.round(vv.height)}</b>
                </>
              )}
            </div>
            <div>
              scrollY: <b>{Math.round(window.scrollY)}</b> · dpr: <b>{window.devicePixelRatio}</b>
            </div>
            <hr className="my-1 border-border" />
            <div>
              header: {header ? `top ${Math.round(header.top)} · h ${Math.round(header.height)}` : "—"}
            </div>
            <div style={{ color: "rgb(59,130,246)" }}>
              barra fixa:{" "}
              {actionBar
                ? `top ${Math.round(actionBar.top)} · h ${Math.round(actionBar.height)}`
                : "não montada"}
            </div>
            <div style={{ color: "rgb(234,88,12)" }}>
              resumo sticky:{" "}
              {stickySummary
                ? `top ${Math.round(stickySummary.top)} · h ${Math.round(stickySummary.height)}`
                : "checkout fechado"}
            </div>
            <div>
              dialog: {dialog ? `top ${Math.round(dialog.top)} · h ${Math.round(dialog.height)}` : "—"}
            </div>
            <div
              className={overlap > 0 ? "font-bold" : ""}
              style={{ color: overlap > 0 ? "rgb(220,38,38)" : "rgb(22,163,74)" }}
            >
              overlap barra↔resumo: {Math.round(overlap)}px {overlap > 0 ? "⚠️" : "✓"}
            </div>
            <hr className="my-1 border-border" />
            <div className="flex flex-wrap gap-1">
              <button
                type="button"
                onClick={() => scrollTo(0)}
                className="rounded bg-muted px-1.5 py-0.5 text-[10px]"
              >
                topo
              </button>
              <button
                type="button"
                onClick={() => scrollTo(window.innerHeight)}
                className="rounded bg-muted px-1.5 py-0.5 text-[10px]"
              >
                +1vh
              </button>
              <button
                type="button"
                onClick={() => scrollTo(document.body.scrollHeight)}
                className="rounded bg-muted px-1.5 py-0.5 text-[10px]"
              >
                fim
              </button>
              <button
                type="button"
                onClick={() => {
                  const btn = document.querySelector<HTMLButtonElement>(
                    '[data-debug-id="open-cart"]',
                  );
                  btn?.click();
                }}
                className="rounded bg-primary px-1.5 py-0.5 text-[10px] text-primary-foreground"
              >
                abrir carrinho
              </button>
            </div>
            <div className="pt-1 text-[10px] text-muted-foreground">
              ?debug=1 · remova o parâmetro para desativar
            </div>
          </div>
        )}
      </div>
    </>
  );
}
