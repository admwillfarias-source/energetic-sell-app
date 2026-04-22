import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Send, MessageSquare } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function WhatsappTest() {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();

  const [nome, setNome] = useState("Cliente Teste");
  const [telefone, setTelefone] = useState("");
  const [carroAno, setCarroAno] = useState("Fiat Cronos 2020");
  const [bateria, setBateria] = useState("Heliar 60Ah");
  const [total, setTotal] = useState("450");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<unknown>(null);

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
          <Button variant="outline" onClick={async () => { await supabase.auth.signOut(); navigate("/auth"); }}>Sair</Button>
        </div>
      </div>
    );
  }

  const enviar = async () => {
    if (!telefone.trim() || !nome.trim()) {
      toast({ title: "Preencha nome e telefone", variant: "destructive" });
      return;
    }
    setSending(true);
    setResult(null);
    try {
      const { data, error } = await supabase.functions.invoke("send-whatsapp-order", {
        body: {
          customer: {
            nome: nome.trim(),
            telefone: telefone.trim(),
            carroAno: carroAno.trim() || "Não informado",
            entrega: "Teste — não entregar",
          },
          items: [{ name: bateria.trim() || "Bateria teste", quantity: 1, price: Number(total) || 0 }],
          total: Number(total) || 0,
        },
      });
      if (error) throw error;
      setResult(data);
      const ok = (data as { ok?: boolean })?.ok;
      toast({
        title: ok ? "Enviado" : "Falhou",
        description: ok ? "Veja o registro na aba Envios." : "Veja detalhes abaixo e na aba Envios.",
        variant: ok ? "default" : "destructive",
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "erro desconhecido";
      setResult({ error: msg });
      toast({ title: "Erro", description: msg, variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container flex items-center justify-between py-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate("/admin")} className="gap-1.5">
              <ArrowLeft className="h-4 w-4" /> Admin
            </Button>
            <h1 className="font-display text-xl font-bold">Teste rápido do WhatsApp</h1>
          </div>
          <Button variant="outline" size="sm" onClick={() => navigate("/admin/whatsapp-logs")} className="gap-1.5">
            <MessageSquare className="h-4 w-4" /> Ver logs
          </Button>
        </div>
      </header>

      <main className="container py-8 max-w-2xl">
        <div className="rounded-lg border border-border bg-muted/30 p-3 text-sm mb-6">
          Este teste dispara a edge function <code>send-whatsapp-order</code> exatamente como um pedido real:
          envia o template <code>novo_pedido_loja</code> para a loja e <code>confirmacao_pedido_cliente</code> para o telefone abaixo.
          O resultado aparece na aba <strong>Envios</strong> dos logs; callbacks de entrega aparecem em <strong>Webhooks</strong>.
        </div>

        <div className="space-y-3 rounded-lg border border-border bg-card p-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Nome do cliente</Label>
              <Input value={nome} onChange={(e) => setNome(e.target.value)} />
            </div>
            <div>
              <Label>Telefone (com DDD)</Label>
              <Input value={telefone} onChange={(e) => setTelefone(e.target.value)} placeholder="51999999999" />
            </div>
          </div>
          <div>
            <Label>Carro / ano</Label>
            <Input value={carroAno} onChange={(e) => setCarroAno(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Bateria</Label>
              <Input value={bateria} onChange={(e) => setBateria(e.target.value)} />
            </div>
            <div>
              <Label>Total (R$)</Label>
              <Input type="number" value={total} onChange={(e) => setTotal(e.target.value)} />
            </div>
          </div>
          <div className="pt-2">
            <Button onClick={enviar} disabled={sending} className="gap-1.5">
              <Send className="h-4 w-4" /> {sending ? "Enviando..." : "Enviar teste"}
            </Button>
          </div>
        </div>

        {result !== null && (
          <div className="mt-6">
            <div className="text-xs font-semibold text-muted-foreground mb-1">Resposta da edge function</div>
            <pre className="rounded bg-muted p-3 text-xs overflow-auto whitespace-pre-wrap break-all max-h-96">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </main>
    </div>
  );
}
