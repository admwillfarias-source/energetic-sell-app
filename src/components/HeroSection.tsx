import { lazy, Suspense, useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Loader2,
  MessageCircle,
  Phone,
  Clock,
  CheckCircle2,
  Shield,
  Star,
  Sparkles,
  Zap,
} from "lucide-react";
import { markEvent } from "@/lib/perfMetrics";
import { trackLead } from "@/lib/tracking";
import { ensureCatalogLoaded } from "@/lib/catalogStore";
import { getStrictVehicleCodes } from "@/lib/fitments";
import { toast } from "@/hooks/use-toast";

const QUICK_SEARCHES: { label: string; query: string }[] = [
  { label: "Onix 2018", query: "Chevrolet Onix 2018" },
  { label: "HB20 2020", query: "Hyundai HB20 2020" },
  { label: "Strada 2015", query: "Fiat Strada 2015" },
  { label: "Corolla 2017", query: "Toyota Corolla 2017" },
];

function getLiveDeliveries() {
  const now = new Date();
  const totalMinutes = now.getHours() * 60 + now.getMinutes();
  if (totalMinutes < 480 || totalMinutes > 1170) return 0;
  const progress = (totalMinutes - 480) / (1170 - 480);
  const wave = (Math.sin(progress * Math.PI * 2) + 1) / 2;
  return 3 + Math.round(wave * 13);
}

const SearchOverlay = lazy(() => import("@/components/SearchOverlay"));
const PHONE = "(51) 99319-9486";
const PHONE_HREF = "tel:+5551993199486";
const WHATSAPP_HREF =
  "https://wa.me/5551993199486?text=Ol%C3%A1!%20Preciso%20de%20uma%20bateria.";

