const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

const WC_BASE = "https://awrbaterias.com.br/wp-json/wc/store/products";

async function fetchByQuery(q: string, perPage: string): Promise<unknown[]> {
  const target = new URL(WC_BASE);
  target.searchParams.set("per_page", perPage);
  target.searchParams.set("search", q);
  const res = await fetch(target.toString(), {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) return [];
  const data = await res.json();
  return Array.isArray(data) ? data : [];
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
      // Multi-code: fetch each in parallel, dedupe by id
      const codes = codesParam.split(",").map((c) => c.trim()).filter(Boolean);
      const results = await Promise.all(codes.map((c) => fetchByQuery(c, perPage)));
      const seen = new Set<number>();
      const merged: unknown[] = [];
      for (const arr of results) {
        for (const p of arr) {
          const id = (p as { id: number }).id;
          if (!seen.has(id)) {
            seen.add(id);
            merged.push(p);
          }
        }
      }
      body = JSON.stringify(merged);
    } else {
      const target = new URL(WC_BASE);
      target.searchParams.set("per_page", perPage);
      if (search) target.searchParams.set("search", search);
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
