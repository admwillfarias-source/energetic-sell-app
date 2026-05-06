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

const SearchOverlay = lazy(() => import("@/components/SearchOverlay"));

import { useIsMobile } from "@/hooks/use-mobile";

export default function BestSellers() {
  const isMobile = useIsMobile();
  const PER_PAGE = isMobile ? 4 : 8;
  const [active, setActive] = useState<Battery | null>(null);
  const [overlayOpen, setOverlayOpen] = useState(false);
  const [page, setPage] = useState(1);

  const { data = [], isLoading } = useQuery({
    queryKey: ["all-batteries"],
    queryFn: () => fetchBatteries({ perPage: 100 }),
    staleTime: 10 * 60 * 1000,
  });

  useEffect(() => {
    if (!isLoading && data.length > 0) markEvent("best_sellers_ready");
  }, [isLoading, data.length]);

  // Ordem de prioridade por amperagem solicitada pelo cliente
  const AMP_ORDER = [
    60, 40, 50, 45, 48, 72, 70, 75, 78, 80, 90, 95, 100, 150, 180, 200, 210, 220,
  ];

  const withSku = useMemo(() => {
    const list = data.filter((b) => !!b.sku && b.sku.trim() !== "");
    const rank = (amp: number) => {
      const i = AMP_ORDER.indexOf(amp);
      return i === -1 ? AMP_ORDER.length + amp : i;
    };
    return [...list].sort((a, b) => {
      const ra = rank(a.amperage);
      const rb = rank(b.amperage);
      if (ra !== rb) return ra - rb;
      return b.price - a.price;
    });
  }, [data]);

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

        {!isLoading && (
          <div className="mx-auto mb-6 max-w-md text-center text-sm">
            {vehicleLabel ? (
              withSku.length > 0 ? (
                <p className="text-foreground">
                  <span className="font-bold text-primary">{withSku.length}</span>{" "}
                  {withSku.length === 1 ? "bateria compatível" : "baterias compatíveis"} para{" "}
                  <span className="font-bold">{vehicleLabel}</span>
                </p>
              ) : (
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
              )
            ) : (
              <p className="text-muted-foreground">
                <span className="font-bold text-foreground">{withSku.length}</span> modelos
                disponíveis · busque pelo seu carro acima
              </p>
            )}
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
