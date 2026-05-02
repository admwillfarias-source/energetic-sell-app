import { useEffect, useMemo, useState } from "react";
import { Link, useParams, Navigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, CarFront, Clock, ShieldCheck, Truck, Search, MapPin, ChevronRight } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { fetchBatteriesByVehicle, type VehicleBrand } from "@/lib/api/batteries";
import { ensureCatalogLoaded } from "@/lib/catalogStore";
import { searchVehicles } from "@/lib/fitments";
import { BatteryCompactCard } from "@/components/BatteryCompactCard";
import { Battery } from "@/data/batteries";
import { CartProvider } from "@/context/CartContext";
import { CartDrawer } from "@/components/CartDrawer";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";
import { vehiclePages } from "@/data/vehicles";
import { cityPages } from "@/data/cityContent";
import { breadcrumbLd, faqLd, localBusinessLd, organizationLd, SITE_URL } from "@/lib/seoSchemas";

const formatBRL = (n: number) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0 });

const BRAND_ORDER: Record<string, number> = { moura: 0, zetta: 1, heliar: 2, excell: 3 };

export default function VehicleSeo() {
  const { slug, year } = useParams<{ slug: string; year?: string }>();
  const v = vehiclePages.find((vp) => vp.slug === slug);

  const [catalogReady, setCatalogReady] = useState(false);
  useEffect(() => { window.scrollTo(0, 0); }, [slug, year]);
  useEffect(() => {
    ensureCatalogLoaded().then(() => setCatalogReady(true)).catch(() => setCatalogReady(true));
  }, []);

  if (!v) return <Navigate to="/" replace />;

  const yearNum = year && /^(19|20)\d{2}$/.test(year) ? Number(year) : null;
  const vehicleLabel = yearNum ? `${v.make} ${v.model} ${yearNum}` : `${v.make} ${v.model}`;
  const query = yearNum ? `${v.make} ${v.model} ${yearNum}` : `${v.make} ${v.model}`;

  const codes = useMemo(() => {
    if (!catalogReady) return [];
    const sug = searchVehicles(query, 1)[0];
    return sug?.codes ?? [];
  }, [catalogReady, query]);

  const { data: results = [], isLoading, isError, refetch } = useQuery({
    queryKey: ["vehicle-seo", { slug, year, codes }],
    queryFn: () => {
      const groups: Partial<Record<VehicleBrand, string[]>> = {};
      return fetchBatteriesByVehicle(codes, groups);
    },
    enabled: catalogReady && codes.length > 0,
    staleTime: 5 * 60 * 1000,
  });

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

  const hasResults = sorted.length > 0;
  const minPrice = hasResults ? Math.min(...sorted.map((b) => b.price)) : 0;
  const maxPrice = hasResults ? Math.max(...sorted.map((b) => b.price)) : 0;
  const uniqueBrands = Array.from(new Set(sorted.map((b) => b.brand).filter(Boolean)));

  const canonical = yearNum
    ? `${SITE_URL}/baterias-para/${v.slug}/${yearNum}`
    : `${SITE_URL}/baterias-para/${v.slug}`;

  const title = `Bateria para ${vehicleLabel} — Preço${hasResults ? ` a partir de ${formatBRL(minPrice)}` : ""} e Entrega 35 min | AWR`;
  const description = hasResults
    ? `Bateria para ${vehicleLabel}: ${uniqueBrands.join(", ")}, a partir de ${formatBRL(minPrice)}. Entrega e instalação grátis em 35 min em Porto Alegre. 10x sem juros e garantia de fábrica.`
    : `Bateria para ${vehicleLabel} com entrega e instalação em até 35 min em Porto Alegre e região. Marcas Moura, Heliar, Zetta e Excell, 10x sem juros e garantia de fábrica.`;

  const faq = [
    {
      q: `Qual bateria é compatível com ${vehicleLabel}?`,
      a: `Para o ${vehicleLabel} as opções homologadas são ${uniqueBrands.length ? uniqueBrands.join(", ") : "Moura, Heliar, Zetta e Excell"}, com nota fiscal e garantia de fábrica de até 24 meses.`,
    },
    {
      q: `Quanto custa uma bateria para ${vehicleLabel}?`,
      a: hasResults
        ? `As baterias para ${vehicleLabel} custam de ${formatBRL(minPrice)} a ${formatBRL(maxPrice)}, com entrega e instalação inclusas. Aceitamos 10x sem juros no cartão.`
        : `Os preços variam conforme marca e amperagem. Fale com a gente no WhatsApp para um orçamento na hora.`,
    },
    {
      q: `Quanto tempo demora a entrega da bateria do ${vehicleLabel}?`,
      a: `Entregamos e instalamos em até 35 minutos em Porto Alegre. Em cidades da região metropolitana o tempo é de 50 a 60 minutos.`,
    },
  ];

  const jsonLd = useMemo(() => {
    const breadcrumb = breadcrumbLd([
      { name: "Início", url: SITE_URL },
      { name: `Baterias por modelo`, url: `${SITE_URL}/#catalogo` },
      { name: `Bateria para ${v.make} ${v.model}`, url: `${SITE_URL}/baterias-para/${v.slug}` },
      ...(yearNum ? [{ name: `${yearNum}`, url: canonical }] : []),
    ]);
    const itemList = hasResults ? {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: `Baterias compatíveis com ${vehicleLabel}`,
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
            "@type": "Offer", priceCurrency: "BRL", price: b.price,
            availability: "https://schema.org/InStock",
            url: b.permalink || canonical,
          },
        },
      })),
    } : null;
    const local = localBusinessLd({
      url: canonical,
      areas: cityPages.map((c) => ({ name: c.name, deliveryTime: c.deliveryTime })),
    });
    return [breadcrumb, itemList, faqLd(faq), local, organizationLd()].filter(Boolean) as Record<string, unknown>[];
  }, [hasResults, sorted, vehicleLabel, canonical, yearNum, v]);

  const ogImage = sorted[0]?.image;

  return (
    <CartProvider>
      <SEO
        title={title}
        description={description}
        canonical={canonical}
        image={ogImage}
        jsonLd={jsonLd}
        noindex={catalogReady && !isLoading && !hasResults}
      />
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 bg-muted/30 pb-12 pt-24">
          <div className="container">
            <nav aria-label="Breadcrumb" className="mb-3 text-xs text-muted-foreground md:text-sm">
              <ol className="flex flex-wrap items-center gap-1.5">
                <li><Link to="/" className="hover:text-foreground">Início</Link></li>
                <li aria-hidden><ChevronRight className="h-3 w-3 inline" /></li>
                <li><Link to="/#catalogo" className="hover:text-foreground">Baterias por modelo</Link></li>
                <li aria-hidden><ChevronRight className="h-3 w-3 inline" /></li>
                <li>
                  {yearNum ? (
                    <Link to={`/baterias-para/${v.slug}`} className="hover:text-foreground">
                      Bateria para {v.make} {v.model}
                    </Link>
                  ) : (
                    <span className="font-medium text-foreground">Bateria para {v.make} {v.model}</span>
                  )}
                </li>
                {yearNum && (
                  <>
                    <li aria-hidden><ChevronRight className="h-3 w-3 inline" /></li>
                    <li className="font-medium text-foreground">{yearNum}</li>
                  </>
                )}
              </ol>
            </nav>

            <div className="mb-4">
              <Button asChild variant="ghost" size="sm" className="h-8 gap-1 px-2">
                <Link to="/"><ArrowLeft className="h-4 w-4" /> Voltar</Link>
              </Button>
            </div>

            <div className="mb-6 rounded-2xl border border-accent/30 bg-gradient-to-br from-accent/15 via-card to-card p-5 shadow-card md:p-7">
              <div className="flex flex-wrap items-center gap-3">
                <div className="rounded-full bg-accent/20 p-2.5">
                  <CarFront className="h-5 w-5 text-accent" />
                </div>
                <div className="flex-1">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-accent">Página do modelo</p>
                  <h1 className="font-display text-xl font-extrabold leading-tight md:text-2xl">
                    Bateria para <span className="text-primary">{vehicleLabel}</span>
                  </h1>
                </div>
                <span className="text-xs text-muted-foreground">
                  {sorted.length} {sorted.length === 1 ? "opção" : "opções"}
                </span>
              </div>
              <div className="mt-4 grid grid-cols-1 gap-2 text-xs sm:grid-cols-3">
                <div className="inline-flex items-center gap-1.5 rounded-lg bg-background/60 px-3 py-2">
                  <Clock className="h-4 w-4 text-awr-green" /> <span className="font-semibold">Entrega em 35 min</span>
                </div>
                <div className="inline-flex items-center gap-1.5 rounded-lg bg-background/60 px-3 py-2">
                  <Truck className="h-4 w-4 text-primary" /> <span className="font-semibold">Instalação inclusa</span>
                </div>
                <div className="inline-flex items-center gap-1.5 rounded-lg bg-background/60 px-3 py-2">
                  <ShieldCheck className="h-4 w-4 text-primary" /> <span className="font-semibold">Garantia de fábrica</span>
                </div>
              </div>
            </div>

            {isLoading || !catalogReady ? (
              <div className="grid gap-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-44 rounded-2xl" />
                ))}
              </div>
            ) : isError ? (
              <div className="rounded-2xl border border-dashed border-destructive/40 bg-destructive/5 p-10 text-center">
                <p className="text-muted-foreground">Não foi possível carregar as baterias.</p>
                <Button onClick={() => refetch()} variant="outline" className="mt-4">Tentar novamente</Button>
              </div>
            ) : sorted.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center">
                <Search className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
                <p className="font-medium">Sem resultados automáticos para {vehicleLabel}.</p>
                <p className="mt-1 text-sm text-muted-foreground">Fale com a gente no WhatsApp para confirmação rápida.</p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {sorted.map((b, i) => (
                  <BatteryCompactCard key={b.id} battery={b} highlight={i === 0} vehicleLabel={vehicleLabel} priority={i < 4} />
                ))}
              </div>
            )}

            {hasResults && (
              <>
                <section className="mt-10 rounded-2xl border border-border bg-card p-5 md:p-7">
                  <h2 className="font-display text-lg font-bold md:text-xl">Sobre as baterias para {vehicleLabel}</h2>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">
                    Listamos {sorted.length} {sorted.length === 1 ? "bateria homologada" : "baterias homologadas"} para o{" "}
                    <strong className="text-foreground">{vehicleLabel}</strong> das marcas{" "}
                    <strong className="text-foreground">{uniqueBrands.join(", ")}</strong>. Os preços vão de{" "}
                    <strong className="text-foreground">{formatBRL(minPrice)}</strong> a{" "}
                    <strong className="text-foreground">{formatBRL(maxPrice)}</strong>, com entrega e instalação gratuitas
                    em Porto Alegre e região metropolitana.
                  </p>
                </section>

                <section className="mt-6 rounded-2xl border border-border bg-card p-5 md:p-7">
                  <h2 className="font-display text-lg font-bold md:text-xl">
                    Perguntas frequentes sobre bateria para {vehicleLabel}
                  </h2>
                  <Accordion type="single" collapsible className="mt-3">
                    {faq.map((f, i) => (
                      <AccordionItem key={i} value={`faq-${i}`}>
                        <AccordionTrigger className="text-left text-sm font-semibold md:text-base">{f.q}</AccordionTrigger>
                        <AccordionContent className="text-sm text-muted-foreground md:text-base">{f.a}</AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </section>
              </>
            )}

            {/* Anos relacionados */}
            {!yearNum && (
              <section className="mt-6 rounded-2xl border border-border bg-card p-5 md:p-7">
                <h2 className="font-display text-lg font-bold md:text-xl">Bateria para {v.make} {v.model} por ano</h2>
                <ul className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-5 md:grid-cols-8">
                  {Array.from({ length: 10 }).map((_, idx) => {
                    const y = new Date().getFullYear() - idx;
                    return (
                      <li key={y}>
                        <Link
                          to={`/baterias-para/${v.slug}/${y}`}
                          className="block rounded-lg border border-border bg-background px-3 py-2 text-center text-xs font-semibold hover:border-primary hover:text-primary"
                        >
                          {y}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </section>
            )}

            <section className="mt-6 rounded-2xl border border-border bg-card p-5 md:p-7">
              <h2 className="font-display text-lg font-bold md:text-xl">
                Atendimento de bateria para {vehicleLabel} em Porto Alegre e região
              </h2>
              <ul className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
                {cityPages.slice(0, 8).map((c) => (
                  <li key={c.slug}>
                    <Link
                      to={`/baterias/${c.slug}`}
                      className="inline-flex w-full items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-xs font-semibold hover:border-primary hover:text-primary md:text-sm"
                    >
                      <MapPin className="h-3.5 w-3.5 text-primary" /> Bateria em {c.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </main>
        <Footer />
        <CartDrawer />
        <FloatingWhatsApp />
      </div>
    </CartProvider>
  );
}
