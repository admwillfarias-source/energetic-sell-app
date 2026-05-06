import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchBatteries } from "@/lib/api/batteries";
import { BatteryMouraCard } from "./BatteryMouraCard";
import { BatteryDetailDialog } from "./BatteryDetailDialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Battery } from "@/data/batteries";
import { Flame, Search, Car, ChevronLeft, ChevronRight } from "lucide-react";
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

  const withSku = useMemo(
    () => data.filter((b) => !!b.sku && b.sku.trim() !== ""),
    [data],
  );

  const totalPages = Math.max(1, Math.ceil(withSku.length / PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = withSku.slice(
    (currentPage - 1) * PER_PAGE,
    currentPage * PER_PAGE,
  );

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
                  highlight={currentPage === 1 && i === 0}
                  priority={i < 4}
                />
              ))}
            </div>

            {totalPages > 1 && (
              <nav
                className="mt-8 flex flex-wrap items-center justify-center gap-2"
                aria-label="Paginação de produtos"
              >
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  aria-label="Página anterior"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                {Array.from({ length: totalPages }).map((_, idx) => {
                  const n = idx + 1;
                  return (
                    <Button
                      key={n}
                      variant={n === currentPage ? "default" : "outline"}
                      size="sm"
                      onClick={() => setPage(n)}
                      aria-current={n === currentPage ? "page" : undefined}
                      className="min-w-9"
                    >
                      {n}
                    </Button>
                  );
                })}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  aria-label="Próxima página"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </nav>
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
