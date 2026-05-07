// Lazy import: o client supabase (~128KB) não entra no chunk inicial.
const getSupabase = () =>
  import("@/integrations/supabase/client").then((m) => m.supabase);

export type Fitment = {
  id?: string;
  brand: string;
  model: string;
  yearStart: number;
  yearEnd: number;
  code: string;
  skuHeliar?: string | null;
  skuMoura?: string | null;
  skuZetta?: string | null;
  skuExcell?: string | null;
};

type DBFitment = {
  id: string;
  brand: string;
  model: string;
  year_start: number;
  year_end: number;
  code: string;
  sku_heliar: string | null;
  sku_moura: string | null;
  sku_zetta: string | null;
  sku_excell: string | null;
};

let fitmentsCache: Fitment[] | null = null;
let loadingPromise: Promise<void> | null = null;

export function invalidateCatalogCache() {
  fitmentsCache = null;
  loadingPromise = null;
  window.dispatchEvent(new CustomEvent("catalog-data-updated"));
}

export async function ensureCatalogLoaded(): Promise<void> {
  if (fitmentsCache) return;
  if (loadingPromise) return loadingPromise;
  loadingPromise = (async () => {
    const PAGE = 1000;
    const fitsAll: DBFitment[] = [];
    const supabase = await getSupabase();
    for (let from = 0; ; from += PAGE) {
      const { data, error } = await supabase
        .from("fitments")
        .select("*")
        .order("brand")
        .order("model")
        .range(from, from + PAGE - 1);
      if (error) throw error;
      if (!data || data.length === 0) break;
      fitsAll.push(...(data as unknown as DBFitment[]));
      if (data.length < PAGE) break;
    }
    fitmentsCache = fitsAll.map((r) => ({
      id: r.id,
      brand: r.brand,
      model: r.model,
      yearStart: r.year_start,
      yearEnd: r.year_end,
      code: r.code,
      skuHeliar: r.sku_heliar,
      skuMoura: r.sku_moura,
      skuZetta: r.sku_zetta,
      skuExcell: r.sku_excell,
    }));
  })();
  try {
    await loadingPromise;
  } finally {
    loadingPromise = null;
  }
}

export function getFitments(): Fitment[] {
  return fitmentsCache ?? [];
}
