import { lazy, Suspense, useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Car, Clock, Star, Truck, CreditCard, Award, MessageCircle, Loader2 } from "lucide-react";
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

const HeroWhatsButton = lazy(() => import("@/components/HeroWhatsButton"));
const SearchOverlay = lazy(() => import("@/components/SearchOverlay"));

const heroBg = "/hero-bg.webp";

function SearchPlaceholder({
  onActivate,
  initialValue,
  onChange,
}: {
  onActivate: () => void;
  initialValue: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="relative">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <input
        type="text"
        defaultValue={initialValue}
        placeholder="Carro e ano (Ex: Onix 2018)"
        onFocus={onActivate}
        onClick={onActivate}
        onChange={(e) => {
          onChange(e.target.value);
          onActivate();
        }}
        className="h-12 w-full rounded-md border border-input bg-background pl-9 pr-3 text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        aria-label="Buscar veículo ou modelo da bateria"
      />
    </div>
  );
}

export default function HeroSection() {
  const [overlayOpen, setOverlayOpen] = useState(false);
  const [initialQuery, setInitialQuery] = useState("");
  const [whatsVisible, setWhatsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const navigate = useNavigate();
  const [chipLoading, setChipLoading] = useState<string | null>(null);
  const [notFoundLabel, setNotFoundLabel] = useState<string | undefined>(undefined);

  const handleQuickSearch = async (item: { label: string; query: string }) => {
    if (chipLoading) return;
    markEvent("quick_search_click");
    setChipLoading(item.label);
    setNotFoundLabel(undefined);
    // Timeout de segurança: nunca deixa o overlay de loading travado.
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
      // fallback: abre overlay já preenchido + CTA WhatsApp
      setInitialQuery(item.query);
      setNotFoundLabel(item.query);
      setOverlayOpen(true);
    } finally {
      window.clearTimeout(safety);
      setChipLoading(null);
    }
  };
  const overlayPrefetched = useRef(false);

  // Calcula 1x por render
  const liveDeliveries = useMemo(() => getLiveDeliveries(), []);

  // WhatsApp button entra em idle (cascata, sem custo de IntersectionObserver)
  useEffect(() => {
    const w = window as unknown as { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number };
    const schedule = w.requestIdleCallback ?? ((cb: () => void) => setTimeout(cb, 1200));
    const id = schedule(() => setWhatsVisible(true), { timeout: 3000 });
    return () => {
      const cancel = (window as unknown as { cancelIdleCallback?: (id: number) => void }).cancelIdleCallback;
      if (cancel) cancel(id as number);
    };
  }, []);

  // Pré-fetch do chunk do SearchOverlay assim que o herói entra parcialmente
  // em viewport (10%). Antecipa o download para que o clique no campo de busca
  // abra o overlay em ~0ms.
  useEffect(() => {
    if (overlayPrefetched.current) return;
    const prefetch = () => {
      if (overlayPrefetched.current) return;
      overlayPrefetched.current = true;
      import("@/components/SearchOverlay").then(() => markEvent("overlay_chunk_loaded"));
    };
    const el = sectionRef.current;
    if (typeof IntersectionObserver === "undefined" || !el) {
      const w = window as unknown as { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number };
      const schedule = w.requestIdleCallback ?? ((cb: () => void) => setTimeout(cb, 1000));
      const id = schedule(prefetch, { timeout: 2500 });
      return () => {
        const cancel = (window as unknown as { cancelIdleCallback?: (id: number) => void }).cancelIdleCallback;
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
    <section ref={sectionRef} id="inicio" className="relative pt-1 lg:pt-2">

      <div className="absolute inset-0 z-0">
        <picture>
          <source type="image/avif" srcSet="/hero-bg.avif" />
          <source type="image/webp" srcSet="/hero-bg.webp" />
          <img
            src={heroBg}
            alt="Técnico instalando bateria automotiva AWR"
            className="w-full h-full object-cover"
            width={1200}
            height={900}
            sizes="100vw"
            // @ts-expect-error: fetchpriority é atributo HTML válido (lowercase)
            fetchpriority="high"
            decoding="async"
            loading="eager"
          />
        </picture>
        <div className="absolute inset-0 bg-gradient-to-r from-secondary/95 via-secondary/95 to-secondary/60" />
        <div className="absolute inset-0 bg-black/35" />
      </div>

      <div className="container mx-auto px-4 relative z-10 py-2 md:py-6">
        <div className="max-w-2xl">
          <div className="flex flex-wrap items-center gap-2 mb-2 md:mb-3">
            <div className="inline-flex items-center gap-2 bg-accent/20 border border-accent/40 rounded-full px-4 py-1.5" role="status">
              <Clock className="h-4 w-4 text-accent" aria-hidden="true" />
              <span className="text-accent font-semibold text-sm">Porto Alegre: Plantão 6h às 22h</span>
            </div>
            <div className="inline-flex items-center gap-2 bg-primary text-primary-foreground rounded-full px-4 py-1.5 font-bold text-sm shadow-md">
              <CreditCard className="h-4 w-4" aria-hidden="true" />
              10x sem juros
            </div>
            {liveDeliveries > 0 && (
              <div
                className="inline-flex items-center gap-2 bg-awr-green/15 border border-awr-green/40 text-awr-green rounded-full px-4 py-1.5 font-semibold text-sm"
                aria-live="polite"
              >
                <Truck className="h-4 w-4" aria-hidden="true" />
                {liveDeliveries} entregas em andamento agora
              </div>
            )}
            <div
              className="inline-flex items-center gap-2 bg-secondary-foreground/10 border border-secondary-foreground/20 text-secondary-foreground rounded-full px-4 py-1.5 font-semibold text-sm"
              aria-label="Empresa atuando desde 2009, distribuidor oficial"
            >
              <Award className="h-4 w-4 text-accent" aria-hidden="true" />
              Desde 2009 · Revenda Moura, Heliar, Excell e Zetta
            </div>
          </div>

          <h1 className="font-display text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-secondary-foreground leading-tight mb-1 md:mb-2">
            Sua bateria nova em até{" "}
            <span className="text-primary">35 minutos</span>{" "}
            — entregue e instalada
          </h1>

          <p className="text-base md:text-xl text-secondary-foreground/80 mb-2 md:mb-3">
            Selecione o modelo ideal para o seu veículo e solicite agora.
            Atendemos Porto Alegre e região com{" "}
            <strong className="text-accent">Moura, Heliar, Zetta e Excell</strong>.
          </p>

          <div className="mb-3 rounded-2xl bg-card p-3 shadow-lg md:p-5">
            <SearchPlaceholder
              onActivate={() => {
                markEvent("overlay_intent");
                setOverlayOpen(true);
              }}
              initialValue={initialQuery}
              onChange={setInitialQuery}
            />
            <button
              type="button"
              onClick={() => {
                markEvent("overlay_intent");
                setOverlayOpen(true);
              }}
              className="mt-3 flex h-12 w-full items-center justify-center gap-2 rounded-xl border-2 border-primary bg-primary px-4 text-sm md:text-base font-bold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <Car className="h-4 w-4" aria-hidden="true" />
              Peça agora a sua bateria
            </button>
            <p className="mt-2 text-center text-xs sm:text-sm font-semibold text-awr-green">
              <span aria-hidden="true">🟢</span> Técnicos disponíveis agora · 10x sem juros
            </p>
          </div>

          <div className="mb-6 flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-secondary-foreground/70">
              Buscas frequentes:
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
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                    isLoading
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-secondary-foreground/20 bg-secondary-foreground/5 text-secondary-foreground hover:border-primary hover:text-primary"
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {isLoading && <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />}
                  {item.label}
                </button>
              );
            })}
          </div>

          <a
            href="https://wa.me/5551993199486?text=Ol%C3%A1!%20Solicito%20a%20minha%20bateria."
            target="_top"
            rel="noopener noreferrer"
            onClick={() => trackLead("hero-below-search")}
            className="mb-6 flex items-center justify-center gap-2 w-full rounded-xl bg-awr-green hover:bg-awr-green/90 text-awr-green-foreground font-extrabold text-base h-12 px-5 shadow-md transition-colors"
            aria-label="Peça sua bateria pelo WhatsApp"
          >
            <MessageCircle className="h-5 w-5" />
            Peça sua bateria pelo WhatsApp
          </a>

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
                <div className="grid w-56 grid-cols-3 gap-1.5">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="h-12 animate-pulse rounded-md bg-muted" />
                  ))}
                </div>
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

          <div className="hidden sm:flex flex-col sm:flex-row gap-3 mb-6 min-h-[56px]">
            {whatsVisible && (
              <Suspense fallback={null}>
                <HeroWhatsButton />
              </Suspense>
            )}
          </div>

          <div className="flex items-center gap-2 text-secondary-foreground/90 mb-5">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-accent text-accent" />
              ))}
            </div>
            <span className="text-sm font-medium">1500+ clientes satisfeitos no Google</span>
          </div>
        </div>
      </div>
    </section>
  );
}
