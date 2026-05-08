// Detecta se o app está rodando dentro de um <iframe>.
// Usado para evitar duplicar tracking, splash e outros recursos
// quando o parent (tema WordPress) já cuida disso.
export function isEmbedded(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.self !== window.top;
  } catch {
    // Cross-origin lança SecurityError no acesso a window.top — significa que estamos em iframe.
    return true;
  }
}
