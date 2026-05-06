import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchBatteries } from "@/lib/api/batteries";
import { BatteryCard } from "./BatteryCard";
import { BatteryDetailDialog } from "./BatteryDetailDialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Battery } from "@/data/batteries";
import { Flame } from "lucide-react";
import { markEvent } from "@/lib/perfMetrics";

const BEST_SELLER_SKUS = [
  "M60AD", "M60GD", "M50ED", "MF72LD", "Z60D", "M75LD", "MF60AD",
  "EXF60DPD", "60APD", "MA70LD", "MA6D", "EXF150TD", "MA80CD", "H60DD", "H60HD",
];

export default function BestSellers() {
  const [active, setActive] = useState<Battery | null>(null);

  const { data = [], isLoading } = useQuery({
    queryKey: ["best-sellers", BEST_SELLER_SKUS],
    queryFn: () => fetchBatteries({ codes: BEST_SELLER_SKUS, perPage: 30 }),
    staleTime: 10 * 60 * 1000,
  });

  useEffect(() => {
    if (!isLoading && data.length > 0) markEvent("best_sellers_ready");
  }, [isLoading, data.length]);

  // Ordena conforme a ordem dos SKUs solicitados
  const ordered = [...data].sort((a, b) => {
    const ai = BEST_SELLER_SKUS.indexOf((a.sku ?? "").toUpperCase());
    const bi = BEST_SELLER_SKUS.indexOf((b.sku ?? "").toUpperCase());
    return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
  });

  return (
    <section
      id="mais-vendidos"
      className="py-12 md:py-16 bg-background"
      aria-labelledby="best-sellers-title"
    >
      <div className="container mx-auto px-4">
        <div className="mb-8 md:mb-10 text-center">
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

        {isLoading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-[420px] rounded-2xl" />
            ))}
          </div>
        ) : ordered.length === 0 ? null : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {ordered.map((b, i) => (
              <BatteryCard key={b.id} battery={b} onSelect={setActive} priority={i < 4} />
            ))}
          </div>
        )}
      </div>

      <BatteryDetailDialog battery={active} onOpenChange={(o) => !o && setActive(null)} />
    </section>
  );
}
