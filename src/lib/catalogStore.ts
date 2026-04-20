import { supabase } from "@/integrations/supabase/client";

export type Fitment = {
  id?: string;
  brand: string;
  model: string;
  yearStart: number;
  yearEnd: number;
  code: string;
};

type DBFitment = {
  id: string;
  brand: string;
  model: string;
  year_start: number;
  year_end: number;
  code: string;
};

// Cache em memória — invalidado via window event "catalog-data-updated"
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
    for (let from = 0; ; from += PAGE) {
      const { data, error } = await supabase
        .from("fitments")
        .select("*")
        .order("brand")
        .order("model")
        .range(from, from + PAGE - 1);
      if (error) throw error;
      if (!data || data.length === 0) break;
      fitsAll.push(...(data as DBFitment[]));
      if (data.length < PAGE) break;
    }
    fitmentsCache = fitsAll.map((r) => ({
      id: r.id,
      brand: r.brand,
      model: r.model,
      yearStart: r.year_start,
      yearEnd: r.year_end,
      code: r.code,
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
