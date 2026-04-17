import { corsHeaders } from "@supabase/supabase-js/cors";

const WC_BASE = "https://awrbaterias.com.br/wp-json/wc/store/products";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const search = url.searchParams.get("search") ?? "";
    const perPage = url.searchParams.get("per_page") ?? "30";

    const target = new URL(WC_BASE);
    target.searchParams.set("per_page", perPage);
    if (search) target.searchParams.set("search", search);

    const res = await fetch(target.toString(), {
      headers: { Accept: "application/json" },
    });
    const body = await res.text();

    return new Response(body, {
      status: res.status,
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
