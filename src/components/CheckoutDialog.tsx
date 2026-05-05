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
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { supabase } from "@/integrations/supabase/client";
import { searchVehicles, type VehicleSuggestion } from "@/lib/fitments";
import { ensureCatalogLoaded } from "@/lib/catalogStore";
import { cn } from "@/lib/utils";

// Número da loja (formato internacional, só dígitos). Edite aqui.
const WHATSAPP_NUMBER = "5551993199486";

// Janela de atendimento (horário local) — 06:30 às 21:30
const ATEND_INICIO_MIN = 6 * 60 + 30; // 06:30
const ATEND_FIM_MIN = 21 * 60 + 30; // 21:30

// Bairros com atendimento rápido (06:30–08:30 e até 21:30)
const BAIRROS_RAPIDA = [
  "Nonoai",
  "Medianeira",
  "Menino Deus",
  "Cidade Baixa",
  "Centro Histórico",
  "Cavalhada",
  "Petrópolis",
  "Cristal",
  "Bom Fim",
  "Jardim Botânico",
  "Tristeza",
  "Praia de Belas",
  "Moinhos de Vento",
  "Mont Serrat",
  "Bela Vista",
  "Higienópolis",
  "Azenha",
  "Auxiliadora",
  "Camaquã",
  "Farroupilha",
  "Santa Tereza",
  "Santana",
  "Santo Antônio",
  "Teresópolis",
  "Três Figueiras",
  "Vila Assunção",
];

