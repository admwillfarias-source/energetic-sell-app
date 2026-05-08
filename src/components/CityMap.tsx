// Mapa Google embed sem API key — exibe apenas lojas físicas da AWR Baterias.
// Aceita uma lista de lojas; renderiza um iframe por loja para garantir que
// o pin no mapa corresponda exatamente ao endereço da AWR.

import type { Store } from "@/data/stores";
import { getStoresForCity, stores as ALL_STORES } from "@/data/stores";
import { MapPin } from "lucide-react";

interface Props {
  /** Lista explícita de lojas a mostrar. */
  stores?: Store[];
  /** Cidade para resolver lojas via getStoresForCity. */
  city?: string;
  /** Título base para os iframes. */
  title: string;
  /** Altura de cada iframe (px). */
  height?: number;
}

function buildEmbedSrc(store: Store): string {
  // Usa o endereço completo da loja para garantir o pin correto da AWR.
  const q = `${store.name}, ${store.address}`;
  return `https://www.google.com/maps?q=${encodeURIComponent(q)}&output=embed`;
}

export function CityMap({ stores, city, title, height = 320 }: Props) {
  const list: Store[] = stores
    ? stores
    : city
      ? getStoresForCity(city)
      : ALL_STORES;

  if (list.length === 0) return null;

  return (
    <div className="space-y-4">
      {list.map((s) => (
        <figure key={s.id} className="overflow-hidden rounded-xl border border-border bg-card">
          <iframe
            src={buildEmbedSrc(s)}
            title={`${title} — ${s.name}`}
            loading="lazy"
            decoding="async"
            referrerPolicy="no-referrer-when-downgrade"
            width="100%"
            height={height}
            className="w-full"
            style={{ height, border: 0 }}
            allowFullScreen
            {...({ fetchpriority: "low" } as Record<string, string>)}
          />
          <figcaption className="flex flex-col gap-1 p-3 text-sm">
            <span className="flex items-center gap-1.5 font-semibold">
              <MapPin className="h-4 w-4 text-primary" /> {s.name}
            </span>
            <span className="text-muted-foreground">{s.address}</span>
            <span className="text-xs text-muted-foreground">{s.hours}</span>
            <a
              href={s.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-medium text-primary hover:underline"
            >
              Ver no Google Maps →
            </a>
          </figcaption>
        </figure>
      ))}
    </div>
  );
}

export default CityMap;
