import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

const VERIFY_TOKEN = Deno.env.get("WHATSAPP_VERIFY_TOKEN") ?? "lovable-whatsapp-verify";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const url = new URL(req.url);

  // Verificação inicial do webhook (Meta envia GET)
  if (req.method === "GET") {
    const mode = url.searchParams.get("hub.mode");
    const token = url.searchParams.get("hub.verify_token");
    const challenge = url.searchParams.get("hub.challenge");
    if (mode === "subscribe" && token === VERIFY_TOKEN) {
      return new Response(challenge ?? "", { status: 200, headers: corsHeaders });
    }
    return new Response("forbidden", { status: 403, headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("method not allowed", { status: 405, headers: corsHeaders });
  }

  try {
    const payload = await req.json();

    // Extrai status/message_id se disponível
    const entry = payload?.entry?.[0];
    const change = entry?.changes?.[0];
    const value = change?.value;
    const status = value?.statuses?.[0];
    const message = value?.messages?.[0];

    const eventType = status ? "status" : message ? "message" : "other";
    const messageId = status?.id ?? message?.id ?? null;
    const fromPhone = status?.recipient_id ?? message?.from ?? null;
    const statusStr = status?.status ?? null;

    await supabase.from("whatsapp_webhooks").insert({
      event_type: eventType,
      message_id: messageId,
      from_phone: fromPhone,
      status: statusStr,
      payload,
    });

    return new Response("EVENT_RECEIVED", { status: 200, headers: corsHeaders });
  } catch (e) {
    console.error("webhook error", e);
    return new Response("error", { status: 200, headers: corsHeaders });
  }
});
