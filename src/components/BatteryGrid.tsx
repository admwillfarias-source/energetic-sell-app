import { useMemo, useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams, useNavigate } from "react-router-dom";
import { brands, amperageOptions, Battery } from "@/data/batteries";
import { fetchBatteries, fetchBatteriesByVehicle } from "@/lib/api/batteries";
import { ensureCatalogLoaded } from "@/lib/catalogStore";
import { getStrictVehicleCodes, getStrictVehicleSkuMap } from "@/lib/fitments";
import { BatteryMouraCard } from "./BatteryMouraCard";
import { BatteryDetailDialog } from "./BatteryDetailDialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { SlidersHorizontal, AlertCircle, X, CarFront } from "lucide-react";
import { markEvent } from "@/lib/perfMetrics";

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

  const isVehicleSearch = !!vehicle && codes.length > 0;

  const [catalogReady, setCatalogReady] = useState(false);
  useEffect(() => {
    if (!isVehicleSearch) return;
    ensureCatalogLoaded().then(() => setCatalogReady(true)).catch(() => setCatalogReady(true));
  }, [isVehicleSearch]);

  const strictVehicleCodes = useMemo(() => {
    if (!isVehicleSearch || !catalogReady) return codes;
    const strictCodes = getStrictVehicleCodes(vehicle);
    return strictCodes.length ? strictCodes : codes;
  }, [isVehicleSearch, catalogReady, vehicle, codes]);

  const { data: results = [], isLoading, isError, refetch } = useQuery({
    queryKey: ["batteries", { search, codes: isVehicleSearch ? strictVehicleCodes : codes, vehicle: isVehicleSearch, catalogReady }],
    queryFn: () => {
      if (isVehicleSearch) {
        // ESTRITO: usa o mapa marca → SKU homologado da tabela. O resultado
        // contém UMA bateria por marca (Moura/Zetta/Heliar/Excell) cujo SKU
        // bate exatamente com o cadastrado em fitments.
        const skuMap = getStrictVehicleSkuMap(vehicle);
        return fetchBatteriesByVehicle(strictVehicleCodes, skuMap);
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

  useEffect(() => {
    if (!isLoading && results.length > 0) markEvent("battery_grid_ready");
  }, [isLoading, results.length]);

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

  const hasSearch = isVehicleSearch || codes.length > 0 || !!search;

  if (!hasSearch) {
    return null;
  }

  return (
    <section id="catalogo" className="bg-background py-8 md:py-12">
      <div className="container">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-2">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-accent-foreground/70">
              Resultado
            </span>
            <h2 className="mt-1 font-display text-xl font-bold md:text-2xl">
              Baterias compatíveis
            </h2>
          </div>
          <span className="text-xs text-muted-foreground">
            {filtered.length} {filtered.length === 1 ? "produto" : "produtos"}
          </span>
        </div>

        {vehicle && (
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-accent/30 bg-accent/10 px-3 py-2">
            <div className="flex items-center gap-2">
              <div className="rounded-full bg-accent/20 p-1.5">
                <CarFront className="h-4 w-4 text-accent" />
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Compatível com seu veículo
                </p>
                <p className="font-display text-sm font-bold leading-tight">{vehicle}</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={clearVehicle} className="h-8 gap-1 text-xs">
              <X className="h-3.5 w-3.5" />
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
              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                {filtered.map((b, i) => (
                  <BatteryMouraCard
                    key={b.id}
                    battery={b}
                    highlight={i === 0}
                    vehicleLabel={vehicle}
                    priority={i < 3}
                  />
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
