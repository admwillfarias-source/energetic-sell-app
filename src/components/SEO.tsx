import { useEffect } from "react";
import { Helmet } from "react-helmet-async";

type Props = {
  title: string;
  description: string;
  canonical?: string;
  jsonLd?: Record<string, unknown> | Record<string, unknown>[] | (Record<string, unknown> | null)[];
  image?: string;
  /** Override og:type. Default: website. */
  ogType?: "website" | "article" | "product";
  /** twitter:site / twitter:creator handle (com @). */
  twitterSite?: string;
  /** Set false para gerar noindex,follow. */
  noindex?: boolean;
};

const DEFAULT_OG = "https://awrbaterias.com.br/og-image.jpg";
const CANONICAL_ORIGIN = "https://awrbaterias.com.br";

/**
 * Normaliza canonical para sempre apontar ao domínio de produção
 * (awrbaterias.com.br), evitando duplicidade com previews em lovable.app.
 * - Aceita path relativo ("/foo"), URL absoluta de qualquer host, ou undefined
 *   (usa pathname atual).
 * - Sempre devolve URL absoluta no domínio canônico, sem query/hash.
 */
function normalizeCanonical(input?: string): string | undefined {
  let pathname: string | undefined;
  if (input) {
    try {
      const u = new URL(input, CANONICAL_ORIGIN);
      pathname = u.pathname;
    } catch {
      pathname = input.startsWith("/") ? input : `/${input}`;
    }
  } else if (typeof window !== "undefined") {
    pathname = window.location.pathname;
  }
  if (!pathname) return undefined;
  // Remove trailing slash duplicado, mas mantém "/" raiz.
  if (pathname.length > 1 && pathname.endsWith("/")) pathname = pathname.slice(0, -1);
  return `${CANONICAL_ORIGIN}${pathname}`;
}

export function SEO({
  title,
  description,
  canonical,
  jsonLd,
  image,
  ogType = "website",
  twitterSite = "@awrbaterias",
  noindex,
}: Props) {
  const ldArray = jsonLd
    ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd])
    : [];
  const ld = ldArray.filter((x): x is Record<string, unknown> => !!x);
  const ogImage = image || DEFAULT_OG;
  const canonicalUrl = normalizeCanonical(canonical);

  // Em iframe (WP), notifica o parent para atualizar <title>, meta description
  // e canonical do documento hospedeiro durante navegação client-side.
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.parent === window) return;
    try {
      window.parent.postMessage(
        { type: "awr:seo", title, description, canonical: canonicalUrl, ogImage },
        "*"
      );
    } catch {
      /* ignore cross-origin failures */
    }
  }, [title, description, canonicalUrl, ogImage]);

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      {noindex ? (
        <meta name="robots" content="noindex,follow" />
      ) : (
        <meta name="robots" content="index,follow,max-image-preview:large" />
      )}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}

      {/* Open Graph */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={ogType} />
      <meta property="og:site_name" content="AWR Baterias" />
      <meta property="og:locale" content="pt_BR" />
      {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:alt" content={title} />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content={twitterSite} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      <meta name="twitter:image:alt" content={title} />

      {ld.map((obj, i) => (
        <script key={i} type="application/ld+json">{JSON.stringify(obj)}</script>
      ))}
    </Helmet>
  );
}
