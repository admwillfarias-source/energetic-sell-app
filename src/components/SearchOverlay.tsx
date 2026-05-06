import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { Car, Truck, X, ChevronLeft, Sparkles } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import VehicleAutocomplete from "@/components/VehicleAutocomplete";
import { TOP_VEHICLES, type TopVehicle } from "@/data/topVehicles";
import { searchVehicles } from "@/lib/fitments";
import { ensureCatalogLoaded } from "@/lib/catalogStore";
import { fetchBatteriesByVehicle } from "@/lib/api/batteries";
import { toast } from "@/hooks/use-toast";
import { markEvent, measureBetween } from "@/lib/perfMetrics";
import { cn } from "@/lib/utils";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 10 }, (_, i) => CURRENT_YEAR - i);

const TRUCK_MODELS = new Set(["Strada", "Hilux"]);

export default function SearchOverlay({ open, onOpenChange }: Props) {
  const navigate = useNavigate();
  const [picked, setPicked] = useState<TopVehicle | null>(null);
  const [resolving, setResolving] = useState(false);

  useEffect(() => {
    if (open) {
      markEvent("search_overlay_opened");
      ensureCatalogLoaded().catch(() => {});
    } else {
      // reset ao fechar
      setPicked(null);
      setResolving(false);
    }
  }, [open]);

  const close = () => onOpenChange(false);

  const goWithYear = async (vehicle: TopVehicle, year: number) => {
    setResolving(true);
    try {
      await ensureCatalogLoaded();
      const query = `${vehicle.query} ${year}`;
      const results = searchVehicles(query, 1);
      const match = results[0];
      if (!match || match.codes.length === 0) {
        toast({
          title: "Sem aplicação cadastrada",
          description: `Não encontramos bateria para ${vehicle.brand} ${vehicle.model} ${year}. Tente outro ano ou digite o modelo do carro.`,
        });
        setResolving(false);
        return;
      }
      try {
        sessionStorage.setItem("lastVehicleSearch", match.label);
      } catch {
        // ignore
      }
      onOpenChange(false);
      navigate(
        `/resultado?codes=${encodeURIComponent(match.codes.join(","))}&v=${encodeURIComponent(match.label)}`,
      );
    } finally {
      setResolving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-3xl p-0 gap-0 sm:rounded-2xl max-h-[92vh] overflow-hidden flex flex-col"
        onOpenAutoFocus={(e) => {
          // Deixa o input do autocomplete cuidar do foco
          e.preventDefault();
        }}
      >
        <DialogHeader className="px-5 pt-5 pb-3 border-b border-border">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {picked && (
                <button
                  onClick={() => setPicked(null)}
                  aria-label="Voltar"
                  className="rounded-full p-1.5 hover:bg-muted"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
              )}
              <DialogTitle className="text-left font-display text-lg sm:text-xl font-extrabold">
                {picked
                  ? `Qual o ano do seu ${picked.label}?`
                  : "Encontre a bateria do seu carro"}
              </DialogTitle>
            </div>
            <button
              onClick={close}
              aria-label="Fechar busca"
              className="rounded-full p-1.5 hover:bg-muted"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <DialogDescription className="text-left text-xs text-muted-foreground">
            {picked
              ? "Escolha o ano para ver as baterias compatíveis."
              : "Digite o modelo + ano ou escolha um dos mais buscados."}
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto px-5 py-5">
          {!picked && (
            <>
              <VehicleAutocomplete
                variant="inline"
                suggestionsMode="list"
                onSelect={() => onOpenChange(false)}
              />

              <div className="mt-6">
                <div className="mb-3 flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-accent" />
                  <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    Mais buscados
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-4">
                  {TOP_VEHICLES.map((v) => {
                    const Icon = TRUCK_MODELS.has(v.model) ? Truck : Car;
                    return (
                      <button
                        key={`${v.brand}-${v.model}`}
                        onClick={() => setPicked(v)}
                        className="group flex flex-col items-center gap-2 rounded-xl border border-border bg-card p-3 text-center transition hover:border-primary hover:bg-primary/5 hover:shadow-md"
                      >
                        <Icon className="h-7 w-7 text-muted-foreground transition group-hover:text-primary" />
                        <div>
                          <div className="text-xs font-semibold leading-tight text-foreground">
                            {v.label}
                          </div>
                          <div className="text-[10px] text-muted-foreground">
                            {v.brand}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {picked && (
            <div>
              <div className="mb-4 flex items-center gap-3 rounded-xl border border-border bg-muted/40 p-3">
                {TRUCK_MODELS.has(picked.model) ? (
                  <Truck className="h-6 w-6 text-primary" />
                ) : (
                  <Car className="h-6 w-6 text-primary" />
                )}
                <div>
                  <div className="font-semibold leading-tight">{picked.brand} {picked.label}</div>
                  <div className="text-xs text-muted-foreground">Selecione o ano</div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                {YEARS.map((y) => (
                  <Button
                    key={y}
                    variant="outline"
                    disabled={resolving}
                    onClick={() => goWithYear(picked, y)}
                    className={cn(
                      "h-12 text-base font-bold hover:border-primary hover:bg-primary hover:text-primary-foreground",
                    )}
                  >
                    {y}
                  </Button>
                ))}
              </div>

              <p className="mt-4 text-center text-xs text-muted-foreground">
                Não é o ano certo?{" "}
                <button
                  onClick={() => setPicked(null)}
                  className="font-semibold text-primary underline-offset-2 hover:underline"
                >
                  Voltar e digitar o modelo
                </button>
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
