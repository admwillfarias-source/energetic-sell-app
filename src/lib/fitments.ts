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
 * Encontra a melhor linha (fitment) da tabela para um rótulo de veículo.
 * Aplica match exato ou prefixo do modelo, dentro do intervalo de anos.
 */
export function getStrictVehicleFitment(label: string): Fitment | null {
  const normalized = normalize(label);
  // Aceita ano único ("2018") ou intervalo ("2018-2021", "2018 a 2021").
  // Quando vier intervalo, usamos o ano final (mais recente) para casar com
  // a tabela e removemos AMBOS os anos da string antes de comparar o modelo.
  const rangeMatch = normalized.match(/\b((?:19|20)\d{2})\s*(?:-|–|—|a|ate|até)\s*((?:19|20)\d{2})\b/);
  let year: number;
  let withoutYear: string;
  if (rangeMatch) {
    year = Number(rangeMatch[2]);
    withoutYear = normalize(normalized.replace(rangeMatch[0], ""));
  } else {
    const yearMatch = normalized.match(/\b(19|20)\d{2}\b/);
    if (!yearMatch) return null;
    year = Number(yearMatch[0]);
    withoutYear = normalize(normalized.replace(yearMatch[0], ""));
  }

  type Match = { f: Fitment; exact: boolean; modelLen: number };
  const matches: Match[] = [];

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
    matches.push({ f, exact: sameModel, modelLen: model.length });
  }

  if (matches.length === 0) return null;

  matches.sort((a, b) => {
    if (a.exact !== b.exact) return a.exact ? -1 : 1;
    return a.modelLen - b.modelLen;
  });

  return matches[0].f;
}

/**
 * Mapeia, por marca de bateria, o SKU homologado na tabela para o veículo.
 * Garante que o produto exibido corresponde EXATAMENTE ao SKU cadastrado
 * para cada marca (não há "adivinhação" pela descrição do WooCommerce).
 */
export type BrandSkuMap = Partial<Record<"Moura" | "Heliar" | "Zetta" | "Excell", string>>;

export function getStrictVehicleSkuMap(label: string): BrandSkuMap {
  const f = getStrictVehicleFitment(label);
  if (!f) return {};
  const map: BrandSkuMap = {};
  if (f.skuMoura?.trim()) map.Moura = f.skuMoura.trim().toUpperCase();
  if (f.skuHeliar?.trim()) map.Heliar = f.skuHeliar.trim().toUpperCase();
  if (f.skuZetta?.trim()) map.Zetta = f.skuZetta.trim().toUpperCase();
  if (f.skuExcell?.trim()) map.Excell = f.skuExcell.trim().toUpperCase();
  return map;
}

/**
 * Mantido por compatibilidade — retorna apenas a lista de SKUs únicos do
 * fitment cadastrado para o veículo (ordenada por Moura, Zetta, Heliar, Excell).
 */
export function getStrictVehicleCodes(label: string): string[] {
  const f = getStrictVehicleFitment(label);
  if (!f) return [];
  const ordered = [f.skuMoura, f.skuZetta, f.skuHeliar, f.skuExcell, f.code];
  const out: string[] = [];
  const seen = new Set<string>();
  for (const s of ordered) {
    if (!s) continue;
    const v = s.trim().toUpperCase();
    if (!v || seen.has(v)) continue;
    seen.add(v);
    out.push(v);
  }
  return out;
}

/** SKUs (Moura, Zetta, Heliar, Excell + code) deduplicados de um fitment. */
export function fitmentSkus(f: Fitment): string[] {
  const ordered = [f.skuMoura, f.skuZetta, f.skuHeliar, f.skuExcell, f.code];
  const out: string[] = [];
  const seen = new Set<string>();
  for (const s of ordered) {
    if (!s) continue;
    const v = s.trim().toUpperCase();
    if (!v || seen.has(v)) continue;
    seen.add(v);
    out.push(v);
  }
  return out;
}

export type VehicleVariant = {
  fitment: Fitment;
  /** Sufixo descritivo do modelo, ex.: "1.0", "Diesel", "com Start-Stop". */
  variantLabel: string;
  /** True se o nome do modelo indica explicitamente Start/Stop. */
  hasStartStop: boolean;
  skus: string[];
};

