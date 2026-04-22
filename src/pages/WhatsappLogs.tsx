import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { LogOut, RefreshCw, ChevronDown, ChevronRight, ArrowLeft } from "lucide-react";
import { toast } from "@/hooks/use-toast";

type LogRow = {
  id: string;
  created_at: string;
  template: string;
  to_phone: string;
  status_code: number | null;
  ok: boolean;
  message_id: string | null;
  request_payload: unknown;
  response_payload: unknown;
  error_message: string | null;
};

type WebhookRow = {
  id: string;
  created_at: string;
  event_type: string | null;
  message_id: string | null;
  from_phone: string | null;
  status: string | null;
  payload: unknown;
};

const fmt = (iso: string) =>
  new Date(iso).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "medium" });

function JsonBlock({ data }: { data: unknown }) {
  return (
    <pre className="mt-2 max-h-96 overflow-auto rounded bg-muted p-3 text-xs whitespace-pre-wrap break-all">
      {JSON.stringify(data, null, 2)}
    </pre>
  );
}

export default function WhatsappLogs() {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) navigate("/auth");
  }, [loading, user, navigate]);

  if (loading) return <div className="min-h-screen grid place-items-center">Carregando...</div>;
  if (!user) return null;
  if (!isAdmin) {
    return (
      <div className="min-h-screen grid place-items-center p-6 text-center">
        <div>
          <h1 className="text-xl font-bold mb-2">Acesso restrito</h1>
          <p className="text-muted-foreground mb-4">Sua conta não tem permissão de administrador.</p>
          <Button variant="outline" onClick={async () => { await supabase.auth.signOut(); navigate("/auth"); }}>Sair</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container flex items-center justify-between py-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate("/admin")} className="gap-1.5">
              <ArrowLeft className="h-4 w-4" /> Admin
            </Button>
            <h1 className="font-display text-xl font-bold">Logs do WhatsApp</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">{user.email}</span>
            <Button variant="outline" size="sm" onClick={async () => { await supabase.auth.signOut(); navigate("/"); }} className="gap-1.5">
              <LogOut className="h-4 w-4" /> Sair
            </Button>
          </div>
        </div>
      </header>

      <main className="container py-8">
        <Tabs defaultValue="outbound">
          <TabsList>
            <TabsTrigger value="outbound">Envios (loja → Meta)</TabsTrigger>
            <TabsTrigger value="inbound">Webhooks (Meta → loja)</TabsTrigger>
          </TabsList>
          <TabsContent value="outbound" className="mt-4">
            <OutboundLogs />
          </TabsContent>
          <TabsContent value="inbound" className="mt-4">
            <InboundLogs />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

function OutboundLogs() {
  const [rows, setRows] = useState<LogRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("whatsapp_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);
    setLoading(false);
    if (error) { toast({ title: "Erro", description: error.message, variant: "destructive" }); return; }
    setRows((data as LogRow[]) ?? []);
  };
  useEffect(() => { load(); }, []);

  return (
    <div>
      <div className="mb-4 flex items-center gap-3">
        <Button variant="outline" size="sm" onClick={load} disabled={loading} className="gap-1.5">
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Atualizar
        </Button>
        <span className="text-sm text-muted-foreground">{rows.length} registros (últimos 200)</span>
      </div>

      <div className="rounded-lg border border-border bg-card overflow-hidden">
        {rows.length === 0 && !loading && (
          <div className="p-8 text-center text-sm text-muted-foreground">Nenhum envio registrado ainda.</div>
        )}
        {rows.map((r) => {
          const isOpen = expanded === r.id;
          return (
            <div key={r.id} className="border-t border-border first:border-t-0">
              <button
                onClick={() => setExpanded(isOpen ? null : r.id)}
                className="w-full flex items-center gap-3 px-3 py-2 text-left text-sm hover:bg-muted/30"
              >
                {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                <span className="font-mono text-xs text-muted-foreground w-36">{fmt(r.created_at)}</span>
                <Badge variant={r.ok ? "default" : "destructive"}>{r.status_code ?? "—"}</Badge>
                <span className="font-medium">{r.template}</span>
                <span className="text-muted-foreground">→ {r.to_phone}</span>
                {r.error_message && <span className="ml-auto text-xs text-destructive truncate max-w-md">{r.error_message}</span>}
              </button>
              {isOpen && (
                <div className="px-3 pb-3 bg-muted/20">
                  <div className="grid md:grid-cols-2 gap-3">
                    <div>
                      <div className="text-xs font-semibold text-muted-foreground">Request</div>
                      <JsonBlock data={r.request_payload} />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-muted-foreground">Response</div>
                      <JsonBlock data={r.response_payload} />
                    </div>
                  </div>
                  {r.message_id && <div className="mt-2 text-xs">Message ID: <code>{r.message_id}</code></div>}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function InboundLogs() {
  const [rows, setRows] = useState<WebhookRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("whatsapp_webhooks")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);
    setLoading(false);
    if (error) { toast({ title: "Erro", description: error.message, variant: "destructive" }); return; }
    setRows((data as WebhookRow[]) ?? []);
  };
  useEffect(() => { load(); }, []);

  const webhookUrl = `https://${import.meta.env.VITE_SUPABASE_PROJECT_ID}.supabase.co/functions/v1/whatsapp-webhook`;

  return (
    <div>
      <div className="mb-4 rounded-lg border border-border bg-muted/30 p-3 text-sm">
        <div className="font-semibold mb-1">Configuração no painel da Meta</div>
        <div className="space-y-1 text-muted-foreground">
          <div>Callback URL: <code className="text-foreground break-all">{webhookUrl}</code></div>
          <div>Verify token: <code className="text-foreground">lovable-whatsapp-verify</code> (ou o valor de <code>WHATSAPP_VERIFY_TOKEN</code> nos secrets)</div>
        </div>
      </div>

      <div className="mb-4 flex items-center gap-3">
        <Button variant="outline" size="sm" onClick={load} disabled={loading} className="gap-1.5">
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Atualizar
        </Button>
        <span className="text-sm text-muted-foreground">{rows.length} registros (últimos 200)</span>
      </div>

      <div className="rounded-lg border border-border bg-card overflow-hidden">
        {rows.length === 0 && !loading && (
          <div className="p-8 text-center text-sm text-muted-foreground">
            Nenhum webhook recebido. Configure a Callback URL acima no painel da Meta.
          </div>
        )}
        {rows.map((r) => {
          const isOpen = expanded === r.id;
          return (
            <div key={r.id} className="border-t border-border first:border-t-0">
              <button
                onClick={() => setExpanded(isOpen ? null : r.id)}
                className="w-full flex items-center gap-3 px-3 py-2 text-left text-sm hover:bg-muted/30"
              >
                {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                <span className="font-mono text-xs text-muted-foreground w-36">{fmt(r.created_at)}</span>
                <Badge variant="secondary">{r.event_type ?? "—"}</Badge>
                {r.status && <Badge variant={r.status === "failed" ? "destructive" : "outline"}>{r.status}</Badge>}
                {r.from_phone && <span className="text-muted-foreground">{r.from_phone}</span>}
                {r.message_id && <span className="ml-auto font-mono text-xs text-muted-foreground truncate max-w-xs">{r.message_id}</span>}
              </button>
              {isOpen && (
                <div className="px-3 pb-3 bg-muted/20">
                  <JsonBlock data={r.payload} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
