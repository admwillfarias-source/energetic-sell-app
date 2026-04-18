// Mapeamento de equivalências entre códigos Moura e modelos similares
// das marcas Heliar, Excell e Zetta (mesma amperagem / mesma aplicação).
// Os termos retornados são usados como busca textual no WooCommerce
// (via parâmetro `codes`), portanto podem ser SKUs ou apenas trechos
// representativos do nome do produto.

type EquivMap = Record<string, string[]>;

// Extrai a amperagem nominal do código Moura (ex: "M60AD" -> 60, "MA92QD" -> 92).
function ahFromMouraCode(code: string): number | null {
  const m = code.match(/m[a-z]?(\d{2,3})/i);
  return m ? Number(m[1]) : null;
}

// Equivalentes por amperagem para baterias automotivas selantes
// (linha principal de passeio / utilitários).
const BY_AH: EquivMap = {
  40: ["Heliar 40Ah", "Excell 40Ah", "Zetta 40Ah"],
  45: ["Heliar 45Ah", "Excell 45Ah", "Zetta 45Ah"],
  48: ["Heliar 48Ah", "Excell 50Ah", "Zetta 50Ah"],
  50: ["Heliar 50Ah", "Excell 50Ah", "Zetta 50Ah"],
  60: ["Heliar 60Ah", "Excell 60Ah", "Zetta 60Ah"],
  70: ["Heliar 70Ah", "Excell 70Ah", "Zetta 70Ah"],
  72: ["Heliar 72Ah", "Excell 70Ah"],
  75: ["Heliar 75Ah", "Excell 75Ah"],
  78: ["Heliar 80Ah", "Excell 80Ah"],
  80: ["Heliar 80Ah", "Excell 80Ah"],
  90: ["Heliar 90Ah", "Excell 90Ah"],
  92: ["Heliar 95Ah", "Excell 95Ah"],
  95: ["Heliar 95Ah", "Excell 95Ah"],
  100: ["Heliar 100Ah", "Excell 100Ah"],
  105: ["Heliar 105Ah"],
  135: ["Heliar 150Ah"],
  150: ["Heliar 150Ah"],
  180: ["Heliar 180Ah"],
  220: ["Heliar 220Ah"],
};

/**
 * Dado um código Moura, devolve termos de busca equivalentes
 * para Heliar / Excell / Zetta baseados na amperagem.
 */
export function getEquivalentsForMouraCode(code: string): string[] {
  const ah = ahFromMouraCode(code);
  if (!ah) return [];
  return BY_AH[ah] ?? [];
}

/**
 * Recebe uma lista de códigos Moura e devolve a lista expandida
 * incluindo termos equivalentes (sem duplicatas).
 */
export function expandWithEquivalents(codes: string[]): string[] {
  const out = new Set<string>(codes);
  for (const c of codes) {
    for (const eq of getEquivalentsForMouraCode(c)) out.add(eq);
  }
  return Array.from(out);
}
