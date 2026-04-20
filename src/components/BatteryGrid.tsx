import { useMemo, useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams, useNavigate } from "react-router-dom";
import { brands, amperageOptions, Battery } from "@/data/batteries";
import { fetchBatteries, fetchBatteriesByVehicle, type VehicleBrand } from "@/lib/api/batteries";
import { ensureCatalogLoaded } from "@/lib/catalogStore";
import { BatteryCard } from "./BatteryCard";
import { BatteryDetailDialog } from "./BatteryDetailDialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { SlidersHorizontal, AlertCircle, X, CarFront } from "lucide-react";

export function BatteryGrid() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const search = searchParams.get("q") ?? "";
  const codesParam = searchParams.get("codes") ?? "";
  const vehicle = searchParams.get("v") ?? "";
  const codes = useMemo(
    () => (codesParam ? codesParam.split(",").map((c) => c.trim()).filter(Boolean) : []),
    [codesParam],
  );

  const [catalogReady, setCatalogReady] = useState(false);
  useEffect(() => {
    ensureCatalogLoaded().then(() => setCatalogReady(true)).catch(() => setCatalogReady(true));
  }, []);

  const isVehicleSearch = !!vehicle && codes.length > 0;

  const { data: results = [], isLoading, isError, refetch } = useQuery({
    queryKey: ["batteries", { search, codes, vehicle: isVehicleSearch, catalogReady }],
    queryFn: () => {
      if (isVehicleSearch) {
        // ESTRITO: usar SOMENTE os códigos cadastrados no fitment da planilha.
        // NÃO expandir via tabela de equivalências (estava trazendo SKUs errados
        // em alguns veículos, ex.: Creta retornando equivalentes incorretos).
        // Cada código do fitment é buscado no WooCommerce exatamente como está.
        const groups: Partial<Record<VehicleBrand, string[]>> = {};
        return fetchBatteriesByVehicle(codes, groups);
      }
      return fetchBatteries({
        search: search || undefined,
        codes: codes.length ? codes : undefined,
        perPage: 30,
      });
    },
    enabled: !isVehicleSearch || catalogReady,
    staleTime: 5 * 60 * 1000,
  });

  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedAmps, setSelectedAmps] = useState<number[]>([]);
  const [priceMax, setPriceMax] = useState<number>(5000);
  const [active, setActive] = useState<Battery | null>(null);

  const filtered = useMemo(() => {
    const list = results.filter((b) => {
      if (selectedBrands.length && !selectedBrands.includes(b.brand)) return false;
      if (selectedAmps.length && !selectedAmps.includes(b.amperage)) return false;
      if (b.price > priceMax) return false;
      return true;
    });
    // Quando há veículo, fetchBatteriesByVehicle já devolve 1 por marca ordenado; só aplica filtros.
    return list;
  }, [results, selectedBrands, selectedAmps, priceMax]);

  const toggle = <T,>(arr: T[], v: T, set: (a: T[]) => void) =>
    set(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

  const clearAll = () => {
    setSelectedBrands([]);
    setSelectedAmps([]);
    setPriceMax(5000);
  };

  const clearVehicle = () => {
    navigate("/#catalogo");
  };

  return (
    <section id="catalogo" className="bg-background py-16 md:py-24">
      <div className="container">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-accent-foreground/70">
              Catálogo
            </span>
            <h2 className="mt-2 font-display text-3xl font-bold md:text-4xl">
              Baterias automotivas
            </h2>
            <p className="mt-2 text-muted-foreground">
              Marcas líderes com garantia de fábrica e entrega rápida.
            </p>
          </div>
          <span className="text-sm text-muted-foreground">
            {filtered.length} {filtered.length === 1 ? "produto" : "produtos"}
          </span>
        </div>

        {vehicle && (
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-accent/30 bg-accent/10 p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-accent/20 p-2">
                <CarFront className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Compatível com o seu veículo
                </p>
                <p className="font-display text-base font-bold">{vehicle}</p>
                {codes.length > 0 && (
                  <p className="text-xs text-muted-foreground">
                    Códigos: {codes.join(", ")}
                  </p>
                )}
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={clearVehicle} className="gap-1.5">
              <X className="h-4 w-4" />
              Limpar
            </Button>
          </div>
        )}

        <div className="grid gap-8">
          <div>
            {isLoading ? (
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-[420px] rounded-2xl" />
                ))}
              </div>
            ) : isError ? (
              <div className="rounded-2xl border border-dashed border-destructive/40 bg-destructive/5 p-12 text-center">
                <AlertCircle className="mx-auto mb-3 h-8 w-8 text-destructive" />
                <p className="text-muted-foreground">Não foi possível carregar as baterias.</p>
                <Button onClick={() => refetch()} variant="outline" className="mt-4">
                  Tentar novamente
                </Button>
              </div>
            ) : filtered.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border p-12 text-center">
                <p className="text-muted-foreground">Nenhuma bateria encontrada com esses filtros.</p>
                <Button onClick={clearAll} variant="outline" className="mt-4">
                  Limpar filtros
                </Button>
              </div>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {filtered.map((b) => (
                  <BatteryCard key={b.id} battery={b} onSelect={setActive} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <BatteryDetailDialog battery={active} onOpenChange={(o) => !o && setActive(null)} />
    </section>
  );
}
