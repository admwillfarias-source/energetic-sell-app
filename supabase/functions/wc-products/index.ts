const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

const WC_BASE = "https://awrbaterias.com.br/wp-json/wc/store/products";

type WCProduct = { id: number; sku?: string; name?: string };

async function fetchJson(url: string): Promise<unknown[]> {
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  if (!res.ok) return [];
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

// Heurística: termos sem espaço e curtos (<=12) que não parecem nome são tratados como SKU.
// Ex.: "M60GD", "H60DD", "EXF60DPD", "Z50ED" → SKU.
//      "Heliar 60Ah", "Moura 60AD" → texto (search).
function looksLikeSku(term: string): boolean {
  const t = term.trim();
  if (!t || t.includes(" ")) return false;
  if (t.length > 14) return false;
  // ao menos 1 letra e 1 dígito, sem caracteres exóticos
  return /^[A-Za-z0-9-]+$/.test(t) && /[A-Za-z]/.test(t) && /\d/.test(t);
}

async function fetchByTerm(term: string, perPage: string): Promise<unknown[]> {
  const t = term.trim();
  if (!t) return [];

  // 1) SKU exato — endpoint store/products aceita ?sku=
  if (looksLikeSku(t)) {
    const skuUrl = new URL(WC_BASE);
    skuUrl.searchParams.set("per_page", perPage);
    skuUrl.searchParams.set("sku", t);
    const bySku = await fetchJson(skuUrl.toString());
    if (bySku.length) return bySku;
    // 2) fallback: search pelo SKU como texto (alguns SKUs aparecem no título)
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

    let body: string;
    let status = 200;

    if (codesParam) {
      // Multi-termo: busca cada um (SKU exato ou search), dedupe por id
      const terms = codesParam.split(",").map((c) => c.trim()).filter(Boolean);
      const results = await Promise.all(terms.map((c) => fetchByTerm(c, perPage)));
      const seen = new Set<number>();
      const merged: unknown[] = [];
      for (const arr of results) {
        for (const p of arr) {
          const id = (p as WCProduct).id;
          if (!seen.has(id)) {
            seen.add(id);
            merged.push(p);
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
      const res = await fetch(target.toString(), {
        headers: { Accept: "application/json" },
      });
      body = await res.text();
      status = res.status;
    }

    return new Response(body, {
      status,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=300",
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
