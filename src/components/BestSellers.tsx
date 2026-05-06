import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchBatteries } from "@/lib/api/batteries";
import { BatteryMouraCard } from "./BatteryMouraCard";
import { BatteryDetailDialog } from "./BatteryDetailDialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Battery } from "@/data/batteries";
import { Flame, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { markEvent } from "@/lib/perfMetrics";

const PER_PAGE = 8;

export default function BestSellers() {
  const [active, setActive] = useState<Battery | null>(null);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  const { data = [], isLoading } = useQuery({
    queryKey: ["all-batteries"],
    queryFn: () => fetchBatteries({ perPage: 100 }),
    staleTime: 10 * 60 * 1000,
  });

  useEffect(() => {
    if (!isLoading && data.length > 0) markEvent("best_sellers_ready");
  }, [isLoading, data.length]);

  // Apenas produtos com SKU
  const withSku = useMemo(
    () => data.filter((b) => !!b.sku && b.sku.trim() !== ""),
    [data],
  );

  // Filtra por amperagem (ou termo livre)
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return withSku;
    const numMatch = q.match(/(\d{2,3})/);
    const amp = numMatch ? Number(numMatch[1]) : null;
    return withSku.filter((b) => {
      if (amp !== null && b.amperage === amp) return true;
      const hay = `${b.name} ${b.brand} ${b.sku ?? ""} ${b.amperage}ah`.toLowerCase();
      return hay.includes(q);
    });
  }, [withSku, query]);

  // Reseta página quando filtro muda
  useEffect(() => {
    setPage(1);
  }, [query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filtered.slice(
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

        {/* Busca por amperagem */}
        <div className="mx-auto mb-8 max-w-md">
          <label htmlFor="best-sellers-search" className="sr-only">
            Buscar por amperagem
          </label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="best-sellers-search"
              type="search"
              inputMode="numeric"
              placeholder="Buscar por amperagem (ex: 60, 70, 100)"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="h-11 pl-9"
            />
          </div>
          {!isLoading && (
            <p className="mt-2 text-center text-xs text-muted-foreground">
              {filtered.length} {filtered.length === 1 ? "produto" : "produtos"}
              {query && ` para "${query}"`}
            </p>
          )}
        </div>

        {isLoading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-[420px] rounded-2xl" />
            ))}
          </div>
        ) : pageItems.length === 0 ? (
          <p className="py-12 text-center text-muted-foreground">
            Nenhuma bateria encontrada para a busca.
          </p>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {pageItems.map((b, i) => (
                <BatteryMouraCard
                  key={b.id}
                  battery={b}
                  highlight={currentPage === 1 && i === 0 && !query}
                  priority={i < 4}
                />
              ))}
            </div>

            {totalPages > 1 && (
              <nav
                className="mt-8 flex items-center justify-center gap-2"
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
    </section>
  );
}
