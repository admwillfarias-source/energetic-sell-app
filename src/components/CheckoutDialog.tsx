import { useEffect, useMemo, useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useCart, formatBRL } from "@/context/CartContext";
import { toast } from "@/hooks/use-toast";
import { MessageCircle, ShoppingCart, Loader2, Zap, CalendarClock, Car } from "lucide-react";
import { z } from "zod";
import { useIsMobile } from "@/hooks/use-mobile";
import { supabase } from "@/integrations/supabase/client";
import { searchVehicles, type VehicleSuggestion } from "@/lib/fitments";
import { ensureCatalogLoaded } from "@/lib/catalogStore";
import { cn } from "@/lib/utils";

// Número da loja (formato internacional, só dígitos). Edite aqui.
const WHATSAPP_NUMBER = "5551993199486";

// Janela de entrega rápida (horário local — America/Sao_Paulo do navegador do cliente)
const RAPIDA_INICIO_MIN = 8 * 60 + 30; // 08:30
const RAPIDA_FIM_MIN = 18 * 60; // 18:00

const baseSchema = {
  nome: z.string().trim().min(2, "Informe seu nome").max(100),
  documento: z.string().trim().min(11, "CPF/CNPJ inválido").max(20),
  endereco: z.string().trim().min(5, "Informe o endereço").max(200),
  numero: z.string().trim().min(1, "Informe o número").max(20),
  cep: z.string().trim().max(10).optional().or(z.literal("")),
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

function rapidaDisponivelAgora(): boolean {
  const d = new Date();
  const min = d.getHours() * 60 + d.getMinutes();
  return min >= RAPIDA_INICIO_MIN && min <= RAPIDA_FIM_MIN;
}

function maskCep(value: string): string {
  const d = value.replace(/\D/g, "").slice(0, 8);
  if (d.length <= 5) return d;
  return `${d.slice(0, 5)}-${d.slice(5)}`;
}

export function CheckoutDialog({ open, onOpenChange }: Props) {
  const { items, subtotal, clear, setOpen: setCartOpen } = useCart();
  const isMobile = useIsMobile();
  const [submittingWC, setSubmittingWC] = useState(false);
  const [cepLoading, setCepLoading] = useState(false);
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

  // Autocomplete carro/ano
  const [carroOpen, setCarroOpen] = useState(false);
  const [carroHighlight, setCarroHighlight] = useState(0);
  const [catalogReady, setCatalogReady] = useState(false);
  const carroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    ensureCatalogLoaded().then(() => setCatalogReady(true)).catch(() => setCatalogReady(true));
  }, []);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (carroRef.current && !carroRef.current.contains(e.target as Node)) {
        setCarroOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const carroSuggestions = useMemo<VehicleSuggestion[]>(() => {
    if (!catalogReady || form.carroAno.trim().length < 2) return [];
    return searchVehicles(form.carroAno, 8);
  }, [form.carroAno, catalogReady]);

  useEffect(() => setCarroHighlight(0), [carroSuggestions.length]);

  const update = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((p) => ({ ...p, [k]: e.target.value }));

  const today = new Date().toISOString().split("T")[0];

  // ViaCEP — busca endereço quando CEP completo
  const handleCepChange = async (raw: string) => {
    const masked = maskCep(raw);
    setForm((p) => ({ ...p, cep: masked }));
    const digits = masked.replace(/\D/g, "");
    if (digits.length !== 8) return;
    setCepLoading(true);
    try {
      const r = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
      const data = await r.json();
      if (data?.erro) {
        toast({ title: "CEP não encontrado", description: "Confira o número ou preencha manualmente." });
        return;
      }
      const linha = [data.logradouro, data.bairro, data.localidade && `${data.localidade}/${data.uf}`]
        .filter(Boolean)
        .join(", ");
      if (linha) {
        setForm((p) => ({ ...p, endereco: linha }));
        toast({ title: "Endereço preenchido", description: linha });
      }
    } catch {
      toast({ title: "Falha ao buscar CEP", description: "Preencha o endereço manualmente." });
    } finally {
      setCepLoading(false);
    }
  };

  const escolherCarro = (s: VehicleSuggestion) => {
    setForm((p) => ({ ...p, carroAno: s.label }));
    setCarroOpen(false);
  };

  const onCarroKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!carroOpen || carroSuggestions.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setCarroHighlight((h) => Math.min(h + 1, carroSuggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setCarroHighlight((h) => Math.max(h - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      escolherCarro(carroSuggestions[carroHighlight]);
    } else if (e.key === "Escape") {
      setCarroOpen(false);
    }
  };

  const entregaResumo = () =>
    form.entregaTipo === "rapida"
      ? "Entrega rápida (até 35 min — 8h30 às 18h)"
      : `Agendada para ${form.entregaData} às ${form.entregaHora}`;

  const validar = (): { ok: true; data: z.infer<typeof schema> } | { ok: false; msg: string } => {
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      const first = Object.values(parsed.error.flatten().fieldErrors)[0]?.[0];
      return { ok: false, msg: first ?? "Verifique o formulário." };
    }
    if (form.entregaTipo === "rapida" && !rapidaDisponivelAgora()) {
      return {
        ok: false,
        msg: "Entrega rápida disponível das 8h30 às 18h. Selecione 'Agendar entrega' para outro horário.",
      };
    }
    return { ok: true, data: parsed.data };
  };

  const handleWooCommerce = async () => {
    if (items.length === 0) {
      toast({ title: "Carrinho vazio", description: "Adicione uma bateria antes de continuar." });
      return;
    }
    const v = validar();
    if (!v.ok) {
      toast({ title: "Dados incompletos", description: v.msg });
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
          cep: form.cep || "",
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
    const v = validar();
    if (!v.ok) {
      toast({ title: "Dados incompletos", description: v.msg });
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
      (form.cep ? `CEP: ${form.cep}\n` : "") +
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
  const rapidaAgora = rapidaDisponivelAgora();

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
            <Label htmlFor="cep">
              CEP <span className="text-xs font-normal text-muted-foreground">(opcional — preenche o endereço)</span>
            </Label>
            <div className="relative">
              <Input
                id="cep"
                value={form.cep}
                onChange={(e) => handleCepChange(e.target.value)}
                placeholder="00000-000"
                inputMode="numeric"
              />
              {cepLoading && (
                <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="endereco">Endereço de entrega</Label>
            <Input id="endereco" value={form.endereco} onChange={update("endereco")} placeholder="Rua, bairro, cidade" />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="numero">Número (Casa/Apto)</Label>
            <Input id="numero" value={form.numero} onChange={update("numero")} placeholder="123 / Apto 45" />
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
                  <p className="text-xs text-muted-foreground">
                    Em até 35 min · 8h30 às 18h
                  </p>
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

            {form.entregaTipo === "rapida" && !rapidaAgora && (
              <p className="text-xs text-destructive">
                Fora do horário de entrega rápida (8h30 às 18h). Selecione "Agendar entrega".
              </p>
            )}

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

          <div className="space-y-1.5" ref={carroRef}>
            <Label htmlFor="carroAno">Carro e ano</Label>
            <div className="relative">
              <Input
                id="carroAno"
                value={form.carroAno}
                onChange={(e) => {
                  setForm((p) => ({ ...p, carroAno: e.target.value }));
                  setCarroOpen(true);
                }}
                onFocus={() => setCarroOpen(true)}
                onKeyDown={onCarroKeyDown}
                placeholder="Ex: Fiat Uno 2015, Onix 2018..."
                autoComplete="off"
              />
              {carroOpen && carroSuggestions.length > 0 && (
                <ul
                  role="listbox"
                  className="absolute z-50 mt-1 max-h-64 w-full overflow-auto rounded-lg border border-border bg-popover text-popover-foreground shadow-lg"
                >
                  {carroSuggestions.map((s, i) => (
                    <li
                      key={`${s.brand}-${s.model}-${s.year}-${i}`}
                      role="option"
                      aria-selected={i === carroHighlight}
                      onMouseEnter={() => setCarroHighlight(i)}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        escolherCarro(s);
                      }}
                      className={cn(
                        "flex cursor-pointer items-center gap-3 px-3 py-2 text-sm",
                        i === carroHighlight ? "bg-accent/15" : "hover:bg-muted",
                      )}
                    >
                      <Car className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <div className="flex-1">
                        <div className="font-medium">{s.label}</div>
                        <div className="text-xs text-muted-foreground">
                          {s.codes.length} código{s.codes.length > 1 ? "s" : ""} compatível
                          {s.codes.length > 1 ? "is" : ""}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
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
