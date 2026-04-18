import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useCart, formatBRL } from "@/context/CartContext";
import { toast } from "@/hooks/use-toast";
import { MessageCircle, ShoppingCart, Loader2, Zap, CalendarClock } from "lucide-react";
import { z } from "zod";
import { useIsMobile } from "@/hooks/use-mobile";
import { supabase } from "@/integrations/supabase/client";

// Número da loja (formato internacional, só dígitos). Edite aqui.
const WHATSAPP_NUMBER = "5551993199486";

const baseSchema = {
  nome: z.string().trim().min(2, "Informe seu nome").max(100),
  documento: z.string().trim().min(11, "CPF/CNPJ inválido").max(20),
  endereco: z.string().trim().min(5, "Informe o endereço").max(200),
  numero: z.string().trim().min(1, "Informe o número").max(20),
  cep: z.string().trim().min(8, "CEP inválido").max(10),
  telefone: z.string().trim().min(10, "Telefone inválido").max(20),
  pagamento: z.string().trim().min(2, "Informe a forma de pagamento").max(60),
  carroAno: z.string().trim().min(2, "Informe carro e ano").max(100),
};

const schema = z.discriminatedUnion("entregaTipo", [
  z.object({ ...baseSchema, entregaTipo: z.literal("rapida") }),
  z.object({
    ...baseSchema,
    entregaTipo: z.literal("agendada"),
    entregaData: z.string().trim().min(1, "Selecione a data"),
    entregaHora: z.string().trim().min(1, "Selecione o horário"),
  }),
]);

type Props = {
  open: boolean;
  onOpenChange: (o: boolean) => void;
};

