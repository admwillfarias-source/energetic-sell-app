// Builders centralizados de JSON-LD validados conforme Google Rich Results.
// - Sempre inclui @context e @type
// - Campos obrigatórios sempre preenchidos
// - Listas usam ListItem com position 1-based
// - Strings limpas (sem undefined)

export const SITE_URL = "https://awrbaterias.com.br";
export const SITE_NAME = "AWR Baterias";
export const SITE_LOGO = `${SITE_URL}/og-image.jpg`;
export const PHONE_E164 = "+5551985419143";

export type Crumb = { name: string; url: string };

export function breadcrumbLd(items: Crumb[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: c.url,
    })),
  };
}

export type Faq = { q: string; a: string };

export function faqLd(faqs: Faq[]) {
  // FAQPage exige pelo menos 1 pergunta válida
  const valid = faqs.filter((f) => f.q?.trim() && f.a?.trim());
  if (valid.length === 0) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: valid.map((f) => ({
      "@type": "Question",
      name: f.q.trim(),
      acceptedAnswer: { "@type": "Answer", text: f.a.trim() },
    })),
  };
}

export type ServedArea = { name: string; deliveryTime?: string };

/**
 * LocalBusiness com cidades atendidas e tempo de entrega.
 * areaServed inclui Place + description com tempo (Google aceita description).
 */
export function localBusinessLd(opts: {
  url: string;
  name?: string;
  city?: string;
  state?: string;
  geo?: { lat: number; lng: number };
  areas?: ServedArea[];
  priceRange?: string;
}) {
  const {
    url,
    name = SITE_NAME,
    city = "Porto Alegre",
    state = "RS",
    geo,
    areas = [],
    priceRange = "R$ 350 - R$ 2.500",
  } = opts;

  const ld: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "AutomotiveBusiness",
    "@id": `${url}#localbusiness`,
    name,
    image: SITE_LOGO,
    logo: SITE_LOGO,
    url,
    telephone: PHONE_E164,
    priceRange,
    address: {
      "@type": "PostalAddress",
      addressLocality: city,
      addressRegion: state,
      addressCountry: "BR",
    },
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: [
        "Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday",
      ],
      opens: "08:00",
      closes: "22:00",
    },
  };
  if (geo) {
    ld.geo = {
      "@type": "GeoCoordinates",
      latitude: geo.lat,
      longitude: geo.lng,
    };
  }
  if (areas.length) {
    ld.areaServed = areas.map((a) => ({
      "@type": "Place",
      name: a.name,
      ...(a.deliveryTime ? { description: `Entrega ${a.deliveryTime}` } : {}),
    }));
  }
  return ld;
}

export function organizationLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: SITE_LOGO,
    sameAs: [
      "https://www.instagram.com/awrbaterias",
      "https://www.facebook.com/awrbaterias",
    ],
    contactPoint: [{
      "@type": "ContactPoint",
      telephone: PHONE_E164,
      contactType: "customer service",
      areaServed: "BR",
      availableLanguage: ["pt-BR"],
    }],
  };
}

export type ReviewItem = { author: string; rating: number; body: string; locality?: string };

export function reviewsLd(itemName: string, reviews: ReviewItem[]) {
  const valid = reviews.filter((r) => r.author && r.body);
  if (!valid.length) return null;
  const avg = valid.reduce((s, r) => s + (r.rating || 5), 0) / valid.length;
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: itemName,
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: avg.toFixed(1),
      reviewCount: valid.length,
    },
    review: valid.map((r) => ({
      "@type": "Review",
      author: { "@type": "Person", name: r.author },
      reviewRating: { "@type": "Rating", ratingValue: r.rating || 5, bestRating: 5 },
      reviewBody: r.body,
      ...(r.locality ? { locationCreated: r.locality } : {}),
    })),
  };
}

export function articleLd(opts: {
  url: string;
  headline: string;
  description: string;
  datePublished: string;
  dateModified?: string;
  image?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    mainEntityOfPage: opts.url,
    headline: opts.headline,
    description: opts.description,
    image: opts.image || SITE_LOGO,
    datePublished: opts.datePublished,
    dateModified: opts.dateModified || opts.datePublished,
    author: { "@type": "Organization", name: SITE_NAME },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      logo: { "@type": "ImageObject", url: SITE_LOGO },
    },
  };
}

