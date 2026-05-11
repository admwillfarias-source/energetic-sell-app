/**
 * Parse o parâmetro `codes` da URL de /resultado.
 * Aceita vírgula, barra, ponto-e-vírgula, espaço e pipe como separadores.
 * Normaliza para UPPERCASE, remove vazios e duplicados (preservando ordem).
 */
export function parseCodesParam(raw: string | null | undefined): string[] {
  if (!raw) return [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const part of raw.split(/[,/;\s|]+/)) {
    const c = part.trim().toUpperCase();
    if (!c) continue;
    if (seen.has(c)) continue;
    seen.add(c);
    out.push(c);
  }
  return out;
}
