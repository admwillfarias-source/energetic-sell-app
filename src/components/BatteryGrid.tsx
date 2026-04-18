import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams, useNavigate } from "react-router-dom";
import { brands, amperageOptions, Battery } from "@/data/batteries";
import { fetchBatteries } from "@/lib/api/batteries";
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

  const { data: results = [], isLoading, isError, refetch } = useQuery({
    queryKey: ["batteries", { search, codes }],
    queryFn: () =>
      fetchBatteries({
        search: search || undefined,
        codes: codes.length ? codes : undefined,
        perPage: 30,
      }),
    staleTime: 5 * 60 * 1000,
  });

  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedAmps, setSelectedAmps] = useState<number[]>([]);
  const [priceMax, setPriceMax] = useState<number>(2000);
  const [active, setActive] = useState<Battery | null>(null);

  const filtered = useMemo(() => {
    return results.filter((b) => {
      if (selectedBrands.length && !selectedBrands.includes(b.brand)) return false;
      if (selectedAmps.length && !selectedAmps.includes(b.amperage)) return false;
      if (b.price > priceMax) return false;
      return true;
    });
  }, [results, selectedBrands, selectedAmps, priceMax]);

  const toggle = <T,>(arr: T[], v: T, set: (a: T[]) => void) =>
    set(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

  const clearAll = () => {
    setSelectedBrands([]);
    setSelectedAmps([]);
    setPriceMax(2000);
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

        <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
          <aside className="h-fit rounded-2xl border border-border bg-card p-5 shadow-card lg:sticky lg:top-20">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2 font-display text-sm font-bold">
                <SlidersHorizontal className="h-4 w-4" />
                Filtros
              </div>
              <button
                onClick={clearAll}
                className="text-xs font-medium text-muted-foreground hover:text-foreground"
              >
                Limpar
              </button>
            </div>

            <div className="mb-6">
              <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Marca
              </h4>
              <div className="space-y-2.5">
                {brands.map((b) => (
                  <label key={b} className="flex cursor-pointer items-center gap-2.5 text-sm">
                    <Checkbox
                      checked={selectedBrands.includes(b)}
                      onCheckedChange={() => toggle(selectedBrands, b, setSelectedBrands)}
                    />
                    <span>{b}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Amperagem
              </h4>
              <div className="flex flex-wrap gap-2">
                {amperageOptions.map((a) => {
                  const on = selectedAmps.includes(a);
                  return (
                    <button
                      key={a}
                      onClick={() => toggle(selectedAmps, a, setSelectedAmps)}
                      className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                        on
                          ? "border-accent bg-accent text-accent-foreground"
                          : "border-border bg-background text-muted-foreground hover:border-foreground/30"
                      }`}
                    >
                      {a}Ah
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <div className="mb-3 flex items-center justify-between">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Preço máx.
                </h4>
                <span className="text-sm font-semibold">R$ {priceMax}</span>
              </div>
              <Slider
                value={[priceMax]}
                onValueChange={(v) => setPriceMax(v[0])}
                min={300}
                max={2000}
                step={50}
              />
            </div>
          </aside>

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
