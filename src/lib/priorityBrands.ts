// Marcas que aparecem primeiro (primeira página) no bloco "Mais vendidas".
// Configurável pelo admin e persistido no localStorage.

export const ALL_BRANDS = [
  "Moura",
  "Heliar",
  "Excell",
  "Zetta",
  "Freedom",
  "Tudor",
  "Bosch",
  "Acdelco",
  "Moura Nobreak",
  "Moura Moto",
  "Motobatt",
  "Eletran",
] as const;

const STORAGE_KEY = "priorityBrands.v1";
const DEFAULT: string[] = ["Moura", "Heliar", "Excell"];

export function getPriorityBrands(): string[] {
  if (typeof window === "undefined") return DEFAULT;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.every((v) => typeof v === "string")) {
      return parsed;
    }
  } catch {
    // ignore
  }
  return DEFAULT;
}

export function setPriorityBrands(brands: string[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(brands));
  window.dispatchEvent(new CustomEvent("priority-brands-updated"));
}
