const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const WC_BASE = "https://awrbaterias.com.br/wp-json/wc/v3";

type Item = {
  product_id?: number;
  name: string;
  quantity: number;
  price: number;
};

type Payload = {
  customer: {
    nome: string;
    documento: string;
    telefone: string;
    endereco: string;
    numero: string;
    cep: string;
    pagamento: string;
    carroAno: string;
    entrega?: string;
  };
  items: Item[];
};

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

    const body = (await req.json()) as Payload;
    if (!body?.items?.length || !body?.customer?.nome) {
      return new Response(
        JSON.stringify({ error: "Dados inválidos" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const c = body.customer;
    // separa nome em first/last
    const parts = c.nome.trim().split(/\s+/);
    const first_name = parts.shift() ?? c.nome;
    const last_name = parts.join(" ") || "-";
    const phoneDigits = c.telefone.replace(/\D/g, "");

    const line_items = body.items.map((i) =>
      i.product_id
        ? { product_id: i.product_id, quantity: i.quantity }
        : {
            name: i.name,
            quantity: i.quantity,
            // pedido manual: sem product_id usamos subtotal/total
            subtotal: (i.price * i.quantity).toFixed(2),
            total: (i.price * i.quantity).toFixed(2),
          },
    );

    const orderPayload = {
      status: "pending",
      payment_method: "other",
      payment_method_title: c.pagamento || "A combinar",
      set_paid: false,
      billing: {
        first_name,
        last_name,
        address_1: c.endereco,
        address_2: c.numero,
        postcode: c.cep,
        country: "BR",
        phone: phoneDigits,
      },
      shipping: {
        first_name,
        last_name,
        address_1: c.endereco,
        address_2: c.numero,
        postcode: c.cep,
        country: "BR",
      },
      line_items,
      meta_data: [
        { key: "_cpf_cnpj", value: c.documento },
        { key: "_carro_ano", value: c.carroAno },
        { key: "_entrega", value: c.entrega ?? "" },
        { key: "_origem", value: "BateriaJá - site" },
      ],
      customer_note: `Veículo: ${c.carroAno}\nCPF/CNPJ: ${c.documento}\nPagamento: ${c.pagamento}${c.entrega ? `\nEntrega: ${c.entrega}` : ""}`,
    };

    const auth = btoa(`${ck}:${cs}`);
    const res = await fetch(`${WC_BASE}/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${auth}`,
      },
      body: JSON.stringify(orderPayload),
    });

    const data = await res.json();
    if (!res.ok) {
      console.error("WC error", res.status, data);
      return new Response(
        JSON.stringify({ error: data?.message ?? "Falha ao criar pedido", details: data }),
        { status: res.status, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    return new Response(
      JSON.stringify({
        id: data.id,
        number: data.number,
        payment_url: data.payment_url,
        status: data.status,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error("wc-create-order error:", msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
