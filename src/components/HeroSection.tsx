import { lazy, Suspense, useState, useRef, useEffect } from "react";
import { Search, Car, Clock, Star } from "lucide-react";

const VehicleAutocomplete = lazy(() => import("@/components/VehicleAutocomplete"));
const HeroWhatsButton = lazy(() => import("@/components/HeroWhatsButton"));

import heroBg from "@/assets/hero-bg.webp";
import heroBgSm from "@/assets/hero-bg-sm.webp";

function SearchPlaceholder({ onActivate }: { onActivate: () => void }) {
  return (
    <div className="flex gap-2">
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Ex: Fiat Uno 2015, Onix 2018, Corolla 2014..."
          onFocus={onActivate}
          onClick={onActivate}
          onTouchStart={onActivate}
          className="h-12 w-full rounded-md border border-input bg-background pl-9 pr-3 text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          aria-label="Buscar veículo"
        />
      </div>
      <button
        onClick={onActivate}
        className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-accent px-4 font-semibold text-accent-foreground hover:bg-accent/90"
      >
        <Car className="h-4 w-4" />
        <span className="hidden sm:inline">Buscar</span>
      </button>
    </div>
  );
}

export default function HeroSection() {
  const [searchActive, setSearchActive] = useState(false);
  const [whatsVisible, setWhatsVisible] = useState(false);
  const whatsRef = useRef<HTMLDivElement>(null);

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
          <div
            className="inline-flex items-center gap-2 bg-accent/20 border border-accent/40 rounded-full px-4 py-1.5 mb-6"
            role="status"
          >
            <Clock className="h-4 w-4 text-accent" aria-hidden="true" />
            <span className="text-accent font-semibold text-sm">
              Porto Alegre: Plantão 6h às 22h
            </span>
          </div>

          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-extrabold text-secondary-foreground leading-tight mb-4">
            A bateria do seu carro entregue e instalada em até{" "}
            <span className="text-primary">35 minutos</span>
          </h1>

          <p className="text-lg md:text-xl text-secondary-foreground/80 mb-6">
            Marcas{" "}
            <strong className="text-accent">Moura, Heliar, Freedom, Excell, Zetta e Eletran</strong>.
            Automotiva, estacionária e ciclo profundo. Até 10x sem juros.
          </p>

          <div className="mb-6 rounded-2xl bg-card/95 p-4 shadow-lg backdrop-blur md:p-5">
            {searchActive ? (
              <Suspense fallback={<SearchPlaceholder onActivate={() => {}} />}>
                <VehicleAutocomplete variant="inline" />
              </Suspense>
            ) : (
              <SearchPlaceholder onActivate={() => setSearchActive(true)} />
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
