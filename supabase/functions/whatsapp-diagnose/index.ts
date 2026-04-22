import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
};

const GRAPH_VERSION = "v21.0";

function maskToken(t: string): string {
  if (!t) return "";
  if (t.length <= 12) return "*".repeat(t.length);
  return `${t.slice(0, 6)}…${t.slice(-4)} (len=${t.length})`;
}

async function graph(path: string, token: string) {
  const url = `https://graph.facebook.com/${GRAPH_VERSION}/${path}`;
  try {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json().catch(() => ({}));
    return { status: res.status, ok: res.ok, data, url };
  } catch (e) {
    return {
      status: 0,
      ok: false,
      error: e instanceof Error ? e.message : String(e),
      url,
    };
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Auth: somente admins
    const authHeader = req.headers.get("Authorization") ?? "";
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData.user) {
      return new Response(JSON.stringify({ error: "Não autenticado" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const adminClient = createClient(
      supabaseUrl,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const { data: roles } = await adminClient
      .from("user_roles")
      .select("role")
      .eq("user_id", userData.user.id)
      .eq("role", "admin")
      .maybeSingle();
    if (!roles) {
      return new Response(JSON.stringify({ error: "Acesso restrito" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const phoneNumberId = Deno.env.get("WHATSAPP_PHONE_NUMBER_ID") ?? "";
    const token = Deno.env.get("WHATSAPP_ACCESS_TOKEN") ?? "";

    const phoneIdLooksValid = /^\d{10,20}$/.test(phoneNumberId);
    const phoneIdShape = phoneNumberId
      ? `${phoneNumberId.length} chars, ${
        /^\d+$/.test(phoneNumberId) ? "numérico" : "contém não-dígitos"
      }`
      : "vazio";

    // 1. /me — confirma a quem pertence o token (app/system user)
    const me = await graph("me?fields=id,name", token);

    // 2. debug_token — revela app_id, type, scopes, expiração
    const dbg = await graph(
      `debug_token?input_token=${encodeURIComponent(token)}`,
      token,
    );

    // 3. Tenta buscar o phone number atual diretamente
    const phoneInfo = phoneNumberId
      ? await graph(
        `${phoneNumberId}?fields=id,display_phone_number,verified_name,quality_rating,code_verification_status`,
        token,
      )
      : null;

    // 4. Descobre o WABA do phone (se possível) e lista todos os numbers
    let wabaId: string | null = null;
    let phoneNumbers: unknown = null;
    if (phoneInfo?.ok && (phoneInfo.data as any)?.id) {
      // Tenta obter WABA via account
      const acc = await graph(
        `${phoneNumberId}?fields=whatsapp_business_account{id,name}`,
        token,
      );
      wabaId = (acc.data as any)?.whatsapp_business_account?.id ?? null;
    }

    // Se debug_token expôs scopes, tenta listar contas via business
    const dbgData = (dbg.data as any)?.data ?? {};
    const appId = dbgData.app_id ?? null;
    const tokenType = dbgData.type ?? null;
    const tokenScopes = dbgData.scopes ?? [];
    const tokenExpiresAt = dbgData.expires_at ?? null;

    let templates: unknown = null;
    if (wabaId) {
      const list = await graph(
        `${wabaId}/phone_numbers?fields=id,display_phone_number,verified_name,quality_rating`,
        token,
      );
      phoneNumbers = list;

      const tpl = await graph(
        `${wabaId}/message_templates?fields=name,language,status,category,rejected_reason&limit=200`,
        token,
      );
      templates = tpl;
    }

    return new Response(
      JSON.stringify({
        phoneNumberIdSecret: {
          value: phoneNumberId || null,
          looksValid: phoneIdLooksValid,
          shape: phoneIdShape,
        },
        token: {
          masked: maskToken(token),
          length: token.length,
          appId,
          type: tokenType,
          scopes: tokenScopes,
          expiresAt: tokenExpiresAt,
          expiresAtIso: tokenExpiresAt
            ? new Date(tokenExpiresAt * 1000).toISOString()
            : null,
        },
        me,
        debugToken: dbg,
        phoneInfo,
        wabaId,
        phoneNumbersForWaba: phoneNumbers,
        graphVersion: GRAPH_VERSION,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : "erro desconhecido";
    console.error("whatsapp-diagnose error", msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
