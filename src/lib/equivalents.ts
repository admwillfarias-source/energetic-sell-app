import { getEquivalents } from "@/lib/catalogStore";

// Fallback por amperagem — usado quando o código Moura não está cadastrado.
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

function ahFromMouraCode(code: string): number | null {
  const m = code.match(/m[a-z]?(\d{2,3})/i);
  return m ? Number(m[1]) : null;
}

export function getEquivalentsForMouraCode(code: string): string[] {
  const upper = code.toUpperCase();
  const group = getEquivalents().find((g) =>
    g.moura.some((c) => c.toUpperCase() === upper),
  );
  if (group) {
    const out: string[] = [];
    for (const c of group.moura) if (c.toUpperCase() !== upper) out.push(c);
    out.push(...group.heliar, ...group.zetta, ...group.excell);
    return out;
  }
  const ah = ahFromMouraCode(code);
  if (!ah) return [];
  return BY_AH[ah] ?? [];
}

export function expandWithEquivalents(codes: string[]): string[] {
  const out = new Set<string>(codes);
  for (const c of codes) {
    for (const eq of getEquivalentsForMouraCode(c)) out.add(eq);
  }
  return Array.from(out);
}
