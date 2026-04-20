import { supabase } from "@/integrations/supabase/client";

export type Fitment = {
  id?: string;
  brand: string;
  model: string;
  yearStart: number;
  yearEnd: number;
  code: string;
};

export type EquivalenceGroup = {
  id?: string;
  moura: string[];
  heliar: string[];
  zetta: string[];
  excell: string[];
};

type DBFitment = {
  id: string;
  brand: string;
  model: string;
  year_start: number;
  year_end: number;
  code: string;
};

type DBEquiv = {
  id: string;
  moura: string[];
  heliar: string[];
  zetta: string[];
  excell: string[];
};

// Cache em memória — invalidado via window event "catalog-data-updated"
let fitmentsCache: Fitment[] | null = null;
let equivalentsCache: EquivalenceGroup[] | null = null;
let loadingPromise: Promise<void> | null = null;

export function invalidateCatalogCache() {
  fitmentsCache = null;
  equivalentsCache = null;
  loadingPromise = null;
  window.dispatchEvent(new CustomEvent("catalog-data-updated"));
}

export async function ensureCatalogLoaded(): Promise<void> {
  if (fitmentsCache && equivalentsCache) return;
  if (loadingPromise) return loadingPromise;
  loadingPromise = (async () => {
    const [fitsRes, equivsRes] = await Promise.all([
      supabase.from("fitments").select("*").order("brand").order("model"),
      supabase.from("equivalents").select("*"),
    ]);
    if (fitsRes.error) throw fitsRes.error;
    if (equivsRes.error) throw equivsRes.error;
    fitmentsCache = (fitsRes.data as DBFitment[]).map((r) => ({
      id: r.id,
      brand: r.brand,
      model: r.model,
      yearStart: r.year_start,
      yearEnd: r.year_end,
      code: r.code,
    }));
    equivalentsCache = (equivsRes.data as DBEquiv[]).map((r) => ({
      id: r.id,
      moura: r.moura ?? [],
      heliar: r.heliar ?? [],
      zetta: r.zetta ?? [],
      excell: r.excell ?? [],
      tudor: r.tudor ?? [],
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

export function getEquivalents(): EquivalenceGroup[] {
  return equivalentsCache ?? [];
}
