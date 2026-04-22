import { useEffect, useMemo, useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCart, formatBRL } from "@/context/CartContext";
import { toast } from "@/hooks/use-toast";
import {
  MessageCircle,
  ShoppingCart,
  Loader2,
  Zap,
  CalendarClock,
  Car,
  Store,
  Check,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  ShieldCheck,
} from "lucide-react";
import { z } from "zod";
import { useIsMobile } from "@/hooks/use-mobile";
import { supabase } from "@/integrations/supabase/client";
import { searchVehicles, type VehicleSuggestion } from "@/lib/fitments";
import { ensureCatalogLoaded } from "@/lib/catalogStore";
import { cn } from "@/lib/utils";

// Número da loja (formato internacional, só dígitos). Edite aqui.
const WHATSAPP_NUMBER = "5551993199486";

// Janela de atendimento (horário local) — 06:00 às 21:30
const ATEND_INICIO_MIN = 6 * 60; // 06:00
const ATEND_FIM_MIN = 21 * 60 + 30; // 21:30

// Faixas de tarifa de entrega
const FAIXA_MANHA_FIM = 8 * 60 + 30; // 06:00–08:30 → +R$40
const FAIXA_GRATIS_INICIO = 8 * 60 + 35; // 08:35
const FAIXA_GRATIS_FIM = 18 * 60; // 18:00 → grátis
const FAIXA_NOITE_INICIO = 18 * 60 + 1; // 18:01
const TAXA_MANHA = 40;
const TAXA_NOITE = 50;

function minutesFromHHMM(hhmm: string): number | null {
  const m = hhmm.match(/^(\d{1,2}):(\d{2})$/);
  if (!m) return null;
  const h = Number(m[1]);
  const mm = Number(m[2]);
  if (h < 0 || h > 23 || mm < 0 || mm > 59) return null;
  return h * 60 + mm;
}

function taxaEntregaPorMinutos(min: number): number {
  if (min >= ATEND_INICIO_MIN && min <= FAIXA_MANHA_FIM) return TAXA_MANHA;
  if (min >= FAIXA_GRATIS_INICIO && min <= FAIXA_GRATIS_FIM) return 0;
  if (min >= FAIXA_NOITE_INICIO && min <= ATEND_FIM_MIN) return TAXA_NOITE;
  return 0;
}

function descricaoFaixa(min: number): string {
  if (min >= ATEND_INICIO_MIN && min <= FAIXA_MANHA_FIM)
    return "Madrugada (06:00–08:30) — taxa R$ 40,00";
  if (min >= FAIXA_GRATIS_INICIO && min <= FAIXA_GRATIS_FIM)
    return "Horário comercial (08:35–18:00) — entrega grátis";
  if (min >= FAIXA_NOITE_INICIO && min <= ATEND_FIM_MIN)
    return "Noturno (18:01–21:30) — taxa R$ 50,00";
  return "Fora do horário de atendimento (06:00–21:30)";
}

const baseSchema = {
  nome: z.string().trim().min(2, "Informe seu nome").max(100),
  documento: z.string().trim().min(11, "CPF/CNPJ inválido").max(20),
  cep: z.string().trim().max(10).optional().or(z.literal("")),
  telefone: z.string().trim().min(10, "Telefone inválido").max(20),
  pagamento: z.string().trim().min(2, "Informe a forma de pagamento").max(60),
  carroAno: z.string().trim().min(2, "Informe carro e ano").max(100),
};

const enderecoSchema = {
  endereco: z.string().trim().min(5, "Informe o endereço").max(200),
  numero: z.string().trim().min(1, "Informe o número").max(20),
};

const schema = z.discriminatedUnion("entregaTipo", [
  z.object({ ...baseSchema, ...enderecoSchema, entregaTipo: z.literal("rapida") }),
  z.object({
    ...baseSchema,
    ...enderecoSchema,
    entregaTipo: z.literal("agendada"),
    entregaData: z.string().trim().min(1, "Selecione a data"),
    entregaHora: z.string().trim().min(1, "Selecione o horário"),
  }),
  z.object({
    ...baseSchema,
    entregaTipo: z.literal("retirada"),
    lojaRetirada: z.string().trim().min(2, "Selecione a loja"),
  }),
]);

type Props = {
  open: boolean;
  onOpenChange: (o: boolean) => void;
};

