import { useEffect, useState, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle2, Loader2, RefreshCw, MessageCircle, Home, Package, Clock } from "lucide-react";
import { SEO } from "@/components/SEO";
import { pushEvent } from "@/lib/gtm";

const WHATSAPP_NUMBER = "5551993199486";

type WCOrder = {
  id: number;
  number: string;
  status: string;
  total: string;
  currency: string;
  payment_method_title: string;
  date_created: string;
  billing: {
    first_name: string;
    last_name: string;
    address_1: string;
    address_2: string;
    phone: string;
  };
  line_items: { name: string; quantity: number; total: string }[];
  customer_note?: string;
};

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  pending: { label: "Aguardando confirmação", color: "bg-yellow-500/15 text-yellow-700 dark:text-yellow-400" },
  processing: { label: "Em preparação", color: "bg-blue-500/15 text-blue-700 dark:text-blue-400" },
  "on-hold": { label: "Em análise", color: "bg-orange-500/15 text-orange-700 dark:text-orange-400" },
  completed: { label: "Concluído", color: "bg-success/15 text-success" },
  cancelled: { label: "Cancelado", color: "bg-destructive/15 text-destructive" },
  refunded: { label: "Reembolsado", color: "bg-muted text-muted-foreground" },
  failed: { label: "Falhou", color: "bg-destructive/15 text-destructive" },
};

export default function PedidoConfirmado() {
  const [params] = useSearchParams();
  const id = params.get("id");
  const [order, setOrder] = useState<WCOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrder = useCallback(async () => {
    if (!id) {
      setError("Pedido não informado.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.functions.invoke("wc-get-order", {
        body: { id },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setOrder(data as WCOrder);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Falha ao buscar pedido.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  // Dispara evento de conversão "purchase" uma única vez quando o pedido carrega
  const purchaseFired = useRef(false);
  useEffect(() => {
    if (!order || purchaseFired.current) return;
    purchaseFired.current = true;
    pushEvent("purchase", {
      transaction_id: order.number,
      value: Number(order.total) || 0,
      currency: order.currency || "BRL",
      items: order.line_items.map((li) => ({
        item_name: li.name,
        quantity: li.quantity,
        price: Number(li.total) || 0,
      })),
    });
  }, [order]);

  // Polling a cada 30s para refletir mudança de status
  useEffect(() => {
    if (!id) return;
    const t = setInterval(fetchOrder, 30000);
    return () => clearInterval(t);
  }, [id, fetchOrder]);

  const statusInfo = order ? STATUS_LABEL[order.status] ?? { label: order.status, color: "bg-muted text-muted-foreground" } : null;
  const whatsappUrl = order
    ? `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(`Olá! Gostaria de acompanhar meu pedido #${order.number}.`)}`
    : `https://wa.me/${WHATSAPP_NUMBER}`;

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Pedido confirmado | AWR Baterias"
        description="Acompanhe o status do seu pedido."
      />
      <div className="mx-auto max-w-2xl px-4 py-10 sm:py-16">
        {loading && !order ? (
          <div className="flex flex-col items-center justify-center gap-3 py-20 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p className="text-sm">Carregando seu pedido...</p>
          </div>
        ) : error ? (
          <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-center">
            <p className="font-semibold text-destructive">Não foi possível carregar o pedido</p>
            <p className="mt-2 text-sm text-muted-foreground">{error}</p>
            <div className="mt-4 flex justify-center gap-2">
              <Button onClick={fetchOrder} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4" /> Tentar novamente
              </Button>
              <Button asChild size="sm">
                <Link to="/">
                  <Home className="h-4 w-4" /> Voltar
                </Link>
              </Button>
            </div>
          </div>
        ) : order ? (
          <>
            {/* Header agradecimento */}
            <div className="rounded-2xl border border-success/30 bg-success/5 p-6 text-center sm:p-8">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success/15">
                <CheckCircle2 className="h-9 w-9 text-success" />
              </div>
              <h1 className="mt-4 font-display text-2xl font-bold sm:text-3xl">
                Obrigado pelo seu pedido!
              </h1>
              <p className="mt-2 text-sm text-muted-foreground sm:text-base">
                Recebemos seu pedido <strong className="text-foreground">#{order.number}</strong> e nossa equipe já está cuidando de tudo.
              </p>
              {statusInfo && (
                <div className={`mt-4 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${statusInfo.color}`}>
                  <Clock className="h-3 w-3" />
                  {statusInfo.label}
                </div>
              )}
            </div>

            {/* Detalhes */}
            <div className="mt-6 rounded-xl border border-border bg-card p-5 sm:p-6">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-base font-bold flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Itens do pedido
                </h2>
                <button
                  onClick={fetchOrder}
                  disabled={loading}
                  className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                >
                  <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} />
                  Atualizar
                </button>
              </div>
              <ul className="mt-3 divide-y divide-border">
                {order.line_items.map((li, i) => (
                  <li key={i} className="flex items-center justify-between py-2.5 text-sm">
                    <span>
                      <strong>{li.quantity}x</strong> {li.name}
                    </span>
                    <span className="font-semibold">
                      {Number(li.total).toLocaleString("pt-BR", {
                        style: "currency",
                        currency: order.currency || "BRL",
                      })}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
                <span className="font-semibold">Total</span>
                <span className="font-display text-lg font-bold text-primary">
                  {Number(order.total).toLocaleString("pt-BR", {
                    style: "currency",
                    currency: order.currency || "BRL",
                  })}
                </span>
              </div>
              <div className="mt-3 grid gap-1 text-xs text-muted-foreground">
                <div>
                  <span className="font-semibold text-foreground">Pagamento:</span>{" "}
                  {order.payment_method_title}
                </div>
                {(order.billing?.address_1 || order.billing?.address_2) && (
                  <div>
                    <span className="font-semibold text-foreground">Entrega:</span>{" "}
                    {order.billing.address_1}
                    {order.billing.address_2 ? `, ${order.billing.address_2}` : ""}
                  </div>
                )}
                {order.billing?.phone && (
                  <div>
                    <span className="font-semibold text-foreground">Telefone:</span>{" "}
                    {order.billing.phone}
                  </div>
                )}
              </div>
            </div>

            {/* Próximos passos */}
            <div className="mt-6 rounded-xl border border-primary/20 bg-primary/5 p-5">
              <h3 className="font-display text-sm font-bold">O que acontece agora?</h3>
              <ol className="mt-3 space-y-2 text-sm text-muted-foreground">
                <li>1. Nossa equipe confirma os dados do seu pedido.</li>
                <li>2. Você recebe contato pelo WhatsApp para combinar a entrega.</li>
                <li>3. A bateria chega no endereço com instalação grátis inclusa.</li>
              </ol>
            </div>

            {/* Ações */}
            <div className="mt-6 flex flex-col gap-2 sm:flex-row">
              <Button
                asChild
                className="h-11 flex-1 bg-[#25D366] text-white hover:bg-[#20bd5a]"
              >
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="h-4 w-4" />
                  Falar no WhatsApp
                </a>
              </Button>
              <Button asChild variant="outline" className="h-11 flex-1">
                <Link to="/">
                  <Home className="h-4 w-4" />
                  Voltar à loja
                </Link>
              </Button>
            </div>

            <p className="mt-6 text-center text-xs text-muted-foreground">
              Esta página atualiza automaticamente o status do pedido a cada 30 segundos.
            </p>
          </>
        ) : null}
      </div>
    </div>
  );
}