export default function HeroSection() {
  const [overlayOpen, setOverlayOpen] = useState(false);
  const [initialQuery, setInitialQuery] = useState("");
  const sectionRef = useRef<HTMLElement>(null);
  const navigate = useNavigate();
  const [chipLoading, setChipLoading] = useState<string | null>(null);
  const [notFoundLabel, setNotFoundLabel] = useState<string | undefined>(undefined);
  const liveDeliveries = useMemo(() => getLiveDeliveries(), []);
  const overlayPrefetched = useRef(false);

  const openOverlay = () => {
    markEvent("overlay_intent");
    setOverlayOpen(true);
  };

  const handleQuickSearch = async (item: { label: string; query: string }) => {
    if (chipLoading) return;
    markEvent("quick_search_click");
    setChipLoading(item.label);
    setNotFoundLabel(undefined);
    const safety = window.setTimeout(() => setChipLoading(null), 8000);
    try {
      try {
        await ensureCatalogLoaded();
      } catch {
        toast({
          title: "Falha ao carregar catálogo",
          description: "Tente novamente em alguns segundos.",
        });
      }
      let codes: string[] = [];
      try {
        codes = getStrictVehicleCodes(item.query);
      } catch {
        codes = [];
      }
      if (codes.length > 0) {
        navigate(
          `/resultado?codes=${encodeURIComponent(codes.join(","))}&v=${encodeURIComponent(item.query)}`,
        );
        return;
      }
      setInitialQuery(item.query);
      setNotFoundLabel(item.query);
      setOverlayOpen(true);
    } finally {
      window.clearTimeout(safety);
      setChipLoading(null);
    }
  };

  useEffect(() => {
    if (overlayPrefetched.current) return;
    const prefetch = () => {
      if (overlayPrefetched.current) return;
      overlayPrefetched.current = true;
      import("@/components/SearchOverlay").then(() => markEvent("overlay_chunk_loaded"));
    };
    const el = sectionRef.current;
    if (typeof IntersectionObserver === "undefined" || !el) {
      const w = window as unknown as {
        requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number;
      };
      const schedule = w.requestIdleCallback ?? ((cb: () => void) => setTimeout(cb, 1000));
      const id = schedule(prefetch, { timeout: 2500 });
      return () => {
        const cancel = (window as unknown as { cancelIdleCallback?: (id: number) => void })
          .cancelIdleCallback;
        if (cancel) cancel(id as number);
      };
    }
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          prefetch();
          obs.disconnect();
        }
      },
      { threshold: 0.1 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="inicio"
      className="relative pt-16 sm:pt-20 md:pt-24"
    >
      {/* Background image with dark overlay */}
      <div className="absolute inset-0 z-0">
        <picture>
          <source type="image/avif" srcSet="/hero-bg.avif" />
          <source type="image/webp" srcSet="/hero-bg.webp" />
          <img
            src="/hero-bg.webp"
            alt="Instalação de bateria automotiva em Porto Alegre"
            className="h-full w-full object-cover"
            width={1600}
            height={1024}
            // @ts-expect-error fetchpriority is a valid HTML attribute
            fetchpriority="high"
            decoding="async"
            loading="eager"
          />
        </picture>
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/95 via-slate-900/90 to-slate-900/80" />
      </div>

      <div className="container relative z-10 mx-auto max-w-3xl px-4 pb-10 pt-4 sm:px-6 sm:pb-14 sm:pt-6 md:pb-16 md:pt-8">
        <span className="mb-3 inline-flex items-center gap-2 rounded-full bg-urgency px-4 py-2 text-sm font-bold text-white shadow-lg">
          <Clock className="h-4 w-4" />
          Plantão das 6h às 22h
        </span>

        <h1 className="mb-3 font-display text-3xl font-extrabold leading-tight text-white sm:text-4xl md:text-5xl lg:text-6xl">
          Bateria Entregue e Instalada em até{" "}
          <span className="block text-accent-yellow">35 Minutos</span>
        </h1>

        <p className="mb-4 hidden text-base leading-relaxed text-slate-200 sm:block sm:text-lg md:text-xl">
          Bateria com entrega rápida em Porto Alegre. Pagamento em até 10x sem juros. Instalação
          gratuita e garantida.
        </p>

        <ul className="mb-5 flex flex-wrap gap-x-5 gap-y-2">
          {["Pague somente na entrega", "Instalação gratuita", "Até 10x sem juros"].map((b) => (
            <li
              key={b}
              className="flex items-center gap-2 text-sm font-medium text-slate-200"
            >
              <CheckCircle2 className="h-4 w-4 text-green-400" />
              {b}
            </li>
          ))}
        </ul>

        {/* INFORMATIVO — pesquise e encomende online */}
        <div className="mb-4 flex items-start gap-3 rounded-2xl border border-accent-yellow/40 bg-accent-yellow/95 px-4 py-3 text-slate-900 shadow-lg">
          <Zap className="mt-0.5 h-5 w-5 shrink-0" />
          <p className="text-sm font-semibold leading-snug sm:text-base">
            Pesquise e encomende sua bateria online em segundos.
            <span className="block text-xs font-medium text-slate-800 sm:text-sm">
              Informe a marca e o modelo do carro — mostramos o que você precisa, com preço, e
              você pede na hora pelo WhatsApp.
            </span>
          </p>
        </div>

        {/* BUSCA */}
        <div className="relative mb-5 rounded-2xl bg-white/95 p-3 shadow-xl ring-2 ring-accent-yellow/70 backdrop-blur supports-[backdrop-filter]:bg-white/90">
          <span className="absolute -top-3 left-4 inline-flex items-center gap-1.5 rounded-full bg-urgency px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-white shadow-md sm:text-xs">
            <Sparkles className="h-3.5 w-3.5" />
            Encomende agora • Entrega em 35 min
          </span>

          <div className="flex flex-col gap-2 pt-2 sm:flex-row">
            <div className="flex flex-1 items-center rounded-xl border-2 border-border bg-white px-4 focus-within:border-primary">
              <Search className="mr-2 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
              <input
                type="text"
                placeholder="Carro e ano (Ex: Onix 2018)"
                defaultValue={initialQuery}
                onFocus={openOverlay}
                onClick={openOverlay}
                onChange={(e) => {
                  setInitialQuery(e.target.value);
                  openOverlay();
                }}
                className="w-full bg-transparent py-3 text-sm text-foreground placeholder-muted-foreground outline-none"
                aria-label="Buscar veículo ou modelo da bateria"
              />
            </div>
            <button
              type="button"
              onClick={openOverlay}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-md transition hover:bg-primary-dark active:scale-95"
            >
              Buscar Bateria
            </button>
          </div>

          {/* Quick searches */}
          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Frequentes:
            </span>
            {QUICK_SEARCHES.map((item) => {
              const isLoading = chipLoading === item.label;
              const disabled = !!chipLoading && !isLoading;
              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => handleQuickSearch(item)}
                  disabled={disabled}
                  aria-busy={isLoading}
                  className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors ${
                    isLoading
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-white text-foreground hover:border-primary hover:text-primary"
                  } disabled:cursor-not-allowed disabled:opacity-50`}
                >
                  {isLoading && <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />}
                  {item.label}
                </button>
              );
            })}
          </div>

          <p className="mt-2 text-center text-xs font-medium text-muted-foreground">
            <Search className="mr-1 inline h-3.5 w-3.5" />
            Sem cadastro. Você recebe o preço na hora.
          </p>
        </div>

        {/* CTAs */}
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:gap-4">
          <a
            href={PHONE_HREF}
            rel="noopener"
            onClick={() => trackLead("hero-phone")}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-8 py-4 text-lg font-bold text-primary-foreground shadow-lg transition hover:-translate-y-0.5 hover:bg-primary-dark"
          >
            <Phone className="h-5 w-5" />
            Ligar {PHONE}
          </a>
          <a
            href={WHATSAPP_HREF}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackLead("hero-whatsapp")}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-whatsapp px-8 py-4 text-lg font-bold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-whatsapp-dark"
          >
            <MessageCircle className="h-5 w-5" />
            WhatsApp
          </a>
        </div>

        {/* Confiança pagamento */}
        <div className="mb-6 flex items-start gap-2 rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-xs text-slate-100 backdrop-blur sm:text-sm">
          <Shield className="mt-0.5 h-4 w-4 shrink-0 text-accent-yellow" />
          <span>
            <strong className="font-semibold text-white">Pague só na entrega</strong>, após a
            instalação — Pix, Cartão de Crédito ou Débito. Preço já com a devolução do casco usado.
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className="h-5 w-5 fill-accent-yellow text-accent-yellow"
              />
            ))}
          </div>
          <span className="text-sm font-medium text-slate-200">
            <strong className="font-bold text-white">4.9/5</strong> · Mais de 1.500 clientes
            satisfeitos
          </span>
          {liveDeliveries > 0 && (
            <span
              aria-live="polite"
              className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-whatsapp/20 px-3 py-1 text-xs font-bold text-green-300"
            >
              <span className="h-2 w-2 animate-pulse rounded-full bg-green-400" />
              {liveDeliveries} entregas agora
            </span>
          )}
        </div>
      </div>

      {chipLoading && (
        <div
          role="status"
          aria-live="polite"
          className="fixed inset-0 z-[60] flex items-center justify-center bg-background/70 backdrop-blur-sm"
        >
          <div className="flex flex-col items-center gap-3 rounded-2xl bg-card px-6 py-5 shadow-lg">
            <Loader2 className="h-8 w-8 animate-spin text-primary" aria-hidden="true" />
            <p className="text-sm font-semibold text-foreground">
              Buscando baterias para {chipLoading}…
            </p>
          </div>
        </div>
      )}

      {overlayOpen && (
        <Suspense fallback={null}>
          <SearchOverlay
            open={overlayOpen}
            onOpenChange={(o) => {
              setOverlayOpen(o);
              if (!o) setNotFoundLabel(undefined);
            }}
            initialQuery={initialQuery}
            notFoundLabel={notFoundLabel}
          />
        </Suspense>
      )}
    </section>
  );
}
