// Sincroniza o viewport visível do parent (tema WordPress) ↔ iframe (app React).
//
// Problema: quando o app roda embedado e o snippet do tema redimensiona o
// iframe para a altura total do conteúdo (auto-resize via "awr:height"), o
// iframe deixa de ter scroll próprio. Todo position:fixed dentro dele se
// ancora no documento INTEIRO (ex.: 5000px de altura), e não na janela
// visível do navegador — então um Dialog do Radix aparece no centro
// geométrico do iframe, longe de onde o usuário está rolando.
//
// Solução: o snippet do parent reporta, em tempo real, qual faixa do iframe
// está visível na janela do navegador (top e height em coordenadas do
// iframe). O app usa essa informação para ancorar modais na área visível.
//
// Mensagens trocadas:
//   iframe → parent : { type: "awr:requestViewport" }
//   parent → iframe : { type: "awr:viewport", top: number, height: number }
//   iframe → parent : { type: "awr:scrollTo", y: number }  (opcional)
import { isEmbedded } from "@/lib/isEmbedded";

export type ParentViewport = { top: number; height: number };

let current: ParentViewport | null = null;
const listeners = new Set<(v: ParentViewport) => void>();
let started = false;

export function startParentViewportSync(): void {
  if (started) return;
  if (typeof window === "undefined") return;
  if (!isEmbedded()) return;
  started = true;

  window.addEventListener("message", (e: MessageEvent) => {
    const d = e?.data as { type?: string; top?: number; height?: number } | null;
    if (!d || typeof d !== "object" || d.type !== "awr:viewport") return;
    if (typeof d.top !== "number" || typeof d.height !== "number") return;
    current = { top: d.top, height: d.height };
    listeners.forEach((fn) => fn(current!));
  });

  try {
    window.parent?.postMessage({ type: "awr:requestViewport" }, "*");
  } catch {
    /* cross-origin: ignora */
  }
}

export function getParentViewport(): ParentViewport | null {
  return current;
}

export function subscribeParentViewport(
  fn: (v: ParentViewport) => void,
): () => void {
  listeners.add(fn);
  if (current) fn(current);
  return () => {
    listeners.delete(fn);
  };
}

/** Pede ao parent para rolar a janela até uma coordenada Y (em px) do iframe. */
export function requestParentScrollTo(yInIframe: number): void {
  if (typeof window === "undefined" || !isEmbedded()) return;
  try {
    window.parent?.postMessage(
      { type: "awr:scrollTo", y: Math.max(0, Math.round(yInIframe)) },
      "*",
    );
  } catch {
    /* noop */
  }
}
