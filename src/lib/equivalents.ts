import { getEquivalents } from "@/lib/catalogStore";

// Fallback por amperagem — usado quando o código Moura não está cadastrado.
const BY_AH: Record<number, string[]> = {
  40: ["Heliar 40Ah", "Excell 40Ah", "Zetta 40Ah"],
  45: ["Heliar 45Ah", "Excell 45Ah", "Zetta 45Ah"],
  48: ["Heliar 48Ah", "Excell 50Ah", "Zetta 50Ah"],
  50: ["Heliar 50Ah", "Excell 50Ah", "Zetta 50Ah"],
  60: ["Moura 60AD", "Moura 60G", "Heliar 60Ah", "Excell 60Ah", "Zetta 60Ah"],
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

function ahFromMouraCode(code: string): number | null {
  const m = code.match(/m[a-z]?(\d{2,3})/i);
  return m ? Number(m[1]) : null;
}

export function getEquivalentsForMouraCode(code: string): string[] {
  const upper = code.toUpperCase();
  const group = getEquivalents().find((g) =>
    g.moura.some((c) => c.toUpperCase() === upper),
  );
  const out = new Set<string>();
  // Para 60Ah, priorizar Moura 60AD e 60G ao invés da AGM60AD.
  const ah = ahFromMouraCode(code);
  if (ah === 60) {
    out.add("Moura 60AD");
    out.add("Moura 60G");
  }
  // Sempre incluir o fallback amigável por amperagem — o WooCommerce indexa
  // produtos por nome ("Heliar 50Ah") e nem sempre por SKU técnico (H50GD).
  if (ah && BY_AH[ah]) {
    for (const n of BY_AH[ah]) out.add(n);
  }
  if (group) {
    for (const c of group.moura) if (c.toUpperCase() !== upper) out.add(c);
    for (const c of group.heliar) out.add(c);
    for (const c of group.zetta) out.add(c);
    for (const c of group.excell) out.add(c);
    // Tudor removido: site não vende a linha automotiva Tudor.
  }
  return Array.from(out);
}

export function expandWithEquivalents(codes: string[]): string[] {
  const out = new Set<string>(codes);
  for (const c of codes) {
    for (const eq of getEquivalentsForMouraCode(c)) out.add(eq);
  }
  return Array.from(out);
}
