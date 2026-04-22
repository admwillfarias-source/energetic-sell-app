import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { ArrowLeft, RefreshCw, MessageSquare } from "lucide-react";
import { toast } from "@/hooks/use-toast";

type DiagnoseResult = {
  phoneNumberIdSecret?: { value: string | null; looksValid: boolean; shape: string };
  token?: {
    masked: string;
    length: number;
    appId: string | null;
    type: string | null;
    scopes: string[];
    expiresAt: number | null;
    expiresAtIso: string | null;
  };
  me?: { ok: boolean; status: number; data?: unknown };
  debugToken?: { ok: boolean; status: number; data?: unknown };
  phoneInfo?: { ok: boolean; status: number; data?: unknown } | null;
  wabaId?: string | null;
  phoneNumbersForWaba?: { ok: boolean; status: number; data?: unknown } | null;
  templates?: { ok: boolean; status: number; data?: unknown } | null;
  expectedTemplates?: string[];
  graphVersion?: string;
  error?: string;
};

export default function WhatsappDiagnose() {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<DiagnoseResult | null>(null);

  useEffect(() => {
    if (!loading && !user) navigate("/auth");
  }, [loading, user, navigate]);

  const run = async () => {
    setRunning(true);
    try {
      const { data, error } = await supabase.functions.invoke<DiagnoseResult>(
        "whatsapp-diagnose",
        { body: {} },
      );
      if (error) throw error;
      setResult(data ?? null);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "erro desconhecido";
      toast({ title: "Erro", description: msg, variant: "destructive" });
    } finally {
      setRunning(false);
    }
  };

  useEffect(() => {
    if (!loading && isAdmin) run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, isAdmin]);

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center">Carregando...</div>
    );
  }
  if (!user) return null;
  if (!isAdmin) {
    return (
      <div className="min-h-screen grid place-items-center p-6 text-center">
        <div>
          <h1 className="text-xl font-bold mb-2">Acesso restrito</h1>
          <Button variant="outline" onClick={() => navigate("/auth")}>
            Sair
          </Button>
        </div>
      </div>
    );
  }

  const phones =
    (result?.phoneNumbersForWaba?.data as { data?: Array<Record<string, unknown>> })
      ?.data ?? [];

  const phoneInfoData = result?.phoneInfo?.data as
    | { display_phone_number?: string; verified_name?: string; error?: { message?: string } }
    | undefined;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container flex items-center justify-between py-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/admin")}
              className="gap-1.5"
            >
              <ArrowLeft className="h-4 w-4" /> Admin
            </Button>
            <h1 className="font-display text-xl font-bold">
              Diagnóstico WhatsApp
            </h1>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/admin/whatsapp-test")}
              className="gap-1.5"
            >
              <MessageSquare className="h-4 w-4" /> Teste
            </Button>
            <Button
              size="sm"
              onClick={run}
              disabled={running}
              className="gap-1.5"
            >
              <RefreshCw className={`h-4 w-4 ${running ? "animate-spin" : ""}`} />
              {running ? "Atualizando..." : "Atualizar"}
            </Button>
          </div>
        </div>
      </header>

      <main className="container py-8 max-w-4xl space-y-6">
        <div className="rounded-lg border border-border bg-muted/30 p-3 text-sm">
          Esta página consulta a Meta Graph API com o token salvo e mostra a
          quem pertence, qual app, quais Phone Number IDs estão disponíveis na
          WABA, e o status do <code>WHATSAPP_PHONE_NUMBER_ID</code> atual.
          Compare o "Display phone number" com o número que aparece no bloco
          <strong> "From" </strong>do Meta API Setup.
        </div>

        {!result && (
          <div className="text-sm text-muted-foreground">Executando...</div>
        )}

        {result && (
          <>
            {/* Secret atual */}
            <section className="rounded-lg border border-border bg-card p-4">
              <h2 className="font-semibold mb-3">Secret atual</h2>
              <dl className="grid grid-cols-[160px_1fr] gap-y-2 text-sm">
                <dt className="text-muted-foreground">PHONE_NUMBER_ID</dt>
                <dd className="font-mono break-all">
                  {result.phoneNumberIdSecret?.value ?? (
                    <span className="text-destructive">não configurado</span>
                  )}
                </dd>
                <dt className="text-muted-foreground">Formato</dt>
                <dd>
                  {result.phoneNumberIdSecret?.shape}{" "}
                  {result.phoneNumberIdSecret?.looksValid ? (
                    <span className="text-green-600">✓ formato OK</span>
                  ) : (
                    <span className="text-destructive">
                      ✗ deve ser 10–20 dígitos numéricos
                    </span>
                  )}
                </dd>
                <dt className="text-muted-foreground">Graph API</dt>
                <dd className="font-mono">{result.graphVersion}</dd>
              </dl>
            </section>

            {/* Token */}
            <section className="rounded-lg border border-border bg-card p-4">
              <h2 className="font-semibold mb-3">Access Token</h2>
              <dl className="grid grid-cols-[160px_1fr] gap-y-2 text-sm">
                <dt className="text-muted-foreground">Token</dt>
                <dd className="font-mono">{result.token?.masked}</dd>
                <dt className="text-muted-foreground">App ID</dt>
                <dd className="font-mono">
                  {result.token?.appId ?? (
                    <span className="text-muted-foreground">desconhecido</span>
                  )}
                </dd>
                <dt className="text-muted-foreground">Tipo</dt>
                <dd>{result.token?.type ?? "—"}</dd>
                <dt className="text-muted-foreground">Expira em</dt>
                <dd>
                  {result.token?.expiresAt === 0
                    ? "Nunca (permanente) ✓"
                    : result.token?.expiresAtIso ?? "—"}
                </dd>
                <dt className="text-muted-foreground">Scopes</dt>
                <dd className="font-mono text-xs break-all">
                  {result.token?.scopes?.join(", ") || "—"}
                </dd>
                <dt className="text-muted-foreground">Pertence a</dt>
                <dd>
                  {result.me?.ok
                    ? JSON.stringify(result.me.data)
                    : `Erro ${result.me?.status}: ${JSON.stringify(result.me?.data)}`}
                </dd>
              </dl>
            </section>

            {/* Phone Number atual */}
            <section className="rounded-lg border border-border bg-card p-4">
              <h2 className="font-semibold mb-3">
                Consulta direta ao PHONE_NUMBER_ID
              </h2>
              {result.phoneInfo?.ok ? (
                <dl className="grid grid-cols-[160px_1fr] gap-y-2 text-sm">
                  <dt className="text-muted-foreground">Display</dt>
                  <dd className="font-mono">{phoneInfoData?.display_phone_number}</dd>
                  <dt className="text-muted-foreground">Verified name</dt>
                  <dd>{phoneInfoData?.verified_name}</dd>
                  <dt className="text-muted-foreground">Resposta completa</dt>
                  <dd>
                    <pre className="rounded bg-muted p-2 text-xs overflow-auto whitespace-pre-wrap break-all max-h-40">
                      {JSON.stringify(result.phoneInfo.data, null, 2)}
                    </pre>
                  </dd>
                </dl>
              ) : (
                <div className="text-sm">
                  <div className="text-destructive mb-2">
                    ✗ Erro {result.phoneInfo?.status}: este ID não responde
                    como um Phone Number válido para o token em uso.
                  </div>
                  <pre className="rounded bg-muted p-2 text-xs overflow-auto whitespace-pre-wrap break-all max-h-60">
                    {JSON.stringify(result.phoneInfo?.data, null, 2)}
                  </pre>
                </div>
              )}
            </section>

            {/* WABA + lista de phones */}
            <section className="rounded-lg border border-border bg-card p-4">
              <h2 className="font-semibold mb-3">
                Phone Numbers na WABA{" "}
                {result.wabaId && (
                  <span className="font-mono text-sm text-muted-foreground">
                    ({result.wabaId})
                  </span>
                )}
              </h2>
              {phones.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="text-left text-muted-foreground">
                      <tr>
                        <th className="py-2 pr-3">Phone Number ID</th>
                        <th className="py-2 pr-3">Display</th>
                        <th className="py-2 pr-3">Verified name</th>
                        <th className="py-2">Quality</th>
                      </tr>
                    </thead>
                    <tbody>
                      {phones.map((p, i) => {
                        const isCurrent =
                          (p.id as string) === result.phoneNumberIdSecret?.value;
                        return (
                          <tr
                            key={i}
                            className={`border-t border-border ${
                              isCurrent ? "bg-primary/5" : ""
                            }`}
                          >
                            <td className="py-2 pr-3 font-mono">
                              {String(p.id)}
                              {isCurrent && (
                                <span className="ml-2 text-xs text-primary">
                                  ← atual
                                </span>
                              )}
                            </td>
                            <td className="py-2 pr-3 font-mono">
                              {String(p.display_phone_number ?? "—")}
                            </td>
                            <td className="py-2 pr-3">
                              {String(p.verified_name ?? "—")}
                            </td>
                            <td className="py-2">
                              {String(p.quality_rating ?? "—")}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">
                  {result.wabaId
                    ? "Nenhum phone number retornado para esta WABA."
                    : "Não foi possível descobrir a WABA a partir do PHONE_NUMBER_ID atual (provavelmente porque ele é inválido). Confirme o ID no Meta API Setup."}
                </div>
              )}
              {result.phoneNumbersForWaba && !result.phoneNumbersForWaba.ok && (
                <pre className="mt-3 rounded bg-muted p-2 text-xs overflow-auto whitespace-pre-wrap break-all max-h-40">
                  {JSON.stringify(result.phoneNumbersForWaba.data, null, 2)}
                </pre>
              )}
            </section>

            {/* Templates aprovados */}
            <section className="rounded-lg border border-border bg-card p-4">
              <h2 className="font-semibold mb-3">Templates de mensagem</h2>
              {(() => {
                const tplData = result.templates?.data as
                  | { data?: Array<{ name: string; language: string; status: string; category?: string; rejected_reason?: string }> }
                  | undefined;
                const list = tplData?.data ?? [];
                const expected = result.expectedTemplates ?? [];

                if (!result.templates) {
                  return (
                    <div className="text-sm text-muted-foreground">
                      WABA não identificada — não foi possível listar templates.
                    </div>
                  );
                }
                if (!result.templates.ok) {
                  return (
                    <pre className="rounded bg-muted p-2 text-xs overflow-auto whitespace-pre-wrap break-all max-h-40">
                      {JSON.stringify(result.templates.data, null, 2)}
                    </pre>
                  );
                }

                return (
                  <>
                    <div className="mb-3 space-y-1 text-sm">
                      {expected.map((name) => {
                        const matches = list.filter(
                          (t) => t.name === name && t.language === "pt_BR",
                        );
                        const approved = matches.find((t) => t.status === "APPROVED");
                        const pending = matches.find((t) => t.status === "PENDING");
                        const rejected = matches.find((t) => t.status === "REJECTED");
                        return (
                          <div key={name} className="flex items-center gap-2">
                            <span className="font-mono">{name}</span>
                            <span>·</span>
                            {approved ? (
                              <span className="text-green-600">✓ APPROVED (pt_BR)</span>
                            ) : pending ? (
                              <span className="text-yellow-600">⏳ PENDING (pt_BR)</span>
                            ) : rejected ? (
                              <span className="text-destructive">
                                ✗ REJECTED — {rejected.rejected_reason ?? "sem motivo"}
                              </span>
                            ) : matches.length > 0 ? (
                              <span className="text-muted-foreground">
                                {matches[0].status}
                              </span>
                            ) : (
                              <span className="text-destructive">
                                ✗ ausente em pt_BR
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="text-left text-muted-foreground">
                          <tr>
                            <th className="py-2 pr-3">Nome</th>
                            <th className="py-2 pr-3">Idioma</th>
                            <th className="py-2 pr-3">Status</th>
                            <th className="py-2">Categoria</th>
                          </tr>
                        </thead>
                        <tbody>
                          {list.map((t, i) => {
                            const isExpected = expected.includes(t.name);
                            return (
                              <tr
                                key={i}
                                className={`border-t border-border ${
                                  isExpected ? "bg-primary/5" : ""
                                }`}
                              >
                                <td className="py-2 pr-3 font-mono">{t.name}</td>
                                <td className="py-2 pr-3 font-mono">{t.language}</td>
                                <td className="py-2 pr-3">{t.status}</td>
                                <td className="py-2">{t.category ?? "—"}</td>
                              </tr>
                            );
                          })}
                          {list.length === 0 && (
                            <tr>
                              <td colSpan={4} className="py-3 text-muted-foreground">
                                Nenhum template encontrado.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </>
                );
              })()}
            </section>

            {/* Raw */}
            <details className="rounded-lg border border-border bg-card p-4">
              <summary className="cursor-pointer text-sm font-semibold">
                Resposta bruta
              </summary>
              <pre className="mt-3 rounded bg-muted p-3 text-xs overflow-auto whitespace-pre-wrap break-all max-h-96">
                {JSON.stringify(result, null, 2)}
              </pre>
            </details>
          </>
        )}
      </main>
    </div>
  );
}
