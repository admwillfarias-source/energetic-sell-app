import { getFitments, type Fitment } from "@/lib/catalogStore";

export type { Fitment };

export function getCarBrands(): string[] {
  return Array.from(new Set(getFitments().map((f) => f.brand))).sort();
}

export function getModels(brand: string): string[] {
  if (!brand) return [];
  return Array.from(
    new Set(getFitments().filter((f) => f.brand === brand).map((f) => f.model)),
  ).sort();
}

export function getYears(brand: string, model: string): string[] {
  if (!brand || !model) return [];
  const years = new Set<number>();
  for (const f of getFitments()) {
    if (f.brand !== brand || f.model !== model) continue;
    for (let y = f.yearStart; y <= f.yearEnd; y++) years.add(y);
  }
  return Array.from(years).sort((a, b) => b - a).map(String);
}

/** Coleta todos os SKUs (Heliar/Moura/Zetta/Excell) do fitment. */
function collectSkus(f: Fitment): string[] {
  return [f.skuHeliar, f.skuMoura, f.skuZetta, f.skuExcell]
    .filter((s): s is string => !!s && s.trim().length > 0)
    .map((s) => s.trim().toUpperCase());
}

export type VehicleSuggestion = {
  brand: string;
  model: string;
  year: number;
  label: string;
  /** SKUs únicos das 4 marcas para o veículo. */
  codes: string[];
};

function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function searchVehicles(query: string, limit = 12): VehicleSuggestion[] {
  const q = normalize(query);
  if (q.length < 2) return [];
  const tokens = q.split(" ").filter(Boolean);
  const yearToken = tokens.find((t) => /^(19|20)\d{2}$/.test(t));
  const year = yearToken ? Number(yearToken) : null;
  const textTokens = tokens.filter((t) => t !== yearToken);

  type Row = {
    brand: string;
    model: string;
    yStart: number;
    yEnd: number;
    skus: Set<string>;
  };

  // Uma linha por PERÍODO do fitment (não fundir períodos diferentes).
  const rows: Row[] = [];
  for (const f of getFitments()) {
    const skus = new Set(collectSkus(f));
    if (skus.size === 0) continue;
    rows.push({
      brand: f.brand,
      model: f.model,
      yStart: f.yearStart,
      yEnd: f.yearEnd,
      skus,
    });
  }

  const scored: { row: Row; score: number; matchedYear: number }[] = [];
  for (const row of rows) {
    const hay = normalize(`${row.brand} ${row.model}`);
    let score = 0;
    let allMatch = true;
    for (const t of textTokens) {
      if (hay.includes(t)) {
        score += t.length;
        if (hay.startsWith(t)) score += 2;
      } else {
        allMatch = false;
        break;
      }
    }
    if (!allMatch && textTokens.length > 0) continue;
    if (textTokens.length === 0 && !year) continue;
    const matchedYear = year ?? row.yEnd;
    if (year) {
      if (year < row.yStart || year > row.yEnd) continue;
      score += 5;
    }
    scored.push({ row, score, matchedYear });
  }

  scored.sort((a, b) => b.score - a.score || b.row.yEnd - a.row.yEnd);

  // Dedup por período exato (brand|model|yStart-yEnd).
  const seen = new Set<string>();
  const out: VehicleSuggestion[] = [];
  for (const { row, matchedYear } of scored) {
    const key = `${row.brand}|${row.model}|${row.yStart}-${row.yEnd}`;
    if (seen.has(key)) continue;
    seen.add(key);
    if (year) {
      out.push({
        brand: row.brand,
        model: row.model,
        year,
        label: `${row.brand} ${row.model} ${year}`,
        codes: Array.from(row.skus),
      });
    } else {
      const yearLabel = row.yStart === row.yEnd ? `${row.yStart}` : `${row.yStart}-${row.yEnd}`;
      out.push({
        brand: row.brand,
        model: row.model,
        year: matchedYear,
        label: `${row.brand} ${row.model} (${yearLabel})`,
        codes: Array.from(row.skus),
      });
    }
    if (out.length >= limit) break;
  }
  return out;
}
