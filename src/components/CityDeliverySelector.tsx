import { useEffect, useState } from "react";
import { MapPin, Truck } from "lucide-react";
import { cityPages } from "@/data/cityContent";
import {
  getPreferredCitySlug,
  setPreferredCitySlug,
} from "@/lib/cityPreference";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/**
 * Seletor de cidade que persiste a preferência e exibe o tempo de entrega.
 * Não filtra produtos — apenas contextualiza o atendimento.
 */
export function CityDeliverySelector({ className }: { className?: string }) {
  const [slug, setSlug] = useState<string | null>(() => getPreferredCitySlug());

  useEffect(() => {
    const onChange = (e: Event) => {
      setSlug((e as CustomEvent<string | null>).detail ?? null);
    };
    window.addEventListener("awr-city-changed", onChange);
    return () => window.removeEventListener("awr-city-changed", onChange);
  }, []);

  const city = cityPages.find((c) => c.slug === slug) ?? null;

  return (
    <div className={className}>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <label className="flex items-center gap-1.5 text-sm font-medium text-foreground">
          <MapPin className="h-4 w-4 text-primary" />
          Sua cidade:
        </label>
        <Select
          value={slug ?? ""}
          onValueChange={(v) => {
            setSlug(v);
            setPreferredCitySlug(v);
          }}
        >
          <SelectTrigger className="h-10 w-full sm:w-64">
            <SelectValue placeholder="Selecione para ver o tempo de entrega" />
          </SelectTrigger>
          <SelectContent>
            {cityPages.map((c) => (
              <SelectItem key={c.slug} value={c.slug}>
                {c.name} — {c.deliveryTime}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {city && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/15 px-3 py-1.5 text-xs font-semibold text-accent-foreground">
            <Truck className="h-3.5 w-3.5" />
            Entrega em {city.deliveryTime} em {city.name}
          </span>
        )}
      </div>
    </div>
  );
}

export default CityDeliverySelector;
