// Detecta se o app está rodando dentro de um <iframe>.
// Usado para evitar duplicar tracking, splash e outros recursos
// quando o parent (tema WordPress) já cuida disso.
//
// Detecção em duas fases:
//  1. ?embed=1 na URL (sinal explícito do shortcode [awr_app] do tema WP) —
//     não exige acesso a window.top, então não dispara SecurityError em
//     cross-origin e roda mais cedo no boot.
//  2. window.self !== window.top — fallback para iframes sem o query param
//     (preview do Lovable, embeds manuais).
export function isEmbedded(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const sp = new URLSearchParams(window.location.search);
    if (sp.get("embed") === "1") return true;
  } catch { /* noop */ }
  try {
    return window.self !== window.top;
  } catch {
    // Cross-origin lança SecurityError no acesso a window.top — significa que estamos em iframe.
    return true;
  }
}
