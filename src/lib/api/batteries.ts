import type { Battery } from "@/data/batteries";
import { supabase } from "@/integrations/supabase/client";

type WCImage = { src: string; thumbnail?: string; alt?: string };
type WCCategory = { id: number; name: string; slug: string };
type WCProduct = {
  id: number;
  name: string;
  slug: string;
  permalink: string;
  sku: string;
  prices: {
    price: string;
    regular_price: string;
    sale_price: string;
    currency_minor_unit: number;
  };
  images: WCImage[];
  categories: WCCategory[];
  short_description: string;
  description: string;
};

// Order matters: more specific first
const BRAND_PATTERNS: Array<[string, RegExp]> = [
  ["Moura Nobreak", /\bmoura\b.*\bnobreak\b|\bnobreak\b.*\bmoura\b/i],
  ["Moura Moto", /\bmoura\b.*\bmoto\b|\bmoto\b.*\bmoura\b/i],
  ["Motobatt", /\bmotobatt\b/i],
  ["Heliar", /\bheliar\b/i],
  ["Excell", /\bexcell?\b/i],
  ["Freedom", /\bfreedom\b/i],
  ["Zetta", /\bzetta\b/i],
  ["Tudor", /\btudor\b/i],
  ["Eletran", /\beletr[aã]n\b/i],
  ["Moura", /\bmoura\b/i],
  ["Bosch", /\bbosch\b/i],
  ["Acdelco", /\bac\s*delco\b|\bacdelco\b|\bdelco\b/i],
];

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function parsePrice(p: WCProduct["prices"]): { price: number; oldPrice?: number } {
  const div = Math.pow(10, p.currency_minor_unit ?? 2);
  const price = Number(p.price) / div;
  const regular = Number(p.regular_price) / div;
  return regular > price ? { price, oldPrice: regular } : { price };
}

function detectBrand(name: string, desc: string): string {
  const text = `${name} ${desc}`;
  for (const [brand, re] of BRAND_PATTERNS) {
    if (re.test(text)) return brand;
  }
  return "Moura";
}

function detectAmperage(name: string, desc: string): number {
  // Prioriza a descrição: "60Ah", "60 Ah", "60ah"
  const fromDesc = desc.match(/(\d{1,3})\s*ah\b/i);
  if (fromDesc) return Number(fromDesc[1]);
  // Depois tenta no nome
  const fromName = name.match(/(\d{1,3})\s*ah\b/i);
  if (fromName) return Number(fromName[1]);
  // Padrões de código tipo "M60GD" -> 60, "M100QD" -> 100
  const codeDesc = desc.match(/\bm[a-z]?(\d{2,3})[a-z]{1,3}\b/i);
  if (codeDesc) return Number(codeDesc[1]);
  const codeName = name.match(/\bm[a-z]?(\d{2,3})[a-z]{1,3}\b/i);
  if (codeName) return Number(codeName[1]);
  return 60;
}

// SKUs Moura com garantia diferenciada (override por modelo)
const WARRANTY_24_SKUS = new Set([
  "M48SR", "M40SD", "M48FE", "M48FD",
  "M50ED", "M50JE", "M50JD", "M50JL",
  "M70KD", "M70KE",
  "M60AD", "M60GD",
  "M75LD", "M78LD",
  "MA60AD", "MA70LD", "MA80CD", "MA92QD", "MA105DD",
  "MF50ED", "MF60AD", "MF72LD", "MF80CD",
]);

const WARRANTY_15_SKUS = new Set([
  "M80CD", "M80RD", "M80RE",
  "M90TD", "M90TE",
  "M95QD", "M100QD", "M100HE",
  "M150BD", "M180BD", "M180BE",
  "M220PD", "M220PE",
]);

function detectWarranty(text: string, sku?: string, name?: string): number {
  // 1) Override por SKU/nome (Moura)
  const candidates: string[] = [];
  if (sku) candidates.push(sku.toUpperCase());
  if (name) {
    const codeMatch = name.toUpperCase().match(/\bM[A-Z]?\d{2,3}[A-Z]{1,3}\b/g);
    if (codeMatch) candidates.push(...codeMatch);
  }
  for (const c of candidates) {
    if (WARRANTY_24_SKUS.has(c)) return 24;
    if (WARRANTY_15_SKUS.has(c)) return 15;
  }
  // 2) Texto explícito
  const m = text.match(/(\d{1,2})\s*meses/i);
  return m ? Number(m[1]) : 18;
}

