import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { Car, Truck, ChevronLeft, Sparkles, MessageCircle } from "lucide-react";
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
import { getStrictVehicleCodes, getVehicleVariants, type VehicleVariant } from "@/lib/fitments";
import { ensureCatalogLoaded } from "@/lib/catalogStore";
import { fetchBatteriesByVehicle } from "@/lib/api/batteries";
import { toast } from "@/hooks/use-toast";
import { markEvent, measureBetween } from "@/lib/perfMetrics";
import { cn } from "@/lib/utils";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Pré-preenche o campo de busca quando o overlay abre. */
  initialQuery?: string;
  /** Códigos já conhecidos (vindos de `codes` da URL ou do chip). */
  initialCodes?: string[];
  /** Quando informado, mostra um aviso "não encontramos para X" + CTA WhatsApp. */
  notFoundLabel?: string;
};

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 10 }, (_, i) => CURRENT_YEAR - i);

const TRUCK_MODELS = new Set(["Strada", "Hilux"]);

type StartStopChoice = "standard" | "start-stop";

export default function SearchOverlay({ open, onOpenChange, initialQuery, initialCodes, notFoundLabel }: Props) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [picked, setPicked] = useState<TopVehicle | null>(null);
  const [pickedYear, setPickedYear] = useState<number | null>(null);
  const [variants, setVariants] = useState<VehicleVariant[] | null>(null);
  const [notFound, setNotFound] = useState<{ year: number } | null>(null);

  // Mede latência de abertura: do clique no campo de busca até este mount.
  useEffect(() => {
    markEvent("overlay_mounted");
    measureBetween("overlay_chunk_fetch", "overlay_intent", "overlay_chunk_loaded");
    measureBetween("overlay_open_total", "overlay_intent", "overlay_mounted");
  }, []);
  const [resolving, setResolving] = useState(false);

  const buildWaUrl = (vehicleLabel: string, codes?: string[]) =>
    buildWhatsAppUrl({ vehicle: vehicleLabel, codes });

  useEffect(() => {
    if (open) {
      markEvent("search_overlay_open_start");
      ensureCatalogLoaded()
        .then(() => markEvent("search_overlay_catalog_ready"))
        .catch(() => {});
      requestAnimationFrame(() => {
        markEvent("search_overlay_visible");
        try {
          measureBetween(
            "overlay_open_ms",
            "search_overlay_open_start",
            "search_overlay_visible",
          );
        } catch {
          // ignore
        }
      });
    } else {
      setPicked(null);
      setPickedYear(null);
      setVariants(null);
      setNotFound(null);
      setResolving(false);
    }
  }, [open]);

  const finishWithCodes = (
    vehicleLabel: string,
    codes: string[],
  ) => {
    queryClient
      .prefetchQuery({
        queryKey: ["resultado", { codes, vehicle: vehicleLabel }],
        queryFn: () => fetchBatteriesByVehicle(codes, {}),
        staleTime: 5 * 60 * 1000,
      })
      .then(() => {
        markEvent("result_prefetch_done");
        try {
          measureBetween("result_load_ms", "result_navigate_start", "result_prefetch_done");
        } catch {
          // ignore
        }
      })
      .catch(() => {});

    try {
      sessionStorage.setItem("lastVehicleSearch", vehicleLabel);
    } catch {
      // ignore
    }
    onOpenChange(false);
    navigate(
      `/resultado?codes=${encodeURIComponent(codes.join(","))}&v=${encodeURIComponent(vehicleLabel)}`,
    );
  };

  const handleYearClick = async (vehicle: TopVehicle, year: number) => {
    setResolving(true);
    markEvent("result_navigate_start");
    try {
      await ensureCatalogLoaded();
      const found = getVehicleVariants(vehicle.brand, vehicle.model, year);

      if (found.length > 1) {
        // Múltiplas linhas na tabela para o ano → pedir variante.
        setPickedYear(year);
        setVariants(found);
        return;
      }

      // Apenas uma (ou nenhuma) variante na tabela para o ano.
      const codes = found[0]?.skus
        ?? vehicle.standardSkus
        ?? getStrictVehicleCodes(`${vehicle.brand} ${vehicle.model} ${year}`);

      if (!codes || codes.length === 0) {
        setPickedYear(year);
        setNotFound({ year });
        return;
      }
      const suffix = found[0]?.hasStartStop ? " Start/Stop" : "";
      finishWithCodes(`${vehicle.brand} ${vehicle.model} ${year}${suffix}`, codes);
    } finally {
      setResolving(false);
    }
  };

  const chooseVariant = (variant: VehicleVariant) => {
    if (!picked || pickedYear === null) return;
    const label = `${picked.brand} ${picked.model} ${pickedYear} ${variant.variantLabel}`.trim();
    finishWithCodes(label, variant.skus);
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
              {notFoundLabel && (
                <div className="mb-4 rounded-xl border border-primary/30 bg-primary/5 p-3">
                  <p className="text-sm font-semibold text-foreground">
                    Não encontramos uma bateria homologada para{" "}
                    <span className="text-primary">{notFoundLabel}</span>.
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Refine a busca abaixo ou fale agora com um especialista.
                  </p>
                  <a
                    href={buildWaUrl(notFoundLabel, initialCodes)}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => onOpenChange(false)}
                    className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:brightness-110"
                  >
                    <MessageCircle className="h-4 w-4" />
                    Falar no WhatsApp sobre {notFoundLabel}
                  </a>
                </div>
              )}

              <VehicleAutocomplete
                variant="inline"
                suggestionsMode="list"
                placeholder="Carro e ano (Ex: Onix 2018)"
                initialQuery={initialQuery ?? notFoundLabel ?? ""}
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

          {picked && pickedYear === null && (
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
                    onClick={() => handleYearClick(picked, y)}
                    className={cn(
                      "h-12 text-base font-bold hover:border-primary hover:bg-primary hover:text-primary-foreground",
                    )}
                  >
                    {y}
                  </Button>
                ))}
              </div>

              <p className="mt-3 text-center text-xs text-muted-foreground">
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

          {picked && pickedYear !== null && variants && variants.length > 0 && (
            <div>
              <div className="mb-4 flex items-center gap-3 rounded-xl border border-border bg-muted/40 p-3">
                {TRUCK_MODELS.has(picked.model) ? (
                  <Truck className="h-6 w-6 text-primary" />
                ) : (
                  <Car className="h-6 w-6 text-primary" />
                )}
                <div>
                  <div className="font-semibold leading-tight">
                    {picked.brand} {picked.label} {pickedYear}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Selecione a versão do seu veículo
                  </div>
                </div>
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                {variants.map((v, i) => (
                  <Button
                    key={i}
                    variant="outline"
                    disabled={resolving}
                    onClick={() => chooseVariant(v)}
                    className="h-auto min-h-14 flex-col gap-0.5 py-2 text-left hover:border-primary hover:bg-primary hover:text-primary-foreground"
                  >
                    <span className="w-full text-sm font-bold leading-tight">
                      {v.variantLabel}
                    </span>
                    {v.hasStartStop && (
                      <span className="w-full text-[11px] opacity-80">
                        Bateria EFB/AGM (Start/Stop)
                      </span>
                    )}
                  </Button>
                ))}
              </div>

              <p className="mt-3 text-center text-xs text-muted-foreground">
                <button
                  onClick={() => {
                    setPickedYear(null);
                    setVariants(null);
                  }}
                  className="font-semibold text-primary underline-offset-2 hover:underline"
                >
                  ← Trocar o ano
                </button>
              </p>
            </div>
          )}

          {picked && notFound && (
            <div>
              <div className="mb-4 rounded-xl border border-border bg-muted/40 p-4 text-center">
                <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  {TRUCK_MODELS.has(picked.model) ? (
                    <Truck className="h-6 w-6 text-primary" />
                  ) : (
                    <Car className="h-6 w-6 text-primary" />
                  )}
                </div>
                <div className="font-semibold">
                  Não encontramos a bateria para
                </div>
                <div className="text-sm text-muted-foreground">
                  {picked.brand} {picked.label} {notFound.year}
                </div>
              </div>

              <p className="mb-3 text-center text-sm text-muted-foreground">
                Fale agora com um especialista no WhatsApp e receba a indicação certa em minutos.
              </p>

              <a
                href={buildWaUrl(`${picked.brand} ${picked.label} ${notFound.year}`)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => onOpenChange(false)}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] px-4 py-3 text-base font-bold text-white shadow-md transition hover:brightness-110"
              >
                <MessageCircle className="h-5 w-5" />
                Tirar dúvida no WhatsApp
              </a>

              <p className="mt-3 text-center text-xs text-muted-foreground">
                <button
                  onClick={() => {
                    setPickedYear(null);
                    setNotFound(null);
                  }}
                  className="font-semibold text-primary underline-offset-2 hover:underline"
                >
                  ← Trocar o ano
                </button>
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
