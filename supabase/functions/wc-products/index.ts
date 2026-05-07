const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

const WC_BASE = "https://awrbaterias.com.br/wp-json/wc/store/products";

type WCProduct = { id: number; sku?: string; name?: string };

// Cache em memória do isolate (TTL 5 min). Sobrevive entre invocações
// enquanto o isolate estiver "quente" — corta latência da próxima busca
// idêntica para ~5ms.
const CACHE_TTL_MS = 5 * 60 * 1000;
const memCache = new Map<string, { at: number; body: string }>();

function cacheGet(key: string): string | null {
  const hit = memCache.get(key);
  if (!hit) return null;
  if (Date.now() - hit.at > CACHE_TTL_MS) {
    memCache.delete(key);
    return null;
  }
  return hit.body;
}
function cacheSet(key: string, body: string): void {
  memCache.set(key, { at: Date.now(), body });
}

async function fetchJson(url: string, attempt = 0): Promise<unknown[]> {
  try {
    const res = await fetch(url, { headers: { Accept: "application/json" } });
    if (res.status === 429 && attempt < 2) {
      const wait = 400 * (attempt + 1);
      await new Promise((r) => setTimeout(r, wait));
      return fetchJson(url, attempt + 1);
    }
    if (!res.ok) {
      console.warn("wc upstream non-ok:", res.status, url);
      return [];
    }
    const ct = res.headers.get("content-type") ?? "";
    if (!ct.includes("application/json")) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (e) {
    console.warn("wc fetch error:", (e as Error).message);
    return [];
  }
}

// Heurística: termos sem espaço e curtos (<=14) que parecem código → SKU.
function looksLikeSku(term: string): boolean {
  const t = term.trim();
  if (!t || t.includes(" ")) return false;
  if (t.length > 14) return false;
  return /^[A-Za-z0-9-]+$/.test(t) && /[A-Za-z]/.test(t) && /\d/.test(t);
}

async function fetchByTerm(term: string, perPage: string): Promise<unknown[]> {
  const t = term.trim();
  if (!t) return [];
  if (looksLikeSku(t)) {
    const skuUrl = new URL(WC_BASE);
    skuUrl.searchParams.set("per_page", perPage);
    skuUrl.searchParams.set("sku", t);
    const bySku = await fetchJson(skuUrl.toString());
    if (bySku.length) return bySku;
  }
  const searchUrl = new URL(WC_BASE);
  searchUrl.searchParams.set("per_page", perPage);
  searchUrl.searchParams.set("search", t);
  return fetchJson(searchUrl.toString());
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const search = url.searchParams.get("search") ?? "";
    const codesParam = url.searchParams.get("codes") ?? "";
    const perPage = url.searchParams.get("per_page") ?? "30";

    const cacheKey = `c=${codesParam}|s=${search}|pp=${perPage}`;
    const cached = cacheGet(cacheKey);
    if (cached) {
      return new Response(cached, {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
          "Cache-Control": "public, max-age=300, s-maxage=600, stale-while-revalidate=86400",
          "X-Cache": "HIT",
        },
      });
    }

    let body: string;
    let status = 200;

    if (codesParam) {
      const terms = codesParam.split(",").map((c) => c.trim()).filter(Boolean);

      // Otimização: se TODOS os termos parecem SKU, faz UMA única chamada
      // ao WC com sku=A,B,C (Store API aceita lista). Reduz N requests → 1.
      const allSkus = terms.length > 0 && terms.every(looksLikeSku);

      let merged: unknown[] = [];
      const seen = new Set<number>();

      if (allSkus) {
        const skuUrl = new URL(WC_BASE);
        skuUrl.searchParams.set("per_page", perPage);
        skuUrl.searchParams.set("sku", terms.join(","));
        const arr = await fetchJson(skuUrl.toString());
        for (const p of arr) {
          const id = (p as WCProduct).id;
          if (!seen.has(id)) {
            seen.add(id);
            merged.push(p);
          }
        }
        // Fallback: para SKUs não retornados, tenta search individual (paralelo)
        const returnedSkus = new Set(
          merged
            .map((p) => ((p as WCProduct).sku ?? "").toUpperCase())
            .filter(Boolean),
        );
        const missing = terms.filter((t) => !returnedSkus.has(t.toUpperCase()));
        if (missing.length) {
          const fallback = await Promise.all(
            missing.map((c) => fetchByTerm(c, perPage)),
          );
          for (const arr2 of fallback) {
            for (const p of arr2) {
              const id = (p as WCProduct).id;
              if (!seen.has(id)) {
                seen.add(id);
                merged.push(p);
              }
            }
          }
        }
      } else {
        const results = await Promise.all(terms.map((c) => fetchByTerm(c, perPage)));
        for (const arr of results) {
          for (const p of arr) {
            const id = (p as WCProduct).id;
            if (!seen.has(id)) {
              seen.add(id);
              merged.push(p);
            }
          }
        }
      }

      body = JSON.stringify(merged);
    } else if (search) {
      const arr = await fetchByTerm(search, perPage);
      body = JSON.stringify(arr);
    } else {
      const target = new URL(WC_BASE);
      target.searchParams.set("per_page", perPage);
      const arr = await fetchJson(target.toString());
      body = JSON.stringify(arr);
    }

    if (status === 200) cacheSet(cacheKey, body);

    return new Response(body, {
      status,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=300, s-maxage=600, stale-while-revalidate=86400",
        "X-Cache": "MISS",
      },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error("wc-products error:", msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
