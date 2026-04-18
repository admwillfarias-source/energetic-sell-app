// Mapeamento de equivalências entre códigos Moura e modelos similares
// das marcas Heliar, Excell e Zetta.
//
// Fonte primária: src/data/equivalents.json — equivalências EXATAS modelo a modelo.
// Fallback: equivalência por amperagem (caso o código Moura ainda não esteja
// cadastrado no JSON).

import equivalentsData from "@/data/equivalents.json";

export type EquivalenceGroup = {
  moura: string[];
  heliar: string[];
  zetta: string[];
  excell: string[];
};

const GROUPS = equivalentsData as EquivalenceGroup[];

// Índice rápido: código Moura (uppercase) -> grupo de equivalência
const BY_MOURA: Map<string, EquivalenceGroup> = (() => {
  const m = new Map<string, EquivalenceGroup>();
  for (const g of GROUPS) {
    for (const code of g.moura) m.set(code.toUpperCase(), g);
  }
  return m;
})();

// Extrai a amperagem nominal do código Moura (ex: "M60AD" -> 60, "MA92QD" -> 92).
function ahFromMouraCode(code: string): number | null {
  const m = code.match(/m[a-z]?(\d{2,3})/i);
  return m ? Number(m[1]) : null;
}

// Fallback por amperagem (busca textual genérica)
const BY_AH: Record<number, string[]> = {
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
 * para Heliar / Excell / Zetta.
 *
 * Prioriza equivalências exatas do equivalents.json. Se não houver,
 * cai no fallback por amperagem.
 */
export function getEquivalentsForMouraCode(code: string): string[] {
  const group = BY_MOURA.get(code.toUpperCase());
  if (group) {
    // Inclui também outros códigos Moura do mesmo grupo (ex: M50EX gera busca por M50ED também)
    const out: string[] = [];
    for (const c of group.moura) if (c.toUpperCase() !== code.toUpperCase()) out.push(c);
    out.push(...group.heliar, ...group.zetta, ...group.excell);
    return out;
  }
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