function minutosAgora(): number {
  const d = new Date();
  return d.getHours() * 60 + d.getMinutes();
}

function rapidaDisponivelAgora(): boolean {
  const min = minutosAgora();
  return min >= ATEND_INICIO_MIN && min <= ATEND_FIM_MIN;
}

function maskCep(value: string): string {
  const d = value.replace(/\D/g, "").slice(0, 8);
  if (d.length <= 5) return d;
  return `${d.slice(0, 5)}-${d.slice(5)}`;
}

const STEPS = [
  { id: 1, label: "Entrega" },
  { id: 2, label: "Veículo" },
  { id: 3, label: "Pagamento" },
] as const;

export function CheckoutDialog({ open, onOpenChange }: Props) {
  const { items, subtotal, clear, setOpen: setCartOpen } = useCart();
  const isMobile = useIsMobile();
  const [step, setStep] = useState<1 | 2 | 3>(1);
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
    entregaTipo: "rapida" as "rapida" | "agendada" | "retirada",
    entregaData: "",
    entregaHora: "",
    lojaRetirada: "",
  });

  // Autocomplete carro/ano
  const [carroOpen, setCarroOpen] = useState(false);
  const [carroHighlight, setCarroHighlight] = useState(0);
  const [catalogReady, setCatalogReady] = useState(false);
  const [carroFromSearch, setCarroFromSearch] = useState(false);
  const carroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    ensureCatalogLoaded().then(() => setCatalogReady(true)).catch(() => setCatalogReady(true));
  }, []);

  // Reset ao fechar
  useEffect(() => {
    if (!open) {
      setStep(1);
    }
  }, [open]);

  // Pré-preenche carro/ano
  useEffect(() => {
    if (!open) return;
    try {
      const params = new URLSearchParams(window.location.search);
      const v = params.get("v") || sessionStorage.getItem("lastVehicleSearch") || "";
      const decoded = v.trim();
      if (decoded && !form.carroAno) {
        setForm((p) => ({ ...p, carroAno: decoded }));
        setCarroFromSearch(true);
      } else if (decoded) {
        setCarroFromSearch(true);
      }
    } catch {
      // ignore
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

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

  const entregaResumo = () => {
    if (form.entregaTipo === "rapida") return "Entrega rápida (até 35 min — 8h30 às 18h)";
    if (form.entregaTipo === "agendada") return `Agendada para ${form.entregaData} às ${form.entregaHora}`;
    return `Retirada na loja${form.lojaRetirada ? ` — ${form.lojaRetirada}` : ""}`;
  };

  const validar = (): { ok: boolean; msg?: string } => {
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
    return { ok: true };
  };

  // Validações por passo
  const validarPasso1 = (): { ok: boolean; msg?: string } => {
    if (form.entregaTipo === "rapida") {
      if (!rapidaDisponivelAgora()) {
        return { ok: false, msg: "Fora do horário. Selecione 'Agendar entrega'." };
      }
      if (form.endereco.trim().length < 5) return { ok: false, msg: "Informe o endereço." };
      if (form.numero.trim().length < 1) return { ok: false, msg: "Informe o número." };
    } else if (form.entregaTipo === "agendada") {
      if (form.endereco.trim().length < 5) return { ok: false, msg: "Informe o endereço." };
      if (form.numero.trim().length < 1) return { ok: false, msg: "Informe o número." };
      if (!form.entregaData) return { ok: false, msg: "Selecione a data." };
      if (!form.entregaHora) return { ok: false, msg: "Selecione o horário." };
    } else if (form.entregaTipo === "retirada") {
      if (form.lojaRetirada.trim().length < 2) return { ok: false, msg: "Selecione a loja." };
    }
    return { ok: true };
  };

  const validarPasso2 = (): { ok: boolean; msg?: string } => {
    if (form.carroAno.trim().length < 2) return { ok: false, msg: "Informe carro e ano." };
    return { ok: true };
  };

  const avancar = () => {
    if (items.length === 0) {
      toast({ title: "Carrinho vazio", description: "Adicione uma bateria antes de continuar." });
      return;
    }
    const v = step === 1 ? validarPasso1() : step === 2 ? validarPasso2() : { ok: true };
    if (!v.ok) {
      toast({ title: "Dados incompletos", description: v.msg });
      return;
    }
    setStep((s) => (Math.min(s + 1, 3) as 1 | 2 | 3));
  };

  const voltar = () => setStep((s) => (Math.max(s - 1, 1) as 1 | 2 | 3));

  const irParaPasso = (s: 1 | 2 | 3) => {
    if (s < step) setStep(s);
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

  const buildWhatsAppOrderUrl = () => {
    const bateriaLinhas = items
      .map(
        (i) =>
          `• ${i.quantity}x ${i.battery.name} (${i.battery.brand} ${i.battery.amperage}Ah) — ${formatBRL(i.battery.price * i.quantity)}`,
      )
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
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
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

    const url = buildWhatsAppOrderUrl();
    window.open(url, "_blank", "noopener,noreferrer");
    toast({
      title: "Abrindo WhatsApp",
      description: "Conclua o envio da mensagem para finalizar seu pedido.",
    });
    clear();
    onOpenChange(false);
    setCartOpen(false);
  };

  const rapidaAgora = rapidaDisponivelAgora();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[92vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-xl">
        <DialogHeader className="border-b border-border px-6 pb-4 pt-6">
          <DialogTitle className="font-display text-xl sm:text-2xl">Finalizar pedido</DialogTitle>
          <DialogDescription className="sr-only">
            Wizard de 3 passos para finalizar o pedido
          </DialogDescription>

          {/* Stepper */}
          <div className="mt-4 flex items-center gap-2 sm:gap-3">
            {STEPS.map((s, idx) => {
              const done = step > s.id;
              const active = step === s.id;
              return (
                <div key={s.id} className="flex flex-1 items-center gap-2 sm:gap-3">
                  <button
                    type="button"
                    onClick={() => irParaPasso(s.id as 1 | 2 | 3)}
                    disabled={s.id >= step}
                    aria-current={active ? "step" : undefined}
                    aria-label={`Passo ${s.id}: ${s.label}`}
                    className={cn(
                      "flex shrink-0 items-center gap-2 rounded-full transition-colors",
                      s.id < step ? "cursor-pointer" : "cursor-default",
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold sm:h-8 sm:w-8 sm:text-sm",
                        done && "bg-success text-success-foreground",
                        active && "bg-primary text-primary-foreground ring-4 ring-primary/15",
                        !done && !active && "bg-muted text-muted-foreground",
                      )}
                    >
                      {done ? <Check className="h-4 w-4" /> : s.id}
                    </span>
                    <span
                      className={cn(
                        "hidden text-xs font-medium sm:inline xs:text-sm",
                        active ? "text-foreground" : "text-muted-foreground",
                      )}
                    >
                      {s.label}
                    </span>
                  </button>
                  {idx < STEPS.length - 1 && (
                    <div
                      className={cn(
                        "h-0.5 flex-1 rounded-full transition-colors",
                        step > s.id ? "bg-success" : "bg-border",
                      )}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto px-6 py-5">
            {/* PASSO 1 — ENTREGA */}
            {step === 1 && (
              <div className="space-y-5">
                <div>
                  <h3 className="font-display text-base font-bold">Como você prefere receber?</h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Escolha a modalidade e informe onde entregamos sua bateria.
                  </p>
                </div>

                {/* Modalidade — cards grandes */}
                <div className="grid gap-2 sm:grid-cols-3">
                  {(
                    [
                      {
                        v: "rapida" as const,
                        icon: Zap,
                        title: "Entrega rápida",
                        desc: "Em até 35 min",
                      },
                      {
                        v: "agendada" as const,
                        icon: CalendarClock,
                        title: "Agendar",
                        desc: "Data e horário",
                      },
                      {
                        v: "retirada" as const,
                        icon: Store,
                        title: "Retirar na loja",
                        desc: "Sem custo",
                      },
                    ] as const
                  ).map((opt) => {
                    const Icon = opt.icon;
                    const selected = form.entregaTipo === opt.v;
                    return (
                      <button
                        key={opt.v}
                        type="button"
                        onClick={() => setForm((p) => ({ ...p, entregaTipo: opt.v }))}
                        className={cn(
                          "flex flex-col items-start gap-2 rounded-xl border p-3 text-left transition-all",
                          selected
                            ? "border-primary bg-primary/5 shadow-sm ring-1 ring-primary/20"
                            : "border-border hover:border-primary/40 hover:bg-secondary/40",
                        )}
                      >
                        <Icon
                          className={cn(
                            "h-5 w-5",
                            selected ? "text-primary" : "text-muted-foreground",
                          )}
                        />
                        <div>
                          <div className="text-sm font-semibold">{opt.title}</div>
                          <div className="text-xs text-muted-foreground">{opt.desc}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {form.entregaTipo === "rapida" && !rapidaAgora && (
                  <p className="rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive">
                    Fora do horário de entrega rápida (8h30 às 18h). Selecione "Agendar".
                  </p>
                )}

                {/* Endereço */}
                {form.entregaTipo !== "retirada" && (
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="cep">
                        CEP{" "}
                        <span className="text-xs font-normal text-muted-foreground">
                          (preenche o endereço)
                        </span>
                      </Label>
                      <div className="relative">
                        <Input
                          id="cep"
                          value={form.cep}
                          onChange={(e) => handleCepChange(e.target.value)}
                          placeholder="00000-000"
                          inputMode="numeric"
                          autoFocus
                        />
                        {cepLoading && (
                          <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
                        )}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="endereco">Endereço de entrega</Label>
                      <Input
                        id="endereco"
                        value={form.endereco}
                        onChange={update("endereco")}
                        placeholder="Rua, bairro, cidade"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="numero">Número (Casa/Apto)</Label>
                      <Input
                        id="numero"
                        value={form.numero}
                        onChange={update("numero")}
                        placeholder="123 / Apto 45"
                      />
                    </div>
                  </div>
                )}

                {form.entregaTipo === "agendada" && (
                  <div className="grid gap-3 sm:grid-cols-2">
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

                {form.entregaTipo === "retirada" && (
                  <div className="space-y-1.5">
                    <Label htmlFor="lojaRetirada">Loja para retirada</Label>
                    <select
                      id="lojaRetirada"
                      value={form.lojaRetirada}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, lojaRetirada: e.target.value }))
                      }
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      autoFocus
                    >
                      <option value="">Selecione uma loja...</option>
                      <option value="Porto Alegre - Medianeira (Av. Carlos Barbosa, 1452)">
                        Porto Alegre - Medianeira (Av. Carlos Barbosa, 1452)
                      </option>
                      <option value="Porto Alegre - Petrópolis (Av. Protásio Alves, 4189)">
                        Porto Alegre - Petrópolis (Av. Protásio Alves, 4189)
                      </option>
                      <option value="Canoas - Fátima (Av. Guilherme Schell, 3266)">
                        Canoas - Fátima (Av. Guilherme Schell, 3266)
                      </option>
                      <option value="Gravataí (Av. Dorival Cândido Luz de Oliveira, 6625 - Bom Princípio)">
                        Gravataí (Av. Dorival Cândido Luz de Oliveira, 6625 - Bom Princípio)
                      </option>
                      <option value="São Leopoldo (Av. Feitoria, 917 - São José)">
                        São Leopoldo (Av. Feitoria, 917 - São José)
                      </option>
                      <option value="Novo Hamburgo (Av. Victor Hugo Kunz, 961 - Hamburgo Velho)">
                        Novo Hamburgo (Av. Victor Hugo Kunz, 961 - Hamburgo Velho)
                      </option>
                    </select>
                    <p className="text-xs text-muted-foreground">
                      Você retira na loja selecionada — endereço não é necessário.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* PASSO 2 — VEÍCULO */}
            {step === 2 && (
              <div className="space-y-5">
                <div>
                  <h3 className="font-display text-base font-bold">Confirme o veículo</h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Confirme que esta bateria atende seu veículo. Se tiver dúvida, escolhemos pelo
                    modelo na entrega.
                  </p>
                </div>

                {/* Bateria(s) — somente leitura */}
                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                    Sua bateria
                  </Label>
                  <div className="space-y-2">
                    {items.map((i) => (
                      <div
                        key={i.battery.id}
                        className="flex items-center gap-3 rounded-lg border border-border bg-secondary/30 p-3"
                      >
                        {i.battery.image && (
                          <img
                            src={i.battery.image}
                            alt=""
                            className="h-14 w-14 shrink-0 rounded-md bg-background object-contain"
                            loading="lazy"
                          />
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-sm font-semibold">{i.battery.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {i.battery.brand} · {i.battery.amperage}Ah · Qtd {i.quantity}
                          </div>
                        </div>
                        <div className="text-sm font-bold">
                          {formatBRL(i.battery.price * i.quantity)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Carro/ano */}
                {carroFromSearch && form.carroAno ? (
                  <div className="space-y-1.5">
                    <Label>Carro e ano</Label>
                    <div className="flex items-center gap-2 rounded-lg border border-border bg-secondary/40 px-3 py-2 text-sm">
                      <Car className="h-4 w-4 text-muted-foreground" />
                      <span className="flex-1 font-medium">{form.carroAno}</span>
                      <button
                        type="button"
                        onClick={() => setCarroFromSearch(false)}
                        className="text-xs text-primary hover:underline"
                      >
                        alterar
                      </button>
                    </div>
                  </div>
                ) : (
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
                        autoFocus
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
                                  {s.codes.length} código{s.codes.length > 1 ? "s" : ""}{" "}
                                  compatível{s.codes.length > 1 ? "is" : ""}
                                </div>
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* PASSO 3 — CONTATO E PAGAMENTO */}
            {step === 3 && (
              <div className="space-y-5">
                <div>
                  <h3 className="font-display text-base font-bold">Seus dados e pagamento</h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Para entrarmos em contato e organizar a entrega.
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="nome">Nome completo</Label>
                    <Input
                      id="nome"
                      value={form.nome}
                      onChange={update("nome")}
                      placeholder="João da Silva"
                      autoFocus
                    />
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label htmlFor="documento">CPF / CNPJ</Label>
                      <Input
                        id="documento"
                        value={form.documento}
                        onChange={update("documento")}
                        placeholder="000.000.000-00"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="telefone">Telefone</Label>
                      <Input
                        id="telefone"
                        value={form.telefone}
                        onChange={update("telefone")}
                        placeholder="(11) 99999-9999"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="pagamento">Forma de pagamento</Label>
                    <Input
                      id="pagamento"
                      value={form.pagamento}
                      onChange={update("pagamento")}
                      placeholder="Pix, dinheiro, cartão (Visa, Master...)"
                    />
                  </div>
                </div>

                <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
                  <div className="flex items-start gap-2">
                    <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <div className="space-y-1 text-xs">
                      <div className="font-semibold text-foreground">
                        Pagamento somente na entrega
                      </div>
                      <div className="text-muted-foreground">
                        Você não paga nada agora. Pagamento direto ao entregador.
                      </div>
                    </div>
                  </div>
                  <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-success/10 px-2.5 py-1 text-xs font-semibold text-success">
                    <CreditCard className="h-3 w-3" />
                    10x sem juros no cartão
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* RESUMO + NAVEGAÇÃO — sticky no rodapé */}
          <div
            data-debug-id="checkout-sticky-summary"
            className="border-t border-border bg-muted/30 px-6 py-4"
          >
            <div className="mb-3 space-y-1.5">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  {items.reduce((s, i) => s + i.quantity, 0)} item
                  {items.reduce((s, i) => s + i.quantity, 0) !== 1 ? "s" : ""}
                </span>
                <span className="text-success font-medium">Instalação grátis</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-display text-sm font-bold">Total</span>
                <span className="font-display text-xl font-bold text-primary">
                  {formatBRL(subtotal)}
                </span>
              </div>
            </div>

            {step < 3 ? (
              <div className="flex gap-2">
                {step > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    onClick={voltar}
                    aria-label="Voltar para o passo anterior"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Voltar
                  </Button>
                )}
                <Button
                  type="button"
                  size="lg"
                  onClick={avancar}
                  className="flex-1"
                  aria-label="Avançar para o próximo passo"
                >
                  Continuar
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    onClick={voltar}
                    aria-label="Voltar para o passo anterior"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Voltar
                  </Button>
                  <Button
                    type="submit"
                    size="lg"
                    className="flex-1 bg-[#25D366] text-white hover:bg-[#20bd5a]"
                  >
                    <MessageCircle className="h-4 w-4" />
                    Enviar pelo WhatsApp
                  </Button>
                </div>
                <p className="text-center text-xs text-muted-foreground">
                  Seu pedido será aberto no WhatsApp com a mensagem pronta — basta enviar
                </p>

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
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