export function CheckoutDialog({ open, onOpenChange }: Props) {
  const { items, subtotal, clear, setOpen: setCartOpen } = useCart();
  const isMobile = useIsMobile();
  const [submittingWC, setSubmittingWC] = useState(false);
  const [form, setForm] = useState({
    nome: "",
    documento: "",
    endereco: "",
    numero: "",
    cep: "",
    telefone: "",
    pagamento: "",
    carroAno: "",
    entregaTipo: "rapida" as "rapida" | "agendada",
    entregaData: "",
    entregaHora: "",
  });

  const update = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((p) => ({ ...p, [k]: e.target.value }));

  const today = new Date().toISOString().split("T")[0];

  const entregaResumo = () =>
    form.entregaTipo === "rapida"
      ? "Entrega rápida (até 35 min)"
      : `Agendada para ${form.entregaData} às ${form.entregaHora}`;

  const handleWooCommerce = async () => {
    if (items.length === 0) {
      toast({ title: "Carrinho vazio", description: "Adicione uma bateria antes de continuar." });
      return;
    }
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      const first = Object.values(parsed.error.flatten().fieldErrors)[0]?.[0];
      toast({ title: "Dados incompletos", description: first ?? "Preencha o formulário antes de enviar." });
      return;
    }

    setSubmittingWC(true);
    try {
      const payload = {
        customer: {
          nome: form.nome,
          documento: form.documento,
          telefone: form.telefone,
          endereco: form.endereco,
          numero: form.numero,
          cep: form.cep,
          pagamento: form.pagamento,
          carroAno: form.carroAno,
          entrega: entregaResumo(),
        },
        items: items.map((i) => {
          const pid = Number(i.battery.id);
          return {
            product_id: Number.isFinite(pid) && pid > 0 ? pid : undefined,
            name: i.battery.name,
            quantity: i.quantity,
            price: i.battery.price,
          };
        }),
      };

      const { data, error } = await supabase.functions.invoke("wc-create-order", {
        body: payload,
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast({
        title: `Pedido #${data.number ?? data.id} criado!`,
        description: "Você será redirecionado para o pagamento.",
      });

      if (data?.payment_url) {
        window.open(data.payment_url, "_blank", "noopener,noreferrer");
      }

      clear();
      onOpenChange(false);
      setCartOpen(false);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Tente novamente em instantes.";
      toast({ title: "Erro ao criar pedido", description: msg });
    } finally {
      setSubmittingWC(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      toast({ title: "Carrinho vazio", description: "Adicione uma bateria antes de finalizar." });
      return;
    }
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      const first = Object.values(parsed.error.flatten().fieldErrors)[0]?.[0];
      toast({ title: "Dados incompletos", description: first ?? "Verifique o formulário." });
      return;
    }

    const bateriaLinhas = items
      .map((i) => `• ${i.quantity}x ${i.battery.name} (${i.battery.brand} ${i.battery.amperage}Ah) — ${formatBRL(i.battery.price * i.quantity)}`)
      .join("\n");

    const msg =
      `*Novo pedido — BateriaJá*\n\n` +
      `*Cliente*\n` +
      `Nome: ${form.nome}\n` +
      `CPF/CNPJ: ${form.documento}\n` +
      `Telefone: ${form.telefone}\n\n` +
      `*Entrega*\n` +
      `Endereço: ${form.endereco}\n` +
      `Número: ${form.numero}\n` +
      `CEP: ${form.cep}\n` +
      `Modalidade: ${entregaResumo()}\n\n` +
      `*Veículo*\n${form.carroAno}\n\n` +
      `*Bateria(s) solicitada(s)*\n${bateriaLinhas}\n\n` +
      `*Pagamento*\n${form.pagamento}\n\n` +
      `*Total: ${formatBRL(subtotal)}*`;

    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
    window.open(url, "_blank", "noopener,noreferrer");

    toast({ title: "Pedido enviado!", description: "Continue a conversa pelo WhatsApp." });
    clear();
    onOpenChange(false);
    setCartOpen(false);
  };

  const bateriaResumo = items.map((i) => `${i.quantity}x ${i.battery.name}`).join(", ") || "—";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">Finalizar pedido</DialogTitle>
          <DialogDescription>
            Preencha os dados e enviamos seu pedido direto para o WhatsApp da loja.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="nome">Nome completo</Label>
            <Input id="nome" value={form.nome} onChange={update("nome")} placeholder="João da Silva" />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="documento">CPF / CNPJ</Label>
              <Input id="documento" value={form.documento} onChange={update("documento")} placeholder="000.000.000-00" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="telefone">Telefone para contato</Label>
              <Input id="telefone" value={form.telefone} onChange={update("telefone")} placeholder="(11) 99999-9999" />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="endereco">Endereço de entrega</Label>
            <Input id="endereco" value={form.endereco} onChange={update("endereco")} placeholder="Rua, bairro, cidade" />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="numero">Número (Casa/Apto)</Label>
              <Input id="numero" value={form.numero} onChange={update("numero")} placeholder="123 / Apto 45" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cep">CEP</Label>
              <Input id="cep" value={form.cep} onChange={update("cep")} placeholder="00000-000" />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Modalidade de entrega</Label>
            <RadioGroup
              value={form.entregaTipo}
              onValueChange={(v) =>
                setForm((p) => ({ ...p, entregaTipo: v as "rapida" | "agendada" }))
              }
              className="grid gap-2 sm:grid-cols-2"
            >
              <label
                htmlFor="entrega-rapida"
                className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors ${
                  form.entregaTipo === "rapida"
                    ? "border-primary bg-primary/5"
                    : "border-border hover:bg-secondary/40"
                }`}
              >
                <RadioGroupItem id="entrega-rapida" value="rapida" className="mt-0.5" />
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5 font-medium">
                    <Zap className="h-4 w-4 text-primary" />
                    Entrega rápida
                  </div>
                  <p className="text-xs text-muted-foreground">Em até 35 min</p>
                </div>
              </label>
              <label
                htmlFor="entrega-agendada"
                className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors ${
                  form.entregaTipo === "agendada"
                    ? "border-primary bg-primary/5"
                    : "border-border hover:bg-secondary/40"
                }`}
              >
                <RadioGroupItem id="entrega-agendada" value="agendada" className="mt-0.5" />
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5 font-medium">
                    <CalendarClock className="h-4 w-4 text-primary" />
                    Agendar entrega
                  </div>
                  <p className="text-xs text-muted-foreground">Escolha data e horário</p>
                </div>
              </label>
            </RadioGroup>

            {form.entregaTipo === "agendada" && (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="entregaData">Data</Label>
                  <Input
                    id="entregaData"
                    type="date"
                    min={today}
                    value={form.entregaData}
                    onChange={update("entregaData")}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="entregaHora">Horário</Label>
                  <Input
                    id="entregaHora"
                    type="time"
                    value={form.entregaHora}
                    onChange={update("entregaHora")}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="pagamento">Forma de pagamento / bandeira</Label>
            <Input
              id="pagamento"
              value={form.pagamento}
              onChange={update("pagamento")}
              placeholder="Pix, dinheiro, cartão (Visa, Master...)"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="carroAno">Carro e ano</Label>
            <Input id="carroAno" value={form.carroAno} onChange={update("carroAno")} placeholder="Fiat Uno 2015" />
          </div>

          <div className="space-y-1.5">
            <Label>Bateria solicitada</Label>
            <Textarea readOnly value={bateriaResumo} className="resize-none bg-secondary/40" rows={2} />
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border bg-secondary/30 p-3">
            <span className="font-display font-bold">Total</span>
            <span className="font-display text-xl font-bold">{formatBRL(subtotal)}</span>
          </div>

          <div className="space-y-2">
            <Button
              type="submit"
              size="lg"
              className="w-full bg-[#25D366] text-white hover:bg-[#20bd5a]"
            >
              <MessageCircle className="h-4 w-4" />
              Enviar pedido pelo WhatsApp
            </Button>

            {!isMobile && (
              <>
                <div className="flex items-center gap-3 py-1">
                  <div className="h-px flex-1 bg-border" />
                  <span className="text-xs text-muted-foreground">ou</span>
                  <div className="h-px flex-1 bg-border" />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  className="w-full"
                  onClick={handleWooCommerce}
                  disabled={submittingWC}
                >
                  {submittingWC ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <ShoppingCart className="h-4 w-4" />
                  )}
                  {submittingWC ? "Criando pedido..." : "Finalizar na loja online"}
                </Button>
                <p className="text-center text-xs text-muted-foreground">
                  Cria o pedido em awrbaterias.com.br e abre a página de pagamento
                </p>
              </>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
