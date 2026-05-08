const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

const WC_BASE = "https://awrbaterias.com.br/wp-json/wc/store/products";

type WCProduct = { id: number; sku?: string; name?: string };

// Mantém apenas os campos que o cliente realmente usa para mapear em Battery.
// Reduz drasticamente o payload (descrições WP completas chegam a ~150KB).
function slim(p: Record<string, unknown>): Record<string, unknown> {
  const images = Array.isArray(p.images) && p.images.length
    ? [{ src: (p.images[0] as Record<string, unknown>)?.src ?? "" }]
    : [];
  const cats = Array.isArray(p.categories)
    ? (p.categories as Array<Record<string, unknown>>).map((c) => ({
        id: c.id, name: c.name, slug: c.slug,
      }))
    : [];
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    permalink: p.permalink,
    sku: p.sku,
    prices: p.prices,
    images,
    categories: cats,
    short_description: p.short_description,
    description: p.description,
  };
}

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
  return /^[A-Za-z0-9.,-]+$/.test(t) && /[A-Za-z]/.test(t) && /\d/.test(t);
}

function skuVariants(term: string): string[] {
  const t = term.trim().toUpperCase();
  const variants = new Set<string>([t]);
  if (t.startsWith("HEFB")) variants.add(t.replace(/^HEFB/, "EFB"));
  if (t.startsWith("HFB")) variants.add(t.replace(/^HFB/, "EFB"));
  if (t.startsWith("EFB")) variants.add(`H${t}`);
  if (t.startsWith("HAGM")) variants.add(t.replace(/^HAGM/, "AGM"));
  if (t.startsWith("AGM")) variants.add(`H${t}`);
  if (t.startsWith("HS")) variants.add(t.replace(/^HS/, "H"));
  return Array.from(variants);
}

function chunk<T>(items: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
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
        const expandedTerms = Array.from(new Set(terms.flatMap(skuVariants)));
        for (const group of chunk(expandedTerms, 25)) {
          const skuUrl = new URL(WC_BASE);
          skuUrl.searchParams.set("per_page", perPage);
          skuUrl.searchParams.set("sku", group.join(","));
          const arr = await fetchJson(skuUrl.toString());
          for (const p of arr) {
            const id = (p as WCProduct).id;
            if (!seen.has(id)) {
              seen.add(id);
              merged.push(p);
            }
          }
          if (expandedTerms.length > 25) await wait(120);
        }
        // Fallback: para SKUs não retornados, tenta search individual (paralelo)
        const returnedSkus = new Set(
          merged
            .map((p) => ((p as WCProduct).sku ?? "").toUpperCase())
            .filter(Boolean),
        );
        const missing = terms.filter((t) => !skuVariants(t).some((v) => returnedSkus.has(v)));
        if (missing.length) {
          for (const c of missing.slice(0, 30)) {
            const arr2 = await fetchByTerm(c, perPage);
            for (const p of arr2) {
              const id = (p as WCProduct).id;
              if (!seen.has(id)) {
                seen.add(id);
                merged.push(p);
              }
            }
            await wait(120);
          }
        }
      } else {
        for (const c of terms) {
          const arr = await fetchByTerm(c, perPage);
          for (const p of arr) {
            const id = (p as WCProduct).id;
            if (!seen.has(id)) {
              seen.add(id);
              merged.push(p);
            }
          }
          if (terms.length > 1) await wait(120);
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
    return new Response(JSON.stringify([]), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
