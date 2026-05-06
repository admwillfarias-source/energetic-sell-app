import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { Search, Car, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { searchVehicles, type VehicleSuggestion } from "@/lib/fitments";
import { ensureCatalogLoaded } from "@/lib/catalogStore";
import { fetchBatteriesByVehicle } from "@/lib/api/batteries";
import { looksLikeBatterySku, normalizeSku } from "@/lib/batterySku";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { markEvent } from "@/lib/perfMetrics";
import { CityDeliverySelector } from "@/components/CityDeliverySelector";

type Props = {
  variant?: "card" | "inline";
  className?: string;
  placeholder?: string;
  initialQuery?: string;
  onSelect?: () => void;
  /** "popover": dropdown absoluto (default). "list": lista renderizada inline abaixo do input. */
  suggestionsMode?: "popover" | "list";
};

export default function VehicleAutocomplete({
  variant = "card",
  className,
  placeholder = "Carro e ano (Ex: Onix 2018) ou modelo da bateria (Ex: M60GD)",
  initialQuery = "",
  onSelect,
  suggestionsMode = "popover",
}: Props) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [query, setQuery] = useState(initialQuery);
  const [open, setOpen] = useState(initialQuery.length >= 2);
  const [highlight, setHighlight] = useState(0);
  const [loading, setLoading] = useState(true);
  const [version, setVersion] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    ensureCatalogLoaded()
      .then(() => {
        setLoading(false);
        setVersion((v) => v + 1);
        markEvent("hero_search_ready");
      })
      .catch((e) => {
        console.error("Falha ao carregar catálogo", e);
        setLoading(false);
      });
    const onUpdate = () => {
      ensureCatalogLoaded().then(() => setVersion((v) => v + 1));
    };
    window.addEventListener("catalog-data-updated", onUpdate);
    return () => window.removeEventListener("catalog-data-updated", onUpdate);
  }, []);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  // Quando aberto via "primeira tecla" no Hero, focar input e posicionar cursor no fim.
  useEffect(() => {
    if (initialQuery && inputRef.current) {
      const el = inputRef.current;
      el.focus();
      const len = el.value.length;
      try {
        el.setSelectionRange(len, len);
      } catch {
        // ignore
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const suggestions = useMemo<VehicleSuggestion[]>(() => {
    if (loading) return [];
    return searchVehicles(query, suggestionsMode === "list" ? 30 : 10);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, loading, version]);

  useEffect(() => setHighlight(0), [suggestions.length]);

  const prefetchSuggestion = (s: VehicleSuggestion) => {
    if (!s.codes.length) return;
    queryClient
      .prefetchQuery({
        queryKey: ["resultado", { codes: s.codes, vehicle: s.label }],
        queryFn: () => fetchBatteriesByVehicle(s.codes, {}),
        staleTime: 5 * 60 * 1000,
      })
      .catch(() => {});
  };

  const choose = (s: VehicleSuggestion) => {
    const codes = s.codes;
    if (codes.length === 0) {
      toast({
        title: "Nenhuma bateria encontrada",
        description: `Sem aplicação cadastrada para ${s.label}.`,
      });
      return;
    }
    setQuery(s.label);
    setOpen(false);
    try {
      sessionStorage.setItem("lastVehicleSearch", s.label);
    } catch {
      // ignore
    }
    // Dispara o fetch ANTES de navegar — a página /resultado consome o cache.
    prefetchSuggestion(s);
    markEvent("result_navigate_start");
    onSelect?.();
    navigate(
      `/resultado?codes=${encodeURIComponent(codes.join(","))}&v=${encodeURIComponent(s.label)}`,
    );
  };

  const onSubmit = () => {
    if (suggestions.length > 0) {
      choose(suggestions[highlight] ?? suggestions[0]);
    } else if (looksLikeBatterySku(query)) {
      const sku = normalizeSku(query);
      toast({ title: "Buscando bateria", description: sku });
      setOpen(false);
      onSelect?.();
      navigate(`/bateria/${encodeURIComponent(sku)}`);
    } else if (query.trim().length >= 2) {
      toast({
        title: "Nada encontrado",
        description: "Digite carro+ano (ex: Onix 2016) ou o modelo da bateria (ex: M60GD).",
      });
    } else {
      toast({
        title: "Digite o veículo ou modelo",
        description: "Ex: Fiat Uno 2015 ou MF72LD.",
      });
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open || suggestions.length === 0) {
      if (e.key === "Enter") onSubmit();
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((h) => Math.min(h + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => Math.max(h - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      choose(suggestions[highlight]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  const inputBlock = (
    <div ref={containerRef} className={cn("relative", className)}>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={onKeyDown}
            placeholder={loading ? "Carregando catálogo..." : placeholder}
            disabled={loading}
            className="h-12 pl-9 text-base"
            autoComplete="off"
          />
          {loading && (
            <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
          )}
        </div>
        <Button
          size="lg"
          onClick={onSubmit}
          className="h-12 gap-2 bg-accent text-accent-foreground hover:bg-accent/90"
        >
          <Search className="h-4 w-4" />
          <span className="hidden sm:inline">Buscar</span>
        </Button>
      </div>

      {open && suggestions.length > 0 && (
        <ul
          role="listbox"
          className={cn(
            suggestionsMode === "list"
              ? "mt-3 divide-y divide-border rounded-lg border border-border bg-card text-card-foreground shadow-sm overflow-hidden"
              : "absolute z-50 mt-1 max-h-80 w-full overflow-auto rounded-lg border border-border bg-popover text-popover-foreground shadow-lg",
          )}
        >
          {suggestions.map((s, i) => {
            // Extrai período "(yStart-yEnd)" do label se existir
            const periodMatch = s.label.match(/\((\d{4})(?:-(\d{4}))?\)/);
            const period = periodMatch
              ? periodMatch[2]
                ? `${periodMatch[1]} a ${periodMatch[2]}`
                : `${periodMatch[1]}`
              : `${s.year}`;
            const initial = (s.brand[0] ?? "?").toUpperCase();
            return (
              <li
                key={`${s.brand}-${s.model}-${s.year}-${i}`}
                role="option"
                aria-selected={i === highlight}
                onMouseEnter={() => { setHighlight(i); prefetchSuggestion(s); }}
                onTouchStart={() => prefetchSuggestion(s)}
                onFocus={() => prefetchSuggestion(s)}
                onMouseDown={(e) => {
                  e.preventDefault();
                  choose(s);
                }}
                className={cn(
                  "flex cursor-pointer items-center gap-3 text-sm transition-colors",
                  suggestionsMode === "list" ? "px-4 py-3.5" : "px-3 py-2",
                  i === highlight ? "bg-accent/15" : "hover:bg-muted",
                )}
              >
                {suggestionsMode === "list" ? (
                  <span
                    aria-hidden
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary"
                  >
                    {initial}
                  </span>
                ) : (
                  <Car className="h-4 w-4 shrink-0 text-muted-foreground" />
                )}
                <div className="flex-1 min-w-0">
                  {suggestionsMode === "list" ? (
                    <div className="font-semibold leading-tight text-foreground">
                      <span className="uppercase">{s.model}</span>
                      <span className="font-normal text-muted-foreground">
                        {" "}Todos os modelos · {period}
                      </span>
                    </div>
                  ) : (
                    <>
                      <div className="font-medium">{s.label}</div>
                      <div className="text-xs text-muted-foreground">
                        {s.codes.length} código{s.codes.length > 1 ? "s" : ""} compatível
                        {s.codes.length > 1 ? "is" : ""}
                      </div>
                    </>
                  )}
                  {suggestionsMode === "list" && (
                    <div className="text-xs text-muted-foreground">{s.brand}</div>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
      {open && !loading && query.trim().length >= 2 && suggestions.length === 0 && (
        <div
          className={cn(
            suggestionsMode === "list"
              ? "mt-3 rounded-lg border border-border bg-card px-3 py-3 text-sm text-muted-foreground"
              : "absolute z-50 mt-1 w-full rounded-lg border border-border bg-popover px-3 py-2 text-sm text-muted-foreground shadow-lg",
          )}
        >
          Nenhum veículo encontrado. Tente outra grafia ou inclua o ano.
        </div>
      )}
    </div>
  );

  if (variant === "inline") return inputBlock;

  return (
    <section id="busca" className="bg-background py-12">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl rounded-2xl border border-border bg-card p-6 shadow-lg md:p-8">
          <div className="mb-6 text-center">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5">
              <Car className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold text-primary">Busca por Veículo</span>
            </div>
            <h2 className="font-display text-2xl font-extrabold text-foreground md:text-3xl">
              Encontre a bateria do seu carro
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Digite a marca, modelo e ano. Ex: <strong>Fiat Uno 2015</strong> ou{" "}
              <strong>Onix 2018</strong>.
            </p>
          </div>
          {inputBlock}
          <CityDeliverySelector className="mt-5 border-t border-border pt-5" />
        </div>
      </div>
    </section>
  );
}
