import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, CarFront, Clock, ShieldCheck, Truck, Search, MapPin } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { fetchBatteriesByVehicle, fetchBatteries, type VehicleBrand } from "@/lib/api/batteries";
import { ensureCatalogLoaded } from "@/lib/catalogStore";
import { BatteryCompactCard } from "@/components/BatteryCompactCard";
import { Battery } from "@/data/batteries";
import { CartProvider } from "@/context/CartContext";
import { CartDrawer } from "@/components/CartDrawer";
import { cityPages } from "@/data/cityContent";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";
import {
  breadcrumbLd, faqLd, localBusinessLd, organizationLd, SITE_URL,
} from "@/lib/seoSchemas";

const formatBRL = (n: number) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0 });

export default function Resultado() {
  const [searchParams] = useSearchParams();
  const vehicle = searchParams.get("v") ?? "";
  const codesParam = searchParams.get("codes") ?? "";
  const codes = useMemo(
    () => (codesParam ? codesParam.split(",").map((c) => c.trim()).filter(Boolean) : []),
    [codesParam],
  );

  const [catalogReady, setCatalogReady] = useState(false);
  useEffect(() => {
    ensureCatalogLoaded().then(() => setCatalogReady(true)).catch(() => setCatalogReady(true));
  }, []);

  const { data: results = [], isLoading, isError, refetch } = useQuery({
    queryKey: ["resultado", { codes, vehicle }],
    queryFn: () => {
      if (vehicle && codes.length > 0) {
        const groups: Partial<Record<VehicleBrand, string[]>> = {};
        return fetchBatteriesByVehicle(codes, groups);
      }
      return fetchBatteries({ codes: codes.length ? codes : undefined, perPage: 30 });
    },
    enabled: catalogReady && codes.length > 0,
    staleTime: 5 * 60 * 1000,
  });

  // Ordena por marca (Moura, Zetta, Heliar, Excell) e depois por preço crescente
  const BRAND_ORDER: Record<string, number> = {
    moura: 0,
    zetta: 1,
    heliar: 2,
    excell: 3,
  };
  const sorted = useMemo<Battery[]>(
    () =>
      [...results].sort((a, b) => {
        const oa = BRAND_ORDER[a.brand?.toLowerCase() ?? ""] ?? 99;
        const ob = BRAND_ORDER[b.brand?.toLowerCase() ?? ""] ?? 99;
        if (oa !== ob) return oa - ob;
        return a.price - b.price;
      }),
    [results],
  );

  // ===== SEO derivado dos resultados =====
  const hasResults = sorted.length > 0;
  const minPrice = hasResults ? Math.min(...sorted.map((b) => b.price)) : 0;
  const maxPrice = hasResults ? Math.max(...sorted.map((b) => b.price)) : 0;
  const uniqueBrands = useMemo(
    () => Array.from(new Set(sorted.map((b) => b.brand).filter(Boolean))),
    [sorted],
  );
  const uniqueAmps = useMemo(
    () => Array.from(new Set(sorted.map((b) => b.amperage).filter(Boolean))).sort((a, b) => a - b),
    [sorted],
  );

  const canonical = vehicle
    ? `${SITE_URL}/resultado?v=${encodeURIComponent(vehicle)}${codes.length ? `&codes=${codes.join(",")}` : ""}`
    : `${SITE_URL}/resultado`;

  const seoTitle = vehicle
    ? `Bateria para ${vehicle} — Preço${hasResults ? ` a partir de ${formatBRL(minPrice)}` : ""} e Entrega em 35 min | AWR Baterias`
    : "Resultado da busca | AWR Baterias";

  const seoDescription = vehicle
    ? `Bateria para ${vehicle}: ${
        uniqueBrands.length ? `marcas ${uniqueBrands.join(", ")}` : "Moura, Heliar, Zetta e Excell"
      }${hasResults ? `, a partir de ${formatBRL(minPrice)}` : ""}. Entrega e instalação grátis em até 35 min em Porto Alegre e região metropolitana. 10x sem juros e garantia de fábrica.`
    : `Baterias automotivas com entrega e instalação em até 35 min em Porto Alegre. 10x sem juros, garantia de fábrica e atendimento todos os dias.`;

  const ogImage = sorted[0]?.image;

  // FAQ on-page (mesmo conteúdo do FAQPage JSON-LD)
  const faq = vehicle
    ? [
        {
          q: `Qual bateria é compatível com ${vehicle}?`,
          a: `Para o ${vehicle} as opções homologadas são ${
            uniqueBrands.length ? uniqueBrands.join(", ") : "Moura, Heliar, Zetta e Excell"
          }${
            uniqueAmps.length
              ? `, com amperagens de ${uniqueAmps.join("Ah, ")}Ah`
              : ""
          }. Todas vêm com nota fiscal e garantia de fábrica.`,
        },
        {
          q: `Quanto custa uma bateria para ${vehicle}?`,
          a: hasResults
            ? `As baterias para ${vehicle} custam de ${formatBRL(minPrice)} a ${formatBRL(maxPrice)}, com entrega e instalação inclusas. Aceitamos 10x sem juros no cartão.`
            : `Os preços das baterias para ${vehicle} variam conforme marca e amperagem. Fale com a gente no WhatsApp para um orçamento na hora.`,
        },
        {
          q: `Quanto tempo demora a entrega da bateria para ${vehicle}?`,
          a: `Entregamos e instalamos a bateria do ${vehicle} em até 35 minutos em Porto Alegre. Em cidades da região metropolitana (Canoas, Gravataí, Esteio, São Leopoldo, Novo Hamburgo e outras) o tempo é de 50 a 60 minutos.`,
        },
      ]
    : [];

  // ===== JSON-LD =====
  const jsonLd = useMemo(() => {
    if (!vehicle) return [organizationLd()];

    const breadcrumb = breadcrumbLd([
      { name: "Início", url: SITE_URL },
      { name: "Baterias", url: `${SITE_URL}/#catalogo` },
      { name: `Bateria para ${vehicle}`, url: canonical },
    ]);

    const itemList = {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: `Baterias compatíveis com ${vehicle}`,
      numberOfItems: sorted.length,
      itemListElement: sorted.map((b, i) => ({
        "@type": "ListItem",
        position: i + 1,
        item: {
          "@type": "Product",
          name: b.name,
          brand: { "@type": "Brand", name: b.brand },
          ...(b.sku ? { sku: b.sku } : {}),
          ...(b.image ? { image: b.image } : {}),
          url: b.permalink || canonical,
          offers: {
            "@type": "Offer",
            priceCurrency: "BRL",
            price: b.price,
            availability: "https://schema.org/InStock",
            url: b.permalink || canonical,
          },
        },
      })),
    };

    const faqPage = faqLd(faq);

    const localBusiness = localBusinessLd({
      url: canonical,
      city: "Porto Alegre",
      state: "RS",
      areas: cityPages.map((c) => ({ name: c.name, deliveryTime: c.deliveryTime })),
    });

    return [breadcrumb, itemList, faqPage, localBusiness, organizationLd()].filter(Boolean) as Record<string, unknown>[];
  }, [vehicle, sorted, canonical, faq]);

  // Cidades destacadas para linkagem interna
  const featuredCities = useMemo(() => cityPages.slice(0, 8), []);

  return (
    <CartProvider>
    <div className="flex min-h-screen flex-col">
      <SEO
        title={seoTitle}
        description={seoDescription}
        canonical={canonical}
        image={ogImage}
        jsonLd={jsonLd}
      />
      {/* noindex quando a busca não tem resultados, para não poluir o índice */}
      {vehicle && !isLoading && catalogReady && !hasResults && (
        <meta name="robots" content="noindex,follow" />
      )}
      <Header />

      <main className="flex-1 bg-muted/30 pb-12 pt-24">
        <div className="container">
          {/* Breadcrumb / volta */}
          <div className="mb-4 flex items-center gap-2 text-sm">
            <Button asChild variant="ghost" size="sm" className="h-8 gap-1 px-2">
              <Link to="/">
                <ArrowLeft className="h-4 w-4" />
                Voltar
              </Link>
            </Button>
          </div>

          {/* Cabeçalho */}
          <div className="mb-6 rounded-2xl border border-accent/30 bg-gradient-to-br from-accent/15 via-card to-card p-5 shadow-card md:p-7">
            <div className="flex flex-wrap items-center gap-3">
              <div className="rounded-full bg-accent/20 p-2.5">
                <CarFront className="h-5 w-5 text-accent" />
              </div>
              <div className="flex-1">
                <p className="text-[11px] font-bold uppercase tracking-wider text-accent">
                  Resultado da busca
                </p>
                <h1 className="font-display text-xl font-extrabold leading-tight md:text-2xl">
                  {vehicle ? (
                    <>
                      Bateria para <span className="text-primary">{vehicle}</span>
                    </>
                  ) : (
                    "Baterias compatíveis"
                  )}
                </h1>
              </div>
              <span className="text-xs text-muted-foreground">
                {sorted.length} {sorted.length === 1 ? "opção" : "opções"}
              </span>
            </div>

            {/* Bullets de confiança */}
            <div className="mt-4 grid grid-cols-1 gap-2 text-xs sm:grid-cols-3">
              <div className="inline-flex items-center gap-1.5 rounded-lg bg-background/60 px-3 py-2">
                <Clock className="h-4 w-4 text-awr-green" />
                <span className="font-semibold">Entrega em 35 min</span>
              </div>
              <div className="inline-flex items-center gap-1.5 rounded-lg bg-background/60 px-3 py-2">
                <Truck className="h-4 w-4 text-primary" />
                <span className="font-semibold">Instalação inclusa</span>
              </div>
              <div className="inline-flex items-center gap-1.5 rounded-lg bg-background/60 px-3 py-2">
                <ShieldCheck className="h-4 w-4 text-primary" />
                <span className="font-semibold">Garantia de fábrica</span>
              </div>
            </div>
          </div>

          {/* Lista */}
          {isLoading || !catalogReady ? (
            <div className="grid gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-44 rounded-2xl" />
              ))}
            </div>
          ) : isError ? (
            <div className="rounded-2xl border border-dashed border-destructive/40 bg-destructive/5 p-10 text-center">
              <p className="text-muted-foreground">Não foi possível carregar as baterias.</p>
              <Button onClick={() => refetch()} variant="outline" className="mt-4">
                Tentar novamente
              </Button>
            </div>
          ) : sorted.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center">
              <Search className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
              <p className="font-medium">Nenhuma bateria encontrada para essa busca.</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Tente outra grafia, inclua o ano ou fale com a gente no WhatsApp.
              </p>
              <Button asChild className="mt-4">
                <Link to="/">Nova busca</Link>
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {sorted.map((b, i) => (
                <BatteryCompactCard
                  key={b.id}
                  battery={b}
                  highlight={i === 0}
                  vehicleLabel={vehicle}
                  priority={i < 4}
                />
              ))}
            </div>
          )}

          {/* ===== Conteúdo SEO on-page ===== */}
          {vehicle && hasResults && (
            <>
              <section className="mt-10 rounded-2xl border border-border bg-card p-5 md:p-7">
                <h2 className="font-display text-lg font-bold md:text-xl">
                  Sobre as baterias para {vehicle}
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">
                  Listamos {sorted.length}{" "}
                  {sorted.length === 1 ? "bateria homologada" : "baterias homologadas"} para o{" "}
                  <strong className="text-foreground">{vehicle}</strong>
                  {uniqueBrands.length ? (
                    <>
                      {" "}das marcas <strong className="text-foreground">{uniqueBrands.join(", ")}</strong>
                    </>
                  ) : null}
                  {uniqueAmps.length ? (
                    <>
                      , com amperagens de <strong className="text-foreground">{uniqueAmps.join("Ah, ")}Ah</strong>
                    </>
                  ) : null}
                  . Os preços vão de <strong className="text-foreground">{formatBRL(minPrice)}</strong> a{" "}
                  <strong className="text-foreground">{formatBRL(maxPrice)}</strong>, sempre com
                  entrega e instalação gratuitas em Porto Alegre e região metropolitana, nota fiscal
                  e garantia de fábrica de até 24 meses.
                </p>
              </section>

              <section className="mt-6 rounded-2xl border border-border bg-card p-5 md:p-7">
                <h2 className="font-display text-lg font-bold md:text-xl">
                  Perguntas frequentes sobre bateria para {vehicle}
                </h2>
                <Accordion type="single" collapsible className="mt-3">
                  {faq.map((f, i) => (
                    <AccordionItem key={i} value={`faq-${i}`}>
                      <AccordionTrigger className="text-left text-sm font-semibold md:text-base">
                        {f.q}
                      </AccordionTrigger>
                      <AccordionContent className="text-sm text-muted-foreground md:text-base">
                        {f.a}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </section>

              <section className="mt-6 rounded-2xl border border-border bg-card p-5 md:p-7">
                <h2 className="font-display text-lg font-bold md:text-xl">
                  Atendimento de bateria para {vehicle} em Porto Alegre e região
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Entregamos a bateria do {vehicle} nas principais cidades da região metropolitana:
                </p>
                <ul className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
                  {featuredCities.map((c) => (
                    <li key={c.slug}>
                      <Link
                        to={`/baterias/${c.slug}`}
                        className="group inline-flex w-full items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-xs font-semibold transition-colors hover:border-primary hover:text-primary md:text-sm"
                      >
                        <MapPin className="h-3.5 w-3.5 text-primary" />
                        Bateria em {c.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            </>
          )}
        </div>
      </main>

      <Footer />
      <CartDrawer />
    </div>
    </CartProvider>
  );
}
