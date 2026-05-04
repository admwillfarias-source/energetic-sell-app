const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

const WC_BASE = "https://awrbaterias.com.br/wp-json/wc/v3";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const ck = Deno.env.get("WC_CONSUMER_KEY");
    const cs = Deno.env.get("WC_CONSUMER_SECRET");
    if (!ck || !cs) {
      return new Response(
        JSON.stringify({ error: "WooCommerce API keys não configuradas" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    let id: string | null = null;
    if (req.method === "GET") {
      const url = new URL(req.url);
      id = url.searchParams.get("id");
    } else {
      const body = await req.json().catch(() => ({}));
      id = body?.id ? String(body.id) : null;
    }

    if (!id || !/^\d+$/.test(id)) {
      return new Response(
        JSON.stringify({ error: "ID do pedido inválido" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const auth = btoa(`${ck}:${cs}`);
    const res = await fetch(`${WC_BASE}/orders/${id}`, {
      headers: { Authorization: `Basic ${auth}` },
    });
    const data = await res.json();
    if (!res.ok) {
      return new Response(
        JSON.stringify({ error: data?.message ?? "Falha ao buscar pedido" }),
        { status: res.status, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    return new Response(
      JSON.stringify({
        id: data.id,
        number: data.number,
        status: data.status,
        total: data.total,
        currency: data.currency,
        payment_method_title: data.payment_method_title,
        date_created: data.date_created,
        billing: data.billing,
        line_items: (data.line_items ?? []).map((li: any) => ({
          name: li.name,
          quantity: li.quantity,
          total: li.total,
        })),
        customer_note: data.customer_note,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