/**
 * Retorna as variantes (linhas da tabela) que atendem a uma marca + nome
 * base de modelo (ex.: "HB20", "Compass") em um ano específico.
 * Usado para que, em "mais buscados", o cliente escolha entre HB20 1.0,
 * HB20 1.6, HB20 Diamond Start-Stop, etc., quando houver múltiplas linhas.
 */
export function getVehicleVariants(
  brand: string,
  modelBase: string,
  year: number,
): VehicleVariant[] {
  const brandN = normalize(brand);
  const baseN = normalize(modelBase);
  if (!brandN || !baseN) return [];

  const out: VehicleVariant[] = [];
  for (const f of getFitments()) {
    if (year < f.yearStart || year > f.yearEnd) continue;
    if (normalize(f.brand) !== brandN) continue;
    const m = normalize(f.model);
    // Match: começa com o modelo base seguido de espaço/parêntese/fim.
    if (m !== baseN && !m.startsWith(`${baseN} `)) continue;

    const skus = fitmentSkus(f);
    if (!skus.length) continue;

    // Sufixo legível: pega tudo após o nome base original.
    const upperBase = modelBase.toUpperCase();
    let suffix = f.model.toUpperCase().startsWith(upperBase)
      ? f.model.slice(upperBase.length).trim()
      : f.model;
    suffix = suffix.replace(/^[-–—:]+\s*/, "").trim();

    const ssRe = /start[\s-]*stop/i;
    const semSS = /sem\s+start[\s-]*stop/i.test(f.model);
    const comSS = !semSS && ssRe.test(f.model);

    out.push({
      fitment: f,
      variantLabel: suffix || "Padrão",
      hasStartStop: comSS,
      skus,
    });
  }
  return out;
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
  // Tolerância reduzida para evitar sugerir modelos não relacionados.
  if (token.length <= 3) return 0;
  if (token.length <= 5) return 1;
  if (token.length <= 8) return 2;
  return 2;
}

/**
 * Normalização "fonética" leve para tolerar variações comuns de grafia
 * (ph→f, k→c, y→i, w→v, qu→k, ç→c, letras duplicadas). Usada em paralelo
 * à comparação literal para aumentar a chance de match.
 */
function phoneticKey(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ph/g, "f")
    .replace(/qu/g, "k")
    .replace(/[kqc]/g, "k")
    .replace(/y/g, "i")
    .replace(/w/g, "v")
    .replace(/h/g, "")
    .replace(/(.)\1+/g, "$1")
    .replace(/[^a-z0-9]/g, "");
}

/**
 * Score do match de um token contra o nome do veículo.
 * Retorna -1 se nenhum tipo de match for encontrado.
 *  - igual exato: maior score
 *  - prefixo: alto
 *  - substring: médio
 *  - fuzzy (Levenshtein dentro do limite): baixo
 *  - fonético: baixo (tolera ph/f, k/c, y/i, letras duplicadas)
 *  - colado (haystack sem espaços contém o token): médio (cobre "L200" vs "L 200")
 */
function matchToken(token: string, hayTokens: string[], hayJoined: string): number {
  let best = -1;
  if (hayJoined.includes(token)) best = Math.max(best, 4 + token.length);

  const tokenPhon = phoneticKey(token);

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
    if (max > 0 && Math.abs(h.length - token.length) <= max + 1) {
      const d = levenshtein(token, h, max);
      if (d <= max) {
        best = Math.max(best, 3 + token.length - d);
        continue;
      }
    }
    // Match fonético: tolera variações de grafia comuns
    if (tokenPhon.length >= 2) {
      const hPhon = phoneticKey(h);
      if (hPhon === tokenPhon) {
        best = Math.max(best, 6 + Math.min(h.length, token.length));
      } else if (hPhon.length >= 3 && (hPhon.startsWith(tokenPhon) || tokenPhon.startsWith(hPhon))) {
        best = Math.max(best, 4 + Math.min(hPhon.length, tokenPhon.length));
      } else if (hPhon.length >= 3 && tokenPhon.length >= 3) {
        const phMax = maxEditsFor(tokenPhon);
        if (Math.abs(hPhon.length - tokenPhon.length) <= phMax) {
          const d = levenshtein(tokenPhon, hPhon, phMax);
          if (d <= phMax) best = Math.max(best, 2 + tokenPhon.length - d);
        }
      }
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
