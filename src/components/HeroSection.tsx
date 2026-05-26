import { lazy, Suspense, useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Search, ShieldCheck, Loader2, MessageCircle } from "lucide-react";
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

const heroBg = "/hero-bg.webp";

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

  // Pré-fetch do chunk do SearchOverlay quando o herói entra em viewport
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
    <section
      ref={sectionRef}
      id="inicio"
      className="min-h-screen w-full flex items-center justify-center bg-background p-4 lg:p-8"
    >
      <div className="w-full max-w-7xl bg-secondary rounded-[2rem] lg:rounded-[3rem] overflow-hidden flex flex-col lg:flex-row shadow-elevated relative">
        {/* Decorative blurred orbs */}
        <div className="absolute -top-24 -left-24 w-64 h-64 bg-primary/30 rounded-full blur-[120px] opacity-40 pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-primary rounded-full blur-[120px] opacity-20 pointer-events-none" />

        {/* Content Side (60%) */}
        <div className="w-full lg:w-[60%] p-8 lg:p-20 flex flex-col justify-center relative z-10">
          <div className="inline-flex items-center gap-3 mb-6">
            <span className="h-px w-10 bg-primary" />
            <span className="text-primary font-bold tracking-[0.2em] text-xs uppercase">
              Porto Alegre & Região · Desde 2009
            </span>
          </div>

          <h1 className="font-display text-4xl lg:text-6xl text-secondary-foreground leading-[1.1] mb-6">
            Bateria entregue e instalada em até{" "}
            <span className="text-primary">35 minutos</span>
          </h1>

          <p className="text-secondary-foreground/70 text-lg lg:text-xl mb-10 max-w-lg font-light leading-relaxed">
            Sua bateria parou? Encontre o modelo ideal para seu carro e receba agora mesmo onde você estiver.
          </p>

          {/* Search Component */}
          <div className="bg-white/5 backdrop-blur-md border border-white/10 p-2 rounded-2xl max-w-xl shadow-xl">
            <div className="flex flex-col md:flex-row gap-2">
              <div className="flex-1 flex items-center px-5 bg-white/10 rounded-xl border border-white/5 focus-within:border-primary transition-all">
                <Search className="w-5 h-5 text-primary mr-3 shrink-0" aria-hidden="true" />
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
                  className="w-full py-4 bg-transparent border-none focus:ring-0 text-secondary-foreground placeholder-white/40 outline-none text-sm"
                  aria-label="Buscar veículo ou modelo da bateria"
                />
              </div>
              <button
                type="button"
                onClick={openOverlay}
                className="bg-primary hover:bg-primary/80 text-primary-foreground font-bold py-4 px-10 rounded-xl transition-all active:scale-95 shadow-lg whitespace-nowrap"
              >
                Buscar Bateria
              </button>
            </div>
          </div>

          {/* Quick searches */}
          <div className="mt-6 flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-secondary-foreground/60 uppercase tracking-wider">
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
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${
                    isLoading
                      ? "border-primary bg-primary/20 text-primary"
                      : "border-white/15 bg-white/5 text-secondary-foreground/80 hover:border-primary hover:text-primary"
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {isLoading && <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />}
                  {item.label}
                </button>
              );
            })}
          </div>

          {/* WhatsApp CTA */}
          <a
            href="https://wa.me/5551993199486?text=Ol%C3%A1!%20Solicito%20a%20minha%20bateria."
            target="_top"
            rel="noopener noreferrer"
            onClick={() => trackLead("hero-below-search")}
            className="mt-6 inline-flex items-center justify-center gap-2 w-full sm:w-fit rounded-xl bg-awr-green hover:bg-awr-green/90 text-awr-green-foreground font-bold text-sm h-12 px-6 shadow-md transition-colors"
            aria-label="Peça sua bateria pelo WhatsApp"
          >
            <MessageCircle className="h-5 w-5" />
            Peça pelo WhatsApp
          </a>

          {/* Trust Indicators */}
          <div className="mt-12 flex flex-wrap items-center gap-8 lg:gap-10 opacity-90">
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-secondary-foreground">+15 anos</span>
              <span className="text-[10px] uppercase tracking-widest text-primary font-bold">
                Experiência
              </span>
            </div>
            <div className="h-10 w-px bg-white/10" />
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-secondary-foreground">10x</span>
              <span className="text-[10px] uppercase tracking-widest text-primary font-bold">
                Sem Juros
              </span>
            </div>
            <div className="h-10 w-px bg-white/10" />
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-secondary-foreground">Desde 2009</span>
              <span className="text-[10px] uppercase tracking-widest text-primary font-bold">
                Em Porto Alegre
              </span>
            </div>
            {liveDeliveries > 0 && (
              <>
                <div className="h-10 w-px bg-white/10 hidden md:block" />
                <div className="flex flex-col" aria-live="polite">
                  <span className="text-2xl font-bold text-awr-green">{liveDeliveries}</span>
                  <span className="text-[10px] uppercase tracking-widest text-awr-green/80 font-bold">
                    Entregas agora
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Visual Side (40%) */}
        <div className="w-full lg:w-[40%] min-h-[400px] relative">
          <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-secondary via-transparent to-transparent z-10" />
          <picture>
            <source type="image/avif" srcSet="/hero-bg.avif" />
            <source type="image/webp" srcSet="/hero-bg.webp" />
            <img
              src={heroBg}
              alt="Técnico instalando bateria automotiva AWR em Porto Alegre"
              className="w-full h-full object-cover"
              width={800}
              height={1200}
              sizes="(max-width: 1024px) 100vw, 40vw"
              // @ts-expect-error fetchpriority is a valid HTML attribute
              fetchpriority="high"
              decoding="async"
              loading="eager"
            />
          </picture>

          {/* Floating Brand Badge */}
          <div className="absolute bottom-8 right-8 bg-secondary/90 backdrop-blur-xl border border-white/10 p-6 rounded-[2rem] z-20 shadow-2xl hidden lg:block max-w-xs">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5 text-primary-foreground" aria-hidden="true" />
              </div>
              <span className="text-secondary-foreground font-bold text-sm tracking-tight leading-tight">
                Garantia de fábrica Moura, Heliar, Zetta & Excell
              </span>
            </div>
            <div className="flex justify-between items-center gap-2 opacity-60">
              <span className="text-[10px] font-bold text-secondary-foreground tracking-widest">
                MOURA
              </span>
              <span className="text-[10px] font-bold text-secondary-foreground tracking-widest">
                HELIAR
              </span>
              <span className="text-[10px] font-bold text-secondary-foreground tracking-widest">
                ZETTA
              </span>
            </div>
          </div>
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
