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
  const text = `${name} ${desc}`;
  // Try patterns like "60Ah", "60 Ah", "60ah"
  const m = text.match(/(\d{1,3})\s*ah\b/i);
  if (m) return Number(m[1]);
  // Patterns like "M60GD" -> 60, "M100QD" -> 100
  const code = text.match(/\bm[a-z]?(\d{2,3})[a-z]{1,3}\b/i);
  if (code) return Number(code[1]);
  return 60;
}

function detectWarranty(text: string): number {
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
    warranty: detectWarranty(fullDesc),
    price,
    oldPrice,
    image: p.images?.[0]?.src ?? "/placeholder.svg",
    description: shortDesc || fullDesc.slice(0, 180),
    compatibility: p.categories.map((c) => c.name),
    features: [],
    permalink: p.permalink,
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
