import { lazy, Suspense, useState, useRef, useEffect } from "react";
import { Search, Car, Clock, Star, Truck, CreditCard, Award, AlertTriangle } from "lucide-react";
import { markEvent } from "@/lib/perfMetrics";

function getLiveDeliveries() {
  const now = new Date();
  const hour = now.getHours();
  const minutes = now.getMinutes();
  const totalMinutes = hour * 60 + minutes;
  // Janela ativa: 8h00 (480) até 19h30 (1170)
  if (totalMinutes < 480 || totalMinutes > 1170) return 0;
  // Curva senoidal dentro da janela: média ~9, mín 3, máx 16
  const progress = (totalMinutes - 480) / (1170 - 480); // 0..1
  const wave = (Math.sin(progress * Math.PI * 2) + 1) / 2; // 0..1
  return 3 + Math.round(wave * 13); // 3..16
}

const VehicleAutocomplete = lazy(() => import("@/components/VehicleAutocomplete"));
const HeroWhatsButton = lazy(() => import("@/components/HeroWhatsButton"));

import heroBg from "@/assets/hero-bg.webp";
import heroBgSm from "@/assets/hero-bg-sm.webp";

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
    <div className="flex gap-2">
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          defaultValue={initialValue}
          placeholder="Carro e ano (Ex: Onix 2018) ou modelo da bateria (Ex: M60GD)"
          onFocus={onActivate}
          onClick={onActivate}
          onTouchStart={onActivate}
          onChange={(e) => {
            onChange(e.target.value);
            onActivate();
          }}
          className="h-12 w-full rounded-md border border-input bg-background pl-9 pr-3 text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          aria-label="Buscar veículo ou modelo da bateria"
        />
      </div>
      <button
        onClick={onActivate}
        className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-primary px-5 font-bold text-primary-foreground shadow-md hover:bg-primary/90 transition-colors"
      >
        <Car className="h-4 w-4" />
        <span className="hidden sm:inline">Buscar</span>
      </button>
    </div>
  );
}

export default function HeroSection() {
  const [searchActive, setSearchActive] = useState(false);
  const [initialQuery, setInitialQuery] = useState("");
  const [whatsVisible, setWhatsVisible] = useState(false);
  const whatsRef = useRef<HTMLDivElement>(null);

  // Marca: hero montado + placeholder de busca já interativo
  useEffect(() => {
    markEvent("hero_mounted");
    markEvent("hero_search_interactive");
  }, []);

  // Pré-carrega o autocomplete + catálogo após idle, sem bloquear o LCP
  useEffect(() => {
    const w = window as unknown as { requestIdleCallback?: (cb: () => void) => number };
    const schedule = w.requestIdleCallback ?? ((cb: () => void) => setTimeout(cb, 1500));
    const id = schedule(() => setSearchActive(true));
    return () => {
      const cancel =
        (window as unknown as { cancelIdleCallback?: (id: number) => void }).cancelIdleCallback ??
        clearTimeout;
      cancel(id as number);
    };
  }, []);

  // Lazy para o botão de WhatsApp quando visível
  useEffect(() => {
    if (whatsVisible) return;
    const el = whatsRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setWhatsVisible(true);
          obs.disconnect();
        }
      },
      { rootMargin: "100px" },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [whatsVisible]);

  return (
    <section id="inicio" className="relative min-h-[90vh] flex items-center pt-16">
      <div className="absolute inset-0 z-0">
        <picture>
          <source media="(max-width: 768px)" srcSet={heroBgSm} type="image/webp" />
          <img
            src={heroBg}
            alt="Técnico instalando bateria automotiva AWR"
            className="w-full h-full object-cover"
            width={1200}
            height={900}
            fetchPriority="high"
            decoding="sync"
          />
        </picture>
        <div className="absolute inset-0 bg-gradient-to-r from-secondary/95 via-secondary/80 to-secondary/40" />
      </div>

      <div className="container mx-auto px-4 relative z-10 py-12 md:py-20">
        <div className="max-w-2xl">
          <div className="flex flex-wrap items-center gap-2 mb-6">
            <div
              className="inline-flex items-center gap-2 bg-accent/20 border border-accent/40 rounded-full px-4 py-1.5"
              role="status"
            >
              <Clock className="h-4 w-4 text-accent" aria-hidden="true" />
              <span className="text-accent font-semibold text-sm">
                Porto Alegre: Plantão 6h às 22h
              </span>
            </div>
            <div className="inline-flex items-center gap-2 bg-primary text-primary-foreground rounded-full px-4 py-1.5 font-bold text-sm shadow-md">
              <CreditCard className="h-4 w-4" aria-hidden="true" />
              10x sem juros
            </div>
            {getLiveDeliveries() > 0 && (
              <div
                className="inline-flex items-center gap-2 bg-awr-green/15 border border-awr-green/40 text-awr-green rounded-full px-4 py-1.5 font-semibold text-sm"
                aria-live="polite"
              >
                <Truck className="h-4 w-4" aria-hidden="true" />
                {getLiveDeliveries()} entregas em andamento agora
              </div>
            )}
            <div
              className="inline-flex items-center gap-2 bg-secondary-foreground/10 border border-secondary-foreground/20 text-secondary-foreground rounded-full px-4 py-1.5 font-semibold text-sm"
              aria-label="Empresa atuando desde 2009, distribuidor oficial"
            >
              <Award className="h-4 w-4 text-accent" aria-hidden="true" />
              Desde 2009 · Distribuidor oficial
            </div>
          </div>

          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-extrabold text-secondary-foreground leading-tight mb-4">
            Bateria automotiva entregue e instalada em{" "}
            <span className="text-primary">Porto Alegre</span> em até{" "}
            <span className="text-primary">35 minutos</span>
          </h1>

          <p className="text-lg md:text-xl text-secondary-foreground/80 mb-4">
            Faça a sua encomenda <strong className="text-accent">on-line</strong>, por{" "}
            <strong className="text-accent">Telefone</strong> ou{" "}
            <strong className="text-accent">WhatsApp</strong>.
          </p>

          <div
            className="mb-6 inline-flex items-start gap-2 rounded-lg border border-primary/30 bg-primary/10 px-3 py-2 text-sm text-secondary-foreground"
            role="note"
          >
            <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0 text-primary" aria-hidden="true" />
            <span>
              <strong>Carro não pega?</strong> Evite reboque (R$ 150+) e atrasos. Resolva em 35 min.
            </span>
          </div>

          <div className="mb-6 rounded-2xl bg-card/95 p-4 shadow-lg backdrop-blur md:p-5">
            {searchActive ? (
              <Suspense
                fallback={
                  <SearchPlaceholder
                    onActivate={() => {}}
                    initialValue={initialQuery}
                    onChange={() => {}}
                  />
                }
              >
                <VehicleAutocomplete variant="inline" initialQuery={initialQuery} />
              </Suspense>
            ) : (
              <SearchPlaceholder
                onActivate={() => setSearchActive(true)}
                initialValue={initialQuery}
                onChange={setInitialQuery}
              />
            )}
          </div>

          <div ref={whatsRef} className="hidden sm:flex flex-col sm:flex-row gap-3 mb-6 min-h-[56px]">
            {whatsVisible && (
              <Suspense fallback={null}>
                <HeroWhatsButton />
              </Suspense>
            )}
          </div>

          <div className="flex items-center gap-2 text-secondary-foreground/90">
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
