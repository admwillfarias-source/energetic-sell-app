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

/** Coleta somente os códigos cadastrados na tabela de aplicação. */
function collectSkus(f: Fitment): string[] {
  return [f.code, f.skuHeliar, f.skuMoura, f.skuZetta, f.skuExcell]
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

// Sinônimos / apelidos comuns. Tokens da busca são expandidos antes de comparar.
const SYNONYMS: Record<string, string[]> = {
  vw: ["volkswagen"],
  volks: ["volkswagen"],
  vag: ["volkswagen"],
  mb: ["mercedes", "benz"],
  merc: ["mercedes"],
  mercedes: ["mercedes", "benz"],
  benz: ["mercedes", "benz"],
  gm: ["chevrolet"],
  chevy: ["chevrolet"],
  cit: ["citroen"],
  peu: ["peugeot"],
  ren: ["renault"],
  hyun: ["hyundai"],
  mit: ["mitsubishi"],
  mits: ["mitsubishi"],
  toy: ["toyota"],
  land: ["land", "rover"],
  rover: ["land", "rover"],
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

/**
 * Recalcula os SKUs permitidos para um rótulo de veículo usando somente a
 * tabela de aplicações. Isso impede que códigos extras vindos da URL/cache
 * sejam exibidos para outro modelo/ano.
 */
export function getStrictVehicleCodes(label: string): string[] {
  const normalized = normalize(label);
  const yearMatch = normalized.match(/\b(19|20)\d{2}\b/);
  if (!yearMatch) return [];

  const year = Number(yearMatch[0]);
  const withoutYear = normalize(normalized.replace(yearMatch[0], ""));
  const codeSet = new Set<string>();

  for (const f of getFitments()) {
    if (year < f.yearStart || year > f.yearEnd) continue;

    const brand = normalize(f.brand);
    const model = normalize(f.model);
    if (!brand || !model || !withoutYear.startsWith(brand)) continue;

    const requestedModel = normalize(withoutYear.slice(brand.length));
    if (!requestedModel) continue;

    const sameModel = model === requestedModel;
    const requestedBaseModel = model.startsWith(`${requestedModel} `);
    if (!sameModel && !requestedBaseModel) continue;

    for (const sku of collectSkus(f)) codeSet.add(sku);
  }

  return Array.from(codeSet);
}

/** Distância de Levenshtein limitada (early exit). */
function levenshtein(a: string, b: string, max: number): number {
  if (Math.abs(a.length - b.length) > max) return max + 1;
  const m = a.length, n = b.length;
  if (!m) return n;
  if (!n) return m;
  let prev: number[] = new Array(n + 1);
  let curr: number[] = new Array(n + 1);
  for (let j = 0; j <= n; j++) prev[j] = j;
  for (let i = 1; i <= m; i++) {
    curr[0] = i;
    let rowMin = curr[0];
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(prev[j] + 1, curr[j - 1] + 1, prev[j - 1] + cost);
      if (curr[j] < rowMin) rowMin = curr[j];
    }
    if (rowMin > max) return max + 1;
    [prev, curr] = [curr, prev];
  }
  return prev[n];
}

function maxEditsFor(token: string): number {
  if (token.length <= 3) return 0;
  if (token.length <= 5) return 1;
  return 2;
}

/**
 * Score do match de um token contra o nome do veículo.
 * Retorna -1 se nenhum tipo de match for encontrado.
 *  - igual exato: maior score
 *  - prefixo: alto
 *  - substring: médio
 *  - fuzzy (Levenshtein dentro do limite): baixo
 *  - colado (haystack sem espaços contém o token): médio (cobre "L200" vs "L 200")
 */
function matchToken(token: string, hayTokens: string[], hayJoined: string): number {
  let best = -1;
  if (hayJoined.includes(token)) best = Math.max(best, 4 + token.length);
  for (const h of hayTokens) {
    if (h === token) {
      best = Math.max(best, 12 + token.length);
      continue;
    }
    if (h.startsWith(token) || token.startsWith(h)) {
      best = Math.max(best, 8 + Math.min(h.length, token.length));
      continue;
    }
    if (h.includes(token) || token.includes(h)) {
      best = Math.max(best, 5 + Math.min(h.length, token.length));
      continue;
    }
    const max = maxEditsFor(token);
    if (max > 0 && Math.abs(h.length - token.length) <= max) {
      const d = levenshtein(token, h, max);
      if (d <= max) best = Math.max(best, 3 + token.length - d);
    }
  }
  return best;
}

function expandSynonyms(tokens: string[]): string[][] {
  return tokens.map((t) => {
    const syn = SYNONYMS[t];
    return syn ? Array.from(new Set([t, ...syn])) : [t];
  });
}

export function searchVehicles(query: string, limit = 12): VehicleSuggestion[] {
  const q = normalize(query);
  if (q.length < 2) return [];
  const tokens = q.split(" ").filter(Boolean);
  const yearToken = tokens.find((t) => /^(19|20)\d{2}$/.test(t));
  const year = yearToken ? Number(yearToken) : null;
  const rawTextTokens = tokens.filter((t) => t !== yearToken);
  const tokenAlternatives = expandSynonyms(rawTextTokens);

  type Row = {
    brand: string;
    model: string;
    yStart: number;
    yEnd: number;
    skus: Set<string>;
  };

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
    const hayTokens = hay.split(" ").filter(Boolean);
    const hayJoined = hay.replace(/\s+/g, "");

    let score = 0;
    let allMatch = true;
    for (const alts of tokenAlternatives) {
      // Cada token (com seus sinônimos) precisa achar pelo menos um match.
      let bestForToken = -1;
      for (const alt of alts) {
        const s = matchToken(alt, hayTokens, hayJoined);
        if (s > bestForToken) bestForToken = s;
      }
      if (bestForToken < 0) {
        allMatch = false;
        break;
      }
      score += bestForToken;
    }
    if (!allMatch && tokenAlternatives.length > 0) continue;
    if (tokenAlternatives.length === 0 && !year) continue;

    // Bônus se o primeiro token bate com o início do nome.
    if (tokenAlternatives.length > 0) {
      const firstAlts = tokenAlternatives[0];
      if (firstAlts.some((t) => hay.startsWith(t))) score += 3;
    }

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
