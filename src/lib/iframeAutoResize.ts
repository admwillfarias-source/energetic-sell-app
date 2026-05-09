// Auto-resize do iframe quando rodando embedado no WordPress.
// Envia a altura real do <body> ao parent via postMessage; o shortcode
// [awr_app] do tema escuta e ajusta o atributo height do iframe — assim
// não há scroll interno e o parent não reserva espaço a mais.
//
// Throttle por requestAnimationFrame + ResizeObserver. Sem custo quando
// o app NÃO está embedado.
import { isEmbedded } from "@/lib/isEmbedded";

let started = false;

export function startIframeAutoResize(): void {
  if (started) return;
  if (typeof window === "undefined" || typeof document === "undefined") return;
  if (!isEmbedded()) return;
  started = true;

  let lastSent = 0;
  let frame = 0;

  const send = () => {
    frame = 0;
    const h = Math.max(
      document.body?.scrollHeight ?? 0,
      document.documentElement?.scrollHeight ?? 0,
    );
    if (h === lastSent || h < 1) return;
    lastSent = h;
    try {
      window.parent?.postMessage({ type: "awr:height", height: h }, "*");
    } catch { /* cross-origin */ }
  };

  const schedule = () => {
    if (frame) return;
    frame = requestAnimationFrame(send);
  };

  // Envia uma vez logo após o boot e em qualquer mudança de tamanho.
  schedule();
  window.addEventListener("load", schedule, { once: true });
  if (typeof ResizeObserver !== "undefined") {
    const ro = new ResizeObserver(schedule);
    ro.observe(document.documentElement);
    if (document.body) ro.observe(document.body);
  } else {
    window.addEventListener("resize", schedule);
  }
}
