import fitmentsData from "@/data/fitments.json";

export type Fitment = {
  brand: string;
  model: string;
  yearStart: number;
  yearEnd: number;
  code: string;
};

const fitments = fitmentsData as Fitment[];

export function getCarBrands(): string[] {
  return Array.from(new Set(fitments.map((f) => f.brand))).sort();
}

export function getModels(brand: string): string[] {
  if (!brand) return [];
  return Array.from(
    new Set(fitments.filter((f) => f.brand === brand).map((f) => f.model)),
  ).sort();
}

export function getYears(brand: string, model: string): string[] {
  if (!brand || !model) return [];
  const years = new Set<number>();
  for (const f of fitments) {
    if (f.brand !== brand || f.model !== model) continue;
    for (let y = f.yearStart; y <= f.yearEnd; y++) years.add(y);
  }
  return Array.from(years).sort((a, b) => b - a).map(String);
}

export function findCompatibleCodes(
  brand: string,
  model: string,
  year: string | number,
): string[] {
  const y = Number(year);
  const codes = new Set<string>();
  for (const f of fitments) {
    if (f.brand === brand && f.model === model && y >= f.yearStart && y <= f.yearEnd) {
      codes.add(f.code);
    }
  }
  return Array.from(codes);
}
