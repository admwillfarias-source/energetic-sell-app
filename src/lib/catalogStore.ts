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

const CACHE_KEY = "awr_fitments_v1";
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 min

let fitmentsCache: Fitment[] | null = null;
let loadingPromise: Promise<void> | null = null;

function readSessionCache(): Fitment[] | null {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const { at, data } = JSON.parse(raw) as { at: number; data: Fitment[] };
    if (Date.now() - at > CACHE_TTL_MS) return null;
    return Array.isArray(data) ? data : null;
  } catch {
    return null;
  }
}

function writeSessionCache(data: Fitment[]) {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify({ at: Date.now(), data }));
  } catch {
    /* quota cheia: ignora */
  }
}

export function invalidateCatalogCache() {
  fitmentsCache = null;
  loadingPromise = null;
  try {
    sessionStorage.removeItem(CACHE_KEY);
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new CustomEvent("catalog-data-updated"));
}

export async function ensureCatalogLoaded(): Promise<void> {
  if (fitmentsCache) return;
  // Tenta cache de sessão antes de bater no banco.
  const cached = readSessionCache();
  if (cached) {
    fitmentsCache = cached;
    return;
  }
  if (loadingPromise) return loadingPromise;
  loadingPromise = (async () => {
    const PAGE = 1000;
    const fitsAll: DBFitment[] = [];
    const supabase = await getSupabase();
    // Select apenas das colunas usadas pelo cliente — corta ~30% do payload.
    const COLS = "brand,model,year_start,year_end,code,sku_heliar,sku_moura,sku_zetta,sku_excell";
    for (let from = 0; ; from += PAGE) {
      const { data, error } = await supabase
        .from("fitments")
        .select(COLS)
        .order("brand")
        .order("model")
        .range(from, from + PAGE - 1);
      if (error) throw error;
      if (!data || data.length === 0) break;
      fitsAll.push(...(data as unknown as DBFitment[]));
      if (data.length < PAGE) break;
    }
    fitmentsCache = fitsAll.map((r) => ({
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
    writeSessionCache(fitmentsCache);
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