function normalizeBairro(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

const BAIRROS_RAPIDA_NORM = new Set(BAIRROS_RAPIDA.map(normalizeBairro));

function bairroAtendeRapido(bairro: string): boolean {
  if (!bairro) return false;
  return BAIRROS_RAPIDA_NORM.has(normalizeBairro(bairro));
}

// Janela comercial: 08:35–18:00 — atende todos os bairros de Porto Alegre
const COMERCIAL_INICIO = 8 * 60 + 35; // 08:35
const COMERCIAL_FIM = 18 * 60; // 18:00

function janelaComercial(min: number): boolean {
  return min >= COMERCIAL_INICIO && min <= COMERCIAL_FIM;
}

function rapidaJanelaValida(min: number): boolean {
  if (min < ATEND_INICIO_MIN || min > ATEND_FIM_MIN) return false;
  return true;
}

// Faixas de tarifa de entrega
const FAIXA_MANHA_INICIO = 6 * 60 + 30; // 06:30
const FAIXA_MANHA_FIM = 8 * 60; // 08:00 → +R$ 40
const FAIXA_GRATIS_INICIO = 8 * 60 + 35; // 08:35
const FAIXA_GRATIS_FIM = 18 * 60; // 18:00 → grátis
const FAIXA_NOITE_INICIO = 18 * 60 + 1; // 18:01
const TAXA_MANHA = 40;
const TAXA_NOITE = 50;
const TAXA_DOMINGO = 40;

function minutesFromHHMM(hhmm: string): number | null {
  const m = hhmm.match(/^(\d{1,2}):(\d{2})$/);
  if (!m) return null;
  const h = Number(m[1]);
  const mm = Number(m[2]);
  if (h < 0 || h > 23 || mm < 0 || mm > 59) return null;
  return h * 60 + mm;
}

function taxaEntregaPorMinutos(min: number): number {
  if (min >= FAIXA_MANHA_INICIO && min <= FAIXA_MANHA_FIM) return TAXA_MANHA;
  if (min >= FAIXA_GRATIS_INICIO && min <= FAIXA_GRATIS_FIM) return 0;
  if (min >= FAIXA_NOITE_INICIO && min <= ATEND_FIM_MIN) return TAXA_NOITE;
  return 0;
}

function descricaoFaixa(min: number): string {
  if (min >= FAIXA_MANHA_INICIO && min <= FAIXA_MANHA_FIM)
    return "Manhã cedo (06:30–08:00) — taxa R$ 40,00";
  if (min >= FAIXA_GRATIS_INICIO && min <= FAIXA_GRATIS_FIM)
    return "Horário comercial (08:35–18:00) — entrega grátis";
  if (min >= FAIXA_NOITE_INICIO && min <= ATEND_FIM_MIN)
    return "Noturno (18:01–21:30) — taxa R$ 50,00";
  return "Fora do horário de atendimento (06:30–21:30)";
}

const baseSchema = {
  nome: z.string().trim().min(2, "Informe seu nome").max(100),
  documento: z.string().trim().max(20).optional().or(z.literal("")),
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
  const navigate = useNavigate();
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
    bairro: "",
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
        setForm((p) => ({ ...p, endereco: linha, bairro: data.bairro || p.bairro }));
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

  const entregaMin = useMemo<number | null>(() => {
    if (form.entregaTipo === "rapida") return minutosAgora();
    if (form.entregaTipo === "agendada") return minutesFromHHMM(form.entregaHora);
    return null; // retirada não tem taxa
  }, [form.entregaTipo, form.entregaHora]);

  const isDomingo = useMemo(() => {
    if (form.entregaTipo === "retirada") return false;
    if (form.entregaTipo === "rapida") return new Date().getDay() === 0;
    if (form.entregaTipo === "agendada" && form.entregaData) {
      // entregaData é "YYYY-MM-DD" — interpreta como data local
      const [y, m, d] = form.entregaData.split("-").map(Number);
      if (y && m && d) return new Date(y, m - 1, d).getDay() === 0;
    }
    return false;
  }, [form.entregaTipo, form.entregaData]);

  const taxaEntrega = useMemo(() => {
    if (form.entregaTipo === "retirada") return 0;
    if (entregaMin == null) return 0;
    const base = taxaEntregaPorMinutos(entregaMin);
    return base + (isDomingo ? TAXA_DOMINGO : 0);
  }, [form.entregaTipo, entregaMin, isDomingo]);

  // Desconto à vista (PIX/Dinheiro): 3% sobre subtotal
  const pagamentoComDesconto =
    form.pagamento === "PIX" || form.pagamento === "Dinheiro";
  const descontoPagamento = pagamentoComDesconto
    ? Math.round(subtotal * 0.03 * 100) / 100
    : 0;

  const totalComEntrega = subtotal + taxaEntrega - descontoPagamento;

  // Parcelamento por bandeira
  const maxParcelas = useMemo(() => {
    if (form.pagamento === "Banricompras") return 5;
    if (
      form.pagamento === "Visa" ||
      form.pagamento === "Mastercard" ||
      form.pagamento === "Elo" ||
      form.pagamento === "Hipercard" ||
      form.pagamento === "Amex"
    )
      return 10;
    return 1;
  }, [form.pagamento]);

  const [parcelas, setParcelas] = useState<number>(1);
  // Garante parcelas dentro do limite da bandeira escolhida
  useEffect(() => {
    setParcelas((p) => Math.min(Math.max(1, p), maxParcelas));
  }, [maxParcelas]);

  const parcelasEfetivas = Math.min(Math.max(1, parcelas), maxParcelas);
  const valorParcela = parcelasEfetivas > 1 ? totalComEntrega / parcelasEfetivas : totalComEntrega;

  const entregaResumo = () => {
    if (form.entregaTipo === "rapida") {
      const taxaTxt = taxaEntrega > 0 ? ` — taxa ${formatBRL(taxaEntrega)}` : " — sem taxa";
      return `Entrega rápida (até 35 min, 06h30 às 21h30)${taxaTxt}`;
    }
    if (form.entregaTipo === "agendada") {
      const taxaTxt = taxaEntrega > 0 ? ` — taxa ${formatBRL(taxaEntrega)}` : " — gratuita";
      return `Agendada para ${form.entregaData} às ${form.entregaHora}${taxaTxt}`;
    }
    return `Retirada na loja${form.lojaRetirada ? ` — ${form.lojaRetirada}` : ""}`;
  };

  const validar = (): { ok: boolean; msg?: string } => {
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      const first = Object.values(parsed.error.flatten().fieldErrors)[0]?.[0];
      return { ok: false, msg: first ?? "Verifique o formulário." };
    }
    if (form.entregaTipo === "rapida") {
      if (!rapidaDisponivelAgora()) {
        return {
          ok: false,
          msg: "Entrega rápida disponível das 06h30 às 21h30. Selecione 'Agendar entrega' para outro horário.",
        };
      }
      const agora = minutosAgora();
      if (!janelaComercial(agora) && !bairroAtendeRapido(form.bairro)) {
        return {
          ok: false,
          msg: "Fora do horário comercial (08:35–18:00) atendemos apenas os bairros listados. Agende para o próximo dia útil.",
        };
      }
    }
    if (form.entregaTipo === "agendada") {
      const m = minutesFromHHMM(form.entregaHora);
      if (m == null || m < ATEND_INICIO_MIN || m > ATEND_FIM_MIN) {
        return { ok: false, msg: "Horário de agendamento entre 06:30 e 21:30." };
      }
      if (!janelaComercial(m) && !bairroAtendeRapido(form.bairro)) {
        return {
          ok: false,
          msg: "Fora do horário comercial (08:35–18:00), agendamento disponível apenas para bairros atendidos.",
        };
      }
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
      if (form.bairro.trim().length < 2) return { ok: false, msg: "Informe o bairro." };
      const agora = minutosAgora();
      if (!janelaComercial(agora) && !bairroAtendeRapido(form.bairro)) {
        return {
          ok: false,
          msg: "Fora do horário comercial (08:35–18:00) atendemos apenas os bairros listados. Agende para o próximo dia útil.",
        };
      }
    } else if (form.entregaTipo === "agendada") {
      if (form.endereco.trim().length < 5) return { ok: false, msg: "Informe o endereço." };
      if (form.numero.trim().length < 1) return { ok: false, msg: "Informe o número." };
      if (form.bairro.trim().length < 2) return { ok: false, msg: "Informe o bairro." };
      if (!form.entregaData) return { ok: false, msg: "Selecione a data." };
      if (!form.entregaHora) return { ok: false, msg: "Selecione o horário." };
      const m = minutesFromHHMM(form.entregaHora);
      if (m == null || m < ATEND_INICIO_MIN || m > ATEND_FIM_MIN) {
        return { ok: false, msg: "Horário de agendamento entre 06:30 e 21:30." };
      }
      if (!janelaComercial(m) && !bairroAtendeRapido(form.bairro)) {
        return {
          ok: false,
          msg: "Fora do horário comercial (08:35–18:00), agendamento disponível apenas para bairros atendidos.",
        };
      }
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
          bairro: form.bairro || "",
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
        description: "Acompanhe seu pedido na próxima tela.",
      });

      const orderId = data?.id ?? data?.number;
      clear();
      onOpenChange(false);
      setCartOpen(false);
      if (orderId) {
        navigate(`/pedido-confirmado?id=${orderId}`);
      }
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
      (form.documento ? `CPF/CNPJ: ${form.documento}\n` : "") +
      `Telefone: ${form.telefone}\n\n` +
      `*Entrega*\n` +
      `Endereço: ${form.endereco}\n` +
      `Número: ${form.numero}\n` +
      (form.bairro ? `Bairro: ${form.bairro}\n` : "") +
      (form.cep ? `CEP: ${form.cep}\n` : "") +
      `Modalidade: ${entregaResumo()}\n\n` +
      `*Veículo*\n${form.carroAno}\n\n` +
      `*Bateria(s) solicitada(s)*\n${bateriaLinhas}\n\n` +
      `*Pagamento*\n${form.pagamento}` +
      (parcelasEfetivas > 1
        ? ` em até ${parcelasEfetivas}x de ${formatBRL(valorParcela)} sem juros`
        : "") +
      (descontoPagamento > 0
        ? `\nDesconto à vista (3%): -${formatBRL(descontoPagamento)}`
        : "") +
      `\n\n` +
      `Subtotal: ${formatBRL(subtotal)}\n` +
      `Taxa de entrega: ${taxaEntrega > 0 ? formatBRL(taxaEntrega) : "Grátis"}\n` +
      (descontoPagamento > 0
        ? `Desconto: -${formatBRL(descontoPagamento)}\n`
        : "") +
      `*Total: ${formatBRL(totalComEntrega)}*`;
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
      <DialogContent className="flex h-[100dvh] max-h-[100dvh] w-[calc(100vw-1rem)] max-w-[calc(100vw-1rem)] flex-col gap-0 overflow-hidden p-0 sm:h-auto sm:max-h-[92vh] sm:w-full sm:max-w-xl">
        <DialogHeader className="border-b border-border px-4 pb-3 pt-5 sm:px-6 sm:pb-4 sm:pt-6">
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

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-5">
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
                        desc: "Em até 35 min · 06h30–21h30",
                      },
                      {
                        v: "agendada" as const,
                        icon: CalendarClock,
                        title: "Agendar",
                        desc: "06h30–21h30",
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
                    Fora do horário de atendimento (06h30 às 21h30). Selecione "Agendar".
                  </p>
                )}

                {form.entregaTipo === "rapida" && rapidaAgora && (
                  <p className="rounded-md border border-accent/40 bg-accent/10 px-3 py-2 text-xs text-foreground">
                    ⏱️ <strong>Atenção:</strong> a entrega rápida tem prazo estimado de até 35 min,
                    mas <strong>o horário pode sofrer alterações</strong> conforme demanda, trânsito
                    e disponibilidade da equipe.
                  </p>
                )}

                {isDomingo && form.entregaTipo !== "retirada" && (
                  <p className="rounded-md border border-primary/30 bg-primary/5 px-3 py-2 text-xs text-foreground">
                    📅 Entregas aos <strong>domingos</strong> têm <strong>taxa adicional de
                    {" "}{formatBRL(TAXA_DOMINGO)}</strong>.
                  </p>
                )}

                {form.entregaTipo === "rapida" && rapidaAgora && taxaEntrega > 0 && (
                  <div className="rounded-md bg-secondary/40 px-3 py-2 text-xs font-semibold text-foreground">
                    {descricaoFaixa(entregaMin ?? 0)}
                    {isDomingo && ` + domingo ${formatBRL(TAXA_DOMINGO)}`}
                  </div>
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

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <Label htmlFor="numero">Número (Casa/Apto)</Label>
                        <Input
                          id="numero"
                          value={form.numero}
                          onChange={update("numero")}
                          placeholder="123 / Apto 45"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="bairro">Bairro</Label>
                        <Input
                          id="bairro"
                          value={form.bairro}
                          onChange={update("bairro")}
                          placeholder="Ex: Menino Deus"
                          list="bairros-rapida"
                        />
                        <datalist id="bairros-rapida">
                          {BAIRROS_RAPIDA.map((b) => (
                            <option key={b} value={b} />
                          ))}
                        </datalist>
                      </div>
                    </div>

                    {form.bairro.trim().length >= 2 && (
                      bairroAtendeRapido(form.bairro) ? (
                        <div className="rounded-md border border-success/30 bg-success/10 px-3 py-2 text-xs text-success">
                          ✅ <strong>{form.bairro}</strong> atende entrega rápida (06:30–08:30 e até 21:30).
                        </div>
                      ) : (
                        <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                          ⚠️ <strong>{form.bairro}</strong> está fora da zona de entrega rápida. Agende para o próximo dia útil em horário comercial (08:35–18:00).
                        </div>
                      )
                    )}

                  </div>
                )}

                {form.entregaTipo === "agendada" && (
                  <div className="space-y-3">
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
                        <Label htmlFor="entregaHora">Horário (06:30–21:30)</Label>
                        <Input
                          id="entregaHora"
                          type="time"
                          min="06:30"
                          max="21:30"
                          value={form.entregaHora}
                          onChange={update("entregaHora")}
                        />
                      </div>
                    </div>
                    {form.entregaHora && entregaMin != null && (
                      <div
                        className={cn(
                          "rounded-md px-3 py-2 text-xs",
                          entregaMin < ATEND_INICIO_MIN || entregaMin > ATEND_FIM_MIN
                            ? "bg-destructive/10 text-destructive"
                            : taxaEntrega > 0
                              ? "bg-secondary/40 text-foreground"
                              : "bg-success/10 text-success",
                        )}
                      >
                        {descricaoFaixa(entregaMin)}
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Agendamento <strong className="text-foreground">gratuito</strong> para
                      entregas das 08:35 às 18:00.
                    </p>
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
                      <Label htmlFor="documento" className="text-muted-foreground">
                        CPF / CNPJ <span className="text-xs">(opcional)</span>
                      </Label>
                      <Input
                        id="documento"
                        value={form.documento}
                        onChange={update("documento")}
                        placeholder="Apenas se for emitir nota"
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

                  <div className="space-y-3">
                    <Label>Forma de pagamento</Label>

                    {/* Nível 1 — categoria */}
                    <div className="grid grid-cols-3 gap-2">
                      {(
                        [
                          { v: "avista", title: "À vista", sub: "-3%", tone: "success" as const },
                          { v: "cartao", title: "Cartão", sub: "até 10x", tone: "primary" as const },
                          { v: "banri", title: "Banricompras", sub: "até 5x", tone: "primary" as const },
                        ] as const
                      ).map((cat) => {
                        const selected =
                          (cat.v === "avista" && (form.pagamento === "PIX" || form.pagamento === "Dinheiro")) ||
                          (cat.v === "cartao" &&
                            ["Visa", "Mastercard", "Elo", "Hipercard", "Amex"].includes(form.pagamento)) ||
                          (cat.v === "banri" && form.pagamento === "Banricompras");
                        return (
                          <button
                            key={cat.v}
                            type="button"
                            onClick={() => {
                              if (cat.v === "avista") setForm((p) => ({ ...p, pagamento: "PIX" }));
                              else if (cat.v === "banri")
                                setForm((p) => ({ ...p, pagamento: "Banricompras" }));
                              else setForm((p) => ({ ...p, pagamento: "" })); // espera escolher bandeira
                            }}
                            className={cn(
                              "flex min-w-0 flex-col items-center gap-0.5 rounded-lg border px-2 py-2.5 text-center transition-colors",
                              selected
                                ? cat.tone === "success"
                                  ? "border-success bg-success/10 text-success"
                                  : "border-primary bg-primary/10 text-primary"
                                : "border-border bg-background hover:bg-muted",
                            )}
                          >
                            <span className="truncate text-sm font-semibold leading-tight">
                              {cat.title}
                            </span>
                            <span className="text-[10px] font-medium opacity-80">{cat.sub}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Nível 2a — À vista: PIX vs Dinheiro */}
                    {(form.pagamento === "PIX" || form.pagamento === "Dinheiro") && (
                      <div className="space-y-1.5 rounded-lg border border-success/30 bg-success/5 p-2.5">
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-success">
                          Selecione
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                          {["PIX", "Dinheiro"].map((op) => (
                            <button
                              key={op}
                              type="button"
                              onClick={() => setForm((p) => ({ ...p, pagamento: op }))}
                              className={cn(
                                "min-w-0 truncate rounded-lg border px-2 py-2 text-sm font-semibold transition-colors",
                                form.pagamento === op
                                  ? "border-success bg-success/15 text-success"
                                  : "border-border bg-background hover:bg-muted",
                              )}
                            >
                              {op}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Nível 2b — Cartão: bandeira + parcelas */}
                    {["", "Visa", "Mastercard", "Elo", "Hipercard", "Amex"].includes(form.pagamento) &&
                      form.pagamento !== "PIX" &&
                      form.pagamento !== "Dinheiro" &&
                      form.pagamento !== "Banricompras" && (
                        <div className="space-y-3 rounded-lg border border-primary/30 bg-primary/5 p-2.5">
                          <div className="space-y-1.5">
                            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                              Bandeira
                            </p>
                            <div className="grid grid-cols-3 gap-2 xs:grid-cols-3 sm:grid-cols-5">
                              {["Visa", "Mastercard", "Elo", "Hipercard", "Amex"].map((op) => (
                                <button
                                  key={op}
                                  type="button"
                                  onClick={() => {
                                    setForm((p) => ({ ...p, pagamento: op }));
                                    setParcelas(1);
                                  }}
                                  className={cn(
                                    "min-w-0 truncate rounded-lg border px-1.5 py-2 text-xs font-semibold transition-colors",
                                    form.pagamento === op
                                      ? "border-primary bg-primary/15 text-primary"
                                      : "border-border bg-background hover:bg-muted",
                                  )}
                                >
                                  {op}
                                </button>
                              ))}
                            </div>
                          </div>

                          {form.pagamento && form.pagamento !== "" && (
                            <div className="space-y-1.5">
                              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                                Parcelas (sem juros)
                              </p>
                              <div className="grid grid-cols-5 gap-1.5">
                                {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                                  <button
                                    key={n}
                                    type="button"
                                    onClick={() => setParcelas(n)}
                                    className={cn(
                                      "min-w-0 truncate rounded-md border px-1 py-1.5 text-xs font-semibold transition-colors",
                                      parcelas === n
                                        ? "border-primary bg-primary text-primary-foreground"
                                        : "border-border bg-background hover:bg-muted",
                                    )}
                                  >
                                    {n}x
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                    {/* Nível 2c — Banricompras: parcelas */}
                    {form.pagamento === "Banricompras" && (
                      <div className="space-y-1.5 rounded-lg border border-primary/30 bg-primary/5 p-2.5">
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                          Parcelas (sem juros)
                        </p>
                        <div className="grid grid-cols-5 gap-1.5">
                          {Array.from({ length: 5 }, (_, i) => i + 1).map((n) => (
                            <button
                              key={n}
                              type="button"
                              onClick={() => setParcelas(n)}
                              className={cn(
                                "min-w-0 truncate rounded-md border px-1 py-1.5 text-xs font-semibold transition-colors",
                                parcelas === n
                                  ? "border-primary bg-primary text-primary-foreground"
                                  : "border-border bg-background hover:bg-muted",
                              )}
                            >
                              {n}x
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Resumo da escolha */}
                    {form.pagamento && (
                      <div className="rounded-lg border border-accent/30 bg-accent/5 p-2.5 text-xs">
                        <div className="font-semibold text-foreground">{form.pagamento}</div>
                        {descontoPagamento > 0 && (
                          <div className="text-success">
                            Desconto à vista: -{formatBRL(descontoPagamento)} (3%)
                          </div>
                        )}
                        {parcelasEfetivas > 1 && (
                          <div className="text-muted-foreground">
                            {parcelasEfetivas}x de {formatBRL(valorParcela)} sem juros
                          </div>
                        )}
                      </div>
                    )}
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
            className="shrink-0 border-t border-border bg-muted/30 px-4 py-3 sm:px-6 sm:py-4"
            style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
          >
            <div className="mb-2.5 space-y-1 sm:mb-3 sm:space-y-1.5">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  {items.reduce((s, i) => s + i.quantity, 0)} item
                  {items.reduce((s, i) => s + i.quantity, 0) !== 1 ? "s" : ""}
                </span>
                <span className="text-success font-medium">Instalação grátis</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">{formatBRL(subtotal)}</span>
              </div>
              {form.entregaTipo !== "retirada" && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Taxa de entrega</span>
                  <span
                    className={cn(
                      "font-medium",
                      taxaEntrega > 0 ? "text-foreground" : "text-success",
                    )}
                  >
                    {taxaEntrega > 0 ? formatBRL(taxaEntrega) : "Grátis"}
                  </span>
                </div>
              )}
              {descontoPagamento > 0 && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Desconto à vista (3%)</span>
                  <span className="font-medium text-success">
                    -{formatBRL(descontoPagamento)}
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="font-display text-sm font-bold">Total</span>
                <span className="font-display text-lg font-bold text-primary sm:text-xl">
                  {formatBRL(totalComEntrega)}
                </span>
              </div>
              {parcelasEfetivas > 1 && (
                <div className="text-right text-[11px] text-muted-foreground">
                  ou {parcelasEfetivas}x de {formatBRL(valorParcela)} sem juros
                </div>
              )}
            </div>

            {step < 3 ? (
              <div className="flex gap-2">
                {step > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={voltar}
                    aria-label="Voltar para o passo anterior"
                    className="h-11 shrink-0 px-3 text-sm sm:px-4"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <span className="hidden xs:inline">Voltar</span>
                  </Button>
                )}
                <Button
                  type="button"
                  onClick={avancar}
                  className="h-11 min-w-0 flex-1 px-3 text-sm sm:px-4"
                  aria-label="Avançar para o próximo passo"
                >
                  <span className="truncate">Continuar</span>
                  <ChevronRight className="h-4 w-4 shrink-0" />
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={voltar}
                    aria-label="Voltar para o passo anterior"
                    className="h-11 shrink-0 px-3 text-sm sm:px-4"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <span className="hidden xs:inline">Voltar</span>
                  </Button>
                  {isMobile ? (
                    <Button
                      type="submit"
                      className="h-11 min-w-0 flex-1 bg-[#25D366] px-3 text-sm text-white hover:bg-[#1ebe5d] sm:px-4"
                    >
                      <MessageCircle className="h-4 w-4 shrink-0" />
                      <span className="truncate">Enviar pelo WhatsApp</span>
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      onClick={handleWooCommerce}
                      disabled={submittingWC}
                      className="h-11 min-w-0 flex-1 px-3 text-sm sm:px-4"
                    >
                      {submittingWC ? (
                        <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
                      ) : (
                        <ShoppingCart className="h-4 w-4 shrink-0" />
                      )}
                      <span className="truncate">
                        {submittingWC ? "Enviando pedido..." : "Finalizar pedido"}
                      </span>
                    </Button>
                  )}
                </div>
                <p className="text-center text-[11px] text-muted-foreground sm:text-xs">
                  {isMobile
                    ? "Atendimento rápido pelo WhatsApp"
                    : "Seu pedido será registrado e você verá a tela de acompanhamento"}
                </p>

                <div className="flex items-center gap-3 py-1">
                  <div className="h-px flex-1 bg-border" />
                  <span className="text-xs text-muted-foreground">ou</span>
                  <div className="h-px flex-1 bg-border" />
                </div>
                {isMobile ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleWooCommerce}
                    disabled={submittingWC}
                    className="h-11 w-full"
                  >
                    {submittingWC ? (
                      <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
                    ) : (
                      <ShoppingCart className="h-4 w-4 shrink-0" />
                    )}
                    <span className="truncate">
                      {submittingWC ? "Enviando pedido..." : "Finalizar pedido pelo site"}
                    </span>
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    variant="outline"
                    className="h-11 w-full bg-[#25D366]/10 text-[#1a8a44] border-[#25D366]/40 hover:bg-[#25D366]/20"
                  >
                    <MessageCircle className="h-4 w-4 shrink-0" />
                    <span className="truncate">Enviar pelo WhatsApp</span>
                  </Button>
                )}
              </div>
            )}
          </div>


        </form>
      </DialogContent>
    </Dialog>
  );
}
