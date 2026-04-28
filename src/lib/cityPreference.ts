// Persistência simples da cidade selecionada pelo usuário.
// Usada pelo seletor no buscador e pelo badge de tempo de entrega.
import { cityPages, type CityPageData } from "@/data/cityContent";

const KEY = "awr.preferredCity";

export function getPreferredCitySlug(): string | null {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

export function setPreferredCitySlug(slug: string | null) {
  try {
    if (slug) localStorage.setItem(KEY, slug);
    else localStorage.removeItem(KEY);
    window.dispatchEvent(new CustomEvent("awr-city-changed", { detail: slug }));
  } catch {
    // ignore
  }
}

export function getPreferredCity(): CityPageData | null {
  const slug = getPreferredCitySlug();
  if (!slug) return null;
  return cityPages.find((c) => c.slug === slug) ?? null;
}