function mapToBattery(p: WCProduct): Battery {
  const shortDesc = stripHtml(p.short_description);
  const fullDesc = stripHtml(p.description);
  const { price, oldPrice } = parsePrice(p.prices);
  return {
    id: String(p.id),
    name: p.name,
    brand: detectBrand(p.name, fullDesc),
    amperage: detectAmperage(p.name, fullDesc),
    warranty: detectWarranty(fullDesc, p.sku, p.name),
    price,
    oldPrice,
    image: p.images?.[0]?.src ?? "/placeholder.svg",
    description: shortDesc || fullDesc.slice(0, 180),
    compatibility: p.categories.map((c) => c.name),
    features: [],
    permalink: p.permalink,
    sku: p.sku,
  };
}

export type SearchParams = {
  search?: string;
  codes?: string[];
  perPage?: number;
};

export async function fetchBatteries({
  search,
  codes,
  perPage = 30,
}: SearchParams = {}): Promise<Battery[]> {
  const params = new URLSearchParams({ per_page: String(perPage) });
  if (codes && codes.length) params.set("codes", codes.join(","));
  else if (search) params.set("search", search);

  const { data, error } = await supabase.functions.invoke<WCProduct[]>(
    `wc-products?${params.toString()}`,
    { method: "GET" },
  );
  if (error) throw new Error(`Falha ao buscar produtos: ${error.message}`);
  if (!data) return [];
  return data.map(mapToBattery);
}

export type VehicleBrand = "Moura" | "Heliar" | "Excell" | "Zetta";

const VEHICLE_BRANDS: VehicleBrand[] = ["Moura", "Heliar", "Excell", "Zetta"];

const BRAND_NAME_RE: Record<VehicleBrand, RegExp> = {
  Moura: /\bmoura\b/i,
  Heliar: /\bheliar\b/i,
  Excell: /\bexcell?\b/i,
  Zetta: /\bzetta\b/i,
};

function brandFromProductName(name: string): VehicleBrand | null {
  for (const b of VEHICLE_BRANDS) {
    if (BRAND_NAME_RE[b].test(name)) return b;
  }
  return null;
}

function ahFromAny(text: string): number | null {
  const m = text.match(/(\d{2,3})\s*ah\b/i);
  if (m) return Number(m[1]);
  const code = text.match(/[a-z]?(\d{2,3})[a-z]{1,3}\b/i);
  return code ? Number(code[1]) : null;
}

/**
 * Equivalências de SKUs cadastrados na planilha que não existem (ou mudaram
 * de nomenclatura) no catálogo do WooCommerce. Mapeia o SKU do fitment para
 * o SKU real disponível na loja, garantindo que a marca apareça no resultado.
 */
const SKU_ALIASES: Record<string, string> = {
  // Moura — códigos antigos/variações sem estoque mapeados para o equivalente
  M40JD: "M40SD",
  M48BD: "M48FD",
  M48BE: "M48FE",
  M80RE: "M80RD",
  M180BD: "M180BE",
  M180TD: "M180BE",
  M180TE: "M180BE",
};

/**
 * Busca baterias APENAS pelos SKUs cadastrados na planilha para o veículo.
 * Aplica equivalências (aliases) para SKUs que não existem mais no catálogo
 * — sem isso, marcas como Moura ficam ocultas em vários veículos (ex.: FIT 2008).
 */
export async function fetchBatteriesByVehicle(
  codes: string[],
  _groups: Partial<Record<VehicleBrand, string[]>> = {},
): Promise<Battery[]> {
  if (!codes.length) return [];

  const wanted = new Set<string>();
  for (const raw of codes) {
    const c = raw.trim().toUpperCase();
    if (!c) continue;
    wanted.add(c);
    const alias = SKU_ALIASES[c];
    if (alias) wanted.add(alias.toUpperCase());
  }

  const list = await fetchBatteries({ codes: Array.from(wanted), perPage: 30 });
  const filtered = list.filter((p) => !!p.sku && wanted.has(p.sku.toUpperCase()));

  return filtered.sort((a, b) => b.price - a.price);
}
