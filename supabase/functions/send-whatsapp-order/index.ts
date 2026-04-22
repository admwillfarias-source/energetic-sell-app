import { z } from "https://esm.sh/zod@3.23.8";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const supabaseAdmin = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const STORE_PHONE = "5551993199486";
const GRAPH_VERSION = "v21.0";

const ItemSchema = z.object({
  name: z.string().min(1).max(200),
  quantity: z.number().int().positive(),
  price: z.number().nonnegative(),
});

const PayloadSchema = z.object({
  customer: z.object({
    nome: z.string().trim().min(2).max(100),
    telefone: z.string().trim().min(10).max(20),
    carroAno: z.string().trim().min(2).max(120),
    entrega: z.string().trim().max(200).optional().default(""),
  }),
  items: z.array(ItemSchema).min(1).max(20),
  total: z.number().nonnegative(),
});

type TemplateMsg = {
  to: string;
  template: string;
  params: string[];
};

function formatBRL(n: number): string {
  return n.toFixed(2).replace(".", ",");
}

function normalizePhoneBR(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("55")) return digits;
  return `55${digits}`;
}

async function sendTemplate(
  phoneNumberId: string,
  token: string,
  msg: TemplateMsg,
): Promise<{ ok: boolean; id?: string; error?: unknown }> {
  const url = `https://graph.facebook.com/${GRAPH_VERSION}/${phoneNumberId}/messages`;
  const body = {
    messaging_product: "whatsapp",
    to: msg.to,
    type: "template",
    template: {
      name: msg.template,
      language: { code: "pt_BR" },
      components: [
        {
          type: "body",
          parameters: msg.params.map((text) => ({ type: "text", text })),
        },
      ],
    },
  };

  let statusCode: number | null = null;
  let responseData: unknown = null;
  let okFlag = false;
  let messageId: string | undefined;
  let errorMessage: string | null = null;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });
    statusCode = res.status;
    responseData = await res.json();
    if (!res.ok) {
      console.error("WhatsApp API error", res.status, msg.template, responseData);
      errorMessage = JSON.stringify((responseData as any)?.error ?? responseData);
    } else {
      okFlag = true;
      messageId = (responseData as any)?.messages?.[0]?.id;
    }
  } catch (e) {
    console.error("WhatsApp fetch error", e);
    errorMessage = e instanceof Error ? e.message : "unknown";
  }

  // Persistir log (não bloqueia se falhar)
  try {
    await supabaseAdmin.from("whatsapp_logs").insert({
      template: msg.template,
      to_phone: msg.to,
      status_code: statusCode,
      ok: okFlag,
      message_id: messageId ?? null,
      request_payload: body,
      response_payload: responseData,
      error_message: errorMessage,
    });
  } catch (e) {
    console.error("log insert failed", e);
  }

  return okFlag
    ? { ok: true, id: messageId }
    : { ok: false, error: errorMessage ?? "unknown" };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const phoneNumberId = Deno.env.get("WHATSAPP_PHONE_NUMBER_ID");
    const token = Deno.env.get("WHATSAPP_ACCESS_TOKEN");
    if (!phoneNumberId || !token) {
      return new Response(
        JSON.stringify({ error: "WhatsApp API não configurada" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const json = await req.json();
    const parsed = PayloadSchema.safeParse(json);
    if (!parsed.success) {
      return new Response(
        JSON.stringify({ error: parsed.error.flatten().fieldErrors }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const { customer, items, total } = parsed.data;

    const bateriaResumo = items
      .map((i) => `${i.quantity}x ${i.name}`)
      .join(", ")
      .slice(0, 200);
    const totalStr = formatBRL(total);
    const clientePhone = normalizePhoneBR(customer.telefone);

    const lojaMsg: TemplateMsg = {
      to: STORE_PHONE,
      template: "novo_pedido_loja",
      params: [
        customer.nome,
        clientePhone,
        customer.carroAno,
        bateriaResumo,
        totalStr,
        customer.entrega || "Não informada",
      ],
    };

    const clienteMsg: TemplateMsg = {
      to: clientePhone,
      template: "confirmacao_pedido_cliente",
      params: [customer.nome.split(" ")[0], bateriaResumo, totalStr],
    };

    const [lojaRes, clienteRes] = await Promise.all([
      sendTemplate(phoneNumberId, token, lojaMsg),
      sendTemplate(phoneNumberId, token, clienteMsg),
    ]);

    return new Response(
      JSON.stringify({
        ok: lojaRes.ok || clienteRes.ok,
        lojaId: lojaRes.id,
        clienteId: clienteRes.id,
        errors: {
          loja: lojaRes.ok ? null : lojaRes.error,
          cliente: clienteRes.ok ? null : clienteRes.error,
        },
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error("send-whatsapp-order error:", msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
