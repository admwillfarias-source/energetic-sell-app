import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchBatteries } from "@/lib/api/batteries";
import { BatteryMouraCard } from "./BatteryMouraCard";
import { BatteryDetailDialog } from "./BatteryDetailDialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Battery } from "@/data/batteries";
import { Flame, Search, Car, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { markEvent } from "@/lib/perfMetrics";
import { getPriorityBrands } from "@/lib/priorityBrands";

const SearchOverlay = lazy(() => import("@/components/SearchOverlay"));

import { useIsMobile } from "@/hooks/use-mobile";

// Ordem fixa dos modelos favoritos (definida pelo cliente)
const TOP_SKUS = [
  "M60GD","M50ED","MF72LD","Z60D","M75LD","MF60AD","EXF60DPD","MA70LD","60NPD","DF700",
  "EXF150TD","MA80CD","Z50ED","H60DD","M48FD","EXF100LE","HE50GD","H60HD","DF2000","DF1000",
  "M180BD","M100HE","HEFB72PD","M50JD","M95QD","AG60HD","EXF75ND","MF50ED","M150BD","12MN1000",
  "60APD","H75PD","Z45D","HEFB60HD","MA60AD","M80RD","AG80KD","EXF80TCD","M40SD","12MVA7",
  "M90TD","EXF180TD","EXF95MD","12MN700","M60GE","MA5D","EXF45BD","EXF95TPD","AG70PD","M70KD",
  "H48BD","MBTX30UHD","H65HD","M80CD","MA92QD","MA6D","EV12-41","12MN2500","DF4100","M40SR",
  "EV12-27","H70ND","H90LD","EXF70ND","MBTX20UHD","H40JD","MF80CD","H75LD","H95MD","M50JE",
  "EXF80TCE","EXF180SE","EXP75PSD","EGM70PD","EV12-16","AG95MD","EXF60DPE","DURAN27","EFB72PD","H90LE",
  "EXF50JD","H50JD","E100LE","EXF40JXD","E75PD","M180BE","M80RE","12MVA18","EFB60HD","EXP60DSD",
  "M220PD","MA105DD","M220PE","102000192","50APD","Z50D","M100QD","EXF95TPE","EXF40JD","MTX5L",
  "12MN3000","H180TD","12MN300","EGM60HD","MA8,6E","MTX9A","12MN1300","EGM80KD","EXF210OD","MS162",
  "12MN4100","DF500","D-1240","12MVA9","E52JD","GB12-9","12MN2000","MA18D","MA8E","MA30D",
  "MA12E","MBTZ10S","12MB105","MBTX16U","HS100LE","MTX7L","RT100LE","TERMINAL","H100LE","M48FE",
  "MBT12B4","M78LE","EXP52GSD","12MVA26","E42JD","HFB50GD","MA12D","MBTX9U","MV14E","EXP75PD",
  "12MVA12","EFB75PD","MBT9B4","MBTZ14S","Z70D","H45JE","MX10E","ERBS90E","ERPFL75D","H60DE",
  "MA9E","12MVA5","EX60DD","MA6E","2","GB12-1,3","USADAMOTO",
].map((s) => s.toUpperCase());

export default function BestSellers() {
  const isMobile = useIsMobile();
  const PER_PAGE = isMobile ? 4 : 8;
  const [active, setActive] = useState<Battery | null>(null);
  const [overlayOpen, setOverlayOpen] = useState(false);
  const [page, setPage] = useState(1);

  // Aguarda useIsMobile resolver para não disparar duas queries (uma "d", outra "m").
  const mobileResolved = typeof window !== "undefined"
    ? window.matchMedia("(max-width: 767px)").matches === isMobile
    : true;

  const { data = [], isLoading } = useQuery({
    queryKey: ["best-sellers-top-skus", isMobile ? "m" : "d"],
    queryFn: async () => {
      // Uma única chamada leve. Em mobile reduzimos ainda mais para
      // acelerar o carregamento e evitar timeouts em redes lentas.
      return fetchBatteries({ perPage: isMobile ? 30 : 60 });
    },
    enabled: mobileResolved,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });

  useEffect(() => {
    if (!isLoading && data.length > 0) markEvent("best_sellers_ready");
  }, [isLoading, data.length]);

  // Marcas priorizadas (configurável via /admin)
  const [priorityBrands, setPriorityBrandsState] = useState<string[]>(() => getPriorityBrands());

  useEffect(() => {
    const handler = () => setPriorityBrandsState(getPriorityBrands());
    window.addEventListener("priority-brands-updated", handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener("priority-brands-updated", handler);
      window.removeEventListener("storage", handler);
    };
  }, []);

  const NON_AUTOMOTIVE = ["nobreak", "moto", "motobatt", "estaciona"];
  const isAutomotive = (b: Battery) => {
    const text = `${b.brand} ${b.name} ${b.description}`.toLowerCase();
    return !NON_AUTOMOTIVE.some((kw) => text.includes(kw));
  };


  // Conjunto de SKUs realmente existentes no catálogo
  const catalogSkus = useMemo(
    () => new Set(data.map((b) => (b.sku ?? "").toUpperCase()).filter(Boolean)),
    [data],
  );

  // SKUs da lista TOP que NÃO existem no catálogo atual (WooCommerce)
  const missingTopSkus = useMemo(() => {
    if (catalogSkus.size === 0) return [];
    return TOP_SKUS.filter((s) => !catalogSkus.has(s));
  }, [catalogSkus]);

  // Lista efetiva ordenada (ignora SKUs ausentes do catálogo)
  const effectiveTopSkus = useMemo(
    () => TOP_SKUS.filter((s) => catalogSkus.has(s)),
    [catalogSkus],
  );

  useEffect(() => {
    if (missingTopSkus.length === 0) return;
    if (typeof window !== "undefined") {
      (window as any).__missingTopSkus = missingTopSkus;
      try {
        sessionStorage.setItem("missingTopSkus", JSON.stringify(missingTopSkus));
      } catch {}
      window.dispatchEvent(
        new CustomEvent("top-skus-missing", { detail: missingTopSkus }),
      );
    }
  }, [missingTopSkus]);

  const withSku = useMemo(() => {
    const list = data.filter((b) => !!b.sku && b.sku.trim() !== "");
    const isPriority = (brand: string) =>
      priorityBrands.some((p) => p.toLowerCase() === brand.toLowerCase());
    const sortByPrice = (a: Battery, b: Battery) => a.price - b.price;
    const topIndex = (sku?: string) =>
      sku ? effectiveTopSkus.indexOf(sku.toUpperCase()) : -1;

    // 0) Mais pesquisadas (ordem da lista, já filtrada pelo catálogo)
    const topMatched = list
      .filter((b) => topIndex(b.sku) >= 0)
      .sort((a, b) => topIndex(a.sku) - topIndex(b.sku));
    const rest = list.filter((b) => topIndex(b.sku) < 0);

    // 1) Automotivas + marca priorizada  2) Automotivas demais  3) Não-automotivas
    const autoPriority = rest.filter((b) => isAutomotive(b) && isPriority(b.brand)).sort(sortByPrice);
    const autoRest = rest.filter((b) => isAutomotive(b) && !isPriority(b.brand)).sort(sortByPrice);
    const nonAuto = rest.filter((b) => !isAutomotive(b)).sort(sortByPrice);
    return [...topMatched, ...autoPriority, ...autoRest, ...nonAuto];
  }, [data, priorityBrands, effectiveTopSkus]);

  const vehicleLabel =
    typeof window !== "undefined"
      ? sessionStorage.getItem("lastVehicleSearch") ?? ""
      : "";

  const visibleCount = Math.min(withSku.length, page * PER_PAGE);
  const pageItems = withSku.slice(0, visibleCount);
  const hasMore = visibleCount < withSku.length;

  return (
    <section
      id="mais-vendidos"
      className="py-12 md:py-16 bg-background"
      aria-labelledby="best-sellers-title"
    >
      <div className="container mx-auto px-4">
        <div className="mb-6 md:mb-8 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-accent-foreground">
            <Flame className="h-3.5 w-3.5 text-accent" />
            Mais vendidas
          </span>
          <h2
            id="best-sellers-title"
            className="mt-3 font-display text-2xl md:text-3xl font-extrabold"
          >
            Os modelos <span className="text-primary">favoritos</span> dos clientes
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Entrega e instalação grátis em até 35 minutos.
          </p>
        </div>

        {/* Busca por veículo */}
        <div className="mx-auto mb-8 max-w-md">
          <button
            type="button"
            onClick={() => setOverlayOpen(true)}
            className="group flex h-12 w-full items-center gap-2 rounded-md border border-input bg-card pl-3 pr-1 text-left text-base text-muted-foreground shadow-sm transition-colors hover:border-primary/50"
            aria-label="Encontre a bateria do seu carro"
          >
            <Search className="h-4 w-4 shrink-0" />
            <span className="flex-1 truncate">
              Encontre a bateria do seu carro
            </span>
            <span className="inline-flex h-10 items-center justify-center gap-1.5 rounded-md bg-primary px-4 font-bold text-primary-foreground">
              <Car className="h-4 w-4" />
              <span className="hidden sm:inline">Buscar</span>
            </span>
          </button>
        </div>

        {!isLoading && vehicleLabel && withSku.length === 0 && (
          <div className="mx-auto mb-6 max-w-md text-center text-sm">
            <p className="text-muted-foreground">
              Nenhuma bateria compatível encontrada para{" "}
              <span className="font-bold text-foreground">{vehicleLabel}</span>.{" "}
              <button
                type="button"
                onClick={() => setOverlayOpen(true)}
                className="font-semibold text-primary underline-offset-2 hover:underline"
              >
                Buscar outro veículo
              </button>
            </p>
          </div>
        )}
        {isLoading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-[420px] rounded-2xl" />
            ))}
          </div>
        ) : pageItems.length === 0 ? (
          <p className="py-12 text-center text-muted-foreground">
            Nenhuma bateria disponível no momento.
          </p>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {pageItems.map((b, i) => (
                <BatteryMouraCard
                  key={b.id}
                  battery={b}
                  highlight={i === 0}
                  priority={i < 4}
                />
              ))}
            </div>

            {hasMore && (
              <div className="mt-8 flex justify-center">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setPage((p) => p + 1)}
                  className="min-w-[180px]"
                >
                  Ver mais
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      <BatteryDetailDialog battery={active} onOpenChange={(o) => !o && setActive(null)} />

      {overlayOpen && (
        <Suspense fallback={null}>
          <SearchOverlay open={overlayOpen} onOpenChange={setOverlayOpen} />
        </Suspense>
      )}
    </section>
  );
}
