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

const KNOWN_BRANDS = ["Moura", "Heliar", "Bosch", "Acdelco", "ACDelco"] as const;

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function parsePrice(p: WCProduct["prices"]): { price: number; oldPrice?: number } {
  const div = Math.pow(10, p.currency_minor_unit ?? 2);
  const price = Number(p.price) / div;
  const regular = Number(p.regular_price) / div;
  return regular > price ? { price, oldPrice: regular } : { price };
}

function detectBrand(name: string): Battery["brand"] {
  const n = name.toLowerCase();
  if (n.includes("moura")) return "Moura";
  if (n.includes("heliar")) return "Heliar";
  if (n.includes("bosch")) return "Bosch";
  if (n.includes("delco") || n.includes("acdelco")) return "Acdelco";
  return "Moura";
}

function detectAmperage(name: string, desc: string): number {
  const m = (name + " " + desc).match(/(\d{2,3})\s*ah/i);
  return m ? Number(m[1]) : 60;
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
    brand: detectBrand(p.name),
    amperage: detectAmperage(p.name, fullDesc),
    warranty: detectWarranty(fullDesc),
    price,
    oldPrice,
    image: p.images?.[0]?.src ?? "/placeholder.svg",
    description: shortDesc || fullDesc.slice(0, 180),
    compatibility: p.categories.map((c) => c.name),
    features: KNOWN_BRANDS.filter((b) => fullDesc.toLowerCase().includes(b.toLowerCase())).slice(0, 3),
  };
}

export type SearchParams = {
  search?: string;
  perPage?: number;
};

export async function fetchBatteries({ search, perPage = 30 }: SearchParams = {}): Promise<Battery[]> {
  const params = new URLSearchParams({ per_page: String(perPage) });
  if (search) params.set("search", search);

  const { data, error } = await supabase.functions.invoke<WCProduct[]>(
    `wc-products?${params.toString()}`,
    { method: "GET" },
  );
  if (error) throw new Error(`Falha ao buscar produtos: ${error.message}`);
  if (!data) return [];
  return data.map(mapToBattery);
}
