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
  let debounceTimer: number | 0 = 0;

  const send = () => {
    frame = 0;
    const h = Math.max(
      document.body?.scrollHeight ?? 0,
      document.documentElement?.scrollHeight ?? 0,
    );
    if (h === lastSent || h < 1) return;
    // Evita oscilações pequenas (ex.: 1-2px) durante carregamento de imagens.
    if (Math.abs(h - lastSent) < 4) return;
    lastSent = h;
    try {
      window.parent?.postMessage({ type: "awr:height", height: h }, "*");
    } catch { /* cross-origin */ }
  };

  const schedule = () => {
    // Debounce ~80ms para agrupar rajadas (carga de imagens, fontes, etc.)
    if (debounceTimer) window.clearTimeout(debounceTimer);
    debounceTimer = window.setTimeout(() => {
      debounceTimer = 0;
      if (frame) return;
      frame = requestAnimationFrame(send);
    }, 80);
  };

  // Envia uma vez logo após o boot e em qualquer mudança de tamanho.
  // O primeiro envio é imediato (sem debounce) para o parent ajustar cedo.
  if (frame === 0) frame = requestAnimationFrame(send);
  window.addEventListener("load", schedule, { once: true });
  if (typeof ResizeObserver !== "undefined") {
    const ro = new ResizeObserver(schedule);
    ro.observe(document.documentElement);
    if (document.body) ro.observe(document.body);
  } else {
    window.addEventListener("resize", schedule);
  }
}
