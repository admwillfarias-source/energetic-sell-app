import { useEffect } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import { CartProvider } from "@/context/CartContext";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CartDrawer } from "@/components/CartDrawer";
import { SEO } from "@/components/SEO";
import VehicleSearch from "@/components/VehicleSearch";
import { BatteryGrid } from "@/components/BatteryGrid";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { getCityBySlug, cityPages } from "@/data/cityContent";
import { brandPages } from "@/data/brandContent";
import { amperagePages } from "@/data/amperageContent";
import { getNeighborhoodsByCity } from "@/data/neighborhoodContent";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";
import CityMap from "@/components/CityMap";
import TestimonialsSection from "@/components/TestimonialsSection";
import { getTestimonialsByCity } from "@/data/testimonials";
import {
  breadcrumbLd, faqLd, localBusinessLd, reviewsLd, SITE_URL,
} from "@/lib/seoSchemas";
import {
  MapPin, Clock, ShieldCheck, Truck, Wrench, Phone, ChevronRight, Zap,
} from "lucide-react";

const SITE = SITE_URL;
const PHONE_E164 = "+5551993199486";
const PHONE_DISPLAY = "(51) 99319-9486";

export default function City() {
  const { slug } = useParams<{ slug: string }>();
  const city = slug ? getCityBySlug(slug) : undefined;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  if (!city) return <Navigate to="/" replace />;

  const title = `Bateria Automotiva em ${city.name} ${city.state} | Entrega ${city.deliveryTime} | AWR`;
  const description = `Bateria de carro em ${city.name} com entrega e instalação ${city.deliveryTime}. Moura, Heliar, Zetta e Excell com garantia de fábrica. 10x sem juros. Atendimento 24h.`;
  const canonical = `${SITE}/baterias/${city.slug}`;

  const featuredNeighborhoods = getNeighborhoodsByCity(city.slug); // já ordenado por tempo
  const testimonials = getTestimonialsByCity(city.slug);

  const localBusiness = localBusinessLd({
    url: canonical,
    name: `AWR Baterias - ${city.name}`,
    city: city.name,
    state: city.state,
    geo: city.geo,
    areas: city.neighborhoods.map((n) => ({
      name: `${n}, ${city.name}`,
      deliveryTime: city.deliveryTime,
    })),
  });

  const faqLdObj = faqLd(city.faq);

  const breadcrumb = breadcrumbLd([
    { name: "Início", url: SITE },
    { name: `Bateria em ${city.name}`, url: canonical },
  ]);

  const reviewsLdObj = reviewsLd(
    `Bateria automotiva em ${city.name}`,
    testimonials.map((t) => ({
      author: t.author,
      rating: t.rating,
      body: t.body,
      locality: t.neighborhood ? `${t.neighborhood}, ${city.name}` : city.name,
    })),
  );

  return (
    <CartProvider>
      <SEO
        title={title}
        description={description}
        canonical={canonical}
        jsonLd={[localBusiness, faqLdObj, breadcrumb, reviewsLdObj].filter(Boolean) as Record<string, unknown>[]}
      />
      <div className="min-h-screen bg-background">
        <Header />
        <main>
          {/* Breadcrumb */}
          <nav className="container py-4 text-sm text-muted-foreground" aria-label="Breadcrumb">
            <ol className="flex flex-wrap items-center gap-1">
              <li><Link to="/" className="hover:text-foreground">Início</Link></li>
              <li><ChevronRight className="h-3.5 w-3.5" /></li>
              <li className="text-foreground font-medium">Bateria em {city.name}</li>
            </ol>
          </nav>

          {/* Hero da cidade */}
          <section className="border-b border-border bg-gradient-to-b from-muted/40 to-background">
            <div className="container py-12 md:py-16">
              <div className="grid items-center gap-10 lg:grid-cols-[1.3fr_1fr]">
                <div>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-accent-foreground">
                    <MapPin className="h-3.5 w-3.5" />
                    {city.name} • {city.state}
                  </span>
                  <h1 className="mt-4 font-display text-3xl font-extrabold leading-tight md:text-5xl">
                    Bateria Automotiva em {city.name}
                  </h1>
                  <p className="mt-4 text-lg text-muted-foreground md:text-xl">
                    {city.tagline}
                  </p>
                  <p className="mt-4 max-w-2xl text-muted-foreground">{city.intro}</p>

                  <div className="mt-6 flex flex-wrap gap-3">
                    <Button asChild size="lg" className="gap-2">
                      <a href="#catalogo">Ver baterias</a>
                    </Button>
                    <Button asChild size="lg" variant="outline" className="gap-2">
                      <a href={`https://wa.me/${PHONE_E164.replace("+","")}`} target="_blank" rel="noopener noreferrer">
                        <Phone className="h-4 w-4" />
                        WhatsApp {PHONE_DISPLAY}
                      </a>
                    </Button>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <Feature icon={<Clock className="h-5 w-5" />} title={city.deliveryTime} sub="Entrega no mesmo dia" />
                  <Feature icon={<Wrench className="h-5 w-5" />} title="Instalação grátis" sub="Técnico no local" />
                  <Feature icon={<ShieldCheck className="h-5 w-5" />} title="Garantia 24 meses" sub="Direto da fábrica" />
                  <Feature icon={<Truck className="h-5 w-5" />} title="10x sem juros" sub="Aceitamos cartão e Pix" />
                </div>
              </div>
            </div>
          </section>

          {/* Bairros prioritários — topo, ordenados por tempo */}
          {featuredNeighborhoods.length > 0 && (
            <section className="border-b border-border bg-background py-10">
              <div className="container">
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-accent">
                      <Zap className="h-3.5 w-3.5" /> Entrega expressa por bairro
                    </span>
                    <h2 className="mt-1 font-display text-xl font-bold md:text-2xl">
                      Bairros mais rápidos em {city.name}
                    </h2>
                  </div>
                  <span className="text-xs text-muted-foreground">Ordenados por tempo de entrega</span>
                </div>
                <ul className="mt-5 grid gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                  {featuredNeighborhoods.slice(0, 12).map((nb) => (
                    <li key={nb.slug}>
                      <Link
                        to={`/baterias/${city.slug}/${nb.slug}`}
                        className="group flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3 transition-colors hover:border-primary"
                      >
                        <span className="inline-flex items-center gap-2 text-sm font-semibold">
                          <MapPin className="h-4 w-4 text-primary" />
                          {nb.name}
                        </span>
                        <span className="rounded-full bg-awr-green/10 px-2 py-0.5 text-[10px] font-bold uppercase text-awr-green">
                          {nb.deliveryTime}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          )}

          {/* Busca + Catálogo */}
          <VehicleSearch />
          <BatteryGrid />

          {/* Bairros atendidos */}
          <section className="border-t border-border bg-muted/30 py-14">
            <div className="container">
              <div className="mx-auto max-w-3xl text-center">
                <h2 className="font-display text-2xl font-bold md:text-3xl">
                  Bairros atendidos em {city.name}
                </h2>
                <p className="mt-2 text-muted-foreground">
                  Cobrimos toda a região com entrega e instalação no mesmo dia.
                </p>
              </div>
              <div className="mx-auto mt-8 flex max-w-4xl flex-wrap justify-center gap-2">
                {city.neighborhoods.map((n) => (
                  <span
                    key={n}
                    className="rounded-full border border-border bg-card px-3 py-1.5 text-sm text-foreground"
                  >
                    {n}
                  </span>
                ))}
              </div>
            </div>
          </section>

          {/* Mapa */}
          <section className="border-t border-border py-12">
            <div className="container max-w-5xl">
              <h2 className="font-display text-xl font-bold md:text-2xl">
                Cobertura em {city.name}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Atendemos toda a cidade com entrega {city.deliveryTime}.
              </p>
              <div className="mt-4">
                <CityMap
                  query={`AWR Baterias ${city.name} ${city.state}`}
                  title={`Mapa AWR Baterias em ${city.name}`}
                />
              </div>
            </div>
          </section>
          <section className="py-14">
            <div className="container max-w-3xl">
              <h2 className="text-center font-display text-2xl font-bold md:text-3xl">
                Perguntas frequentes — {city.name}
              </h2>
              <Accordion type="single" collapsible className="mt-8">
                {city.faq.map((f, i) => (
                  <AccordionItem key={i} value={`item-${i}`}>
                    <AccordionTrigger className="text-left">{f.q}</AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </section>

          <TestimonialsSection city={city.name} items={testimonials} />

          {/* Links internos: cidades + marcas + categorias */}
          <section
            aria-labelledby="links-internos"
            className="border-t border-border bg-muted/30 py-14"
          >
            <div className="container">
              <h2
                id="links-internos"
                className="text-center font-display text-2xl font-bold md:text-3xl"
              >
                Explore baterias e regiões atendidas
              </h2>
              <p className="mx-auto mt-2 max-w-2xl text-center text-muted-foreground">
                Encontre rapidamente a bateria certa para o seu carro, sua marca de
                preferência ou outra cidade atendida pela AWR.
              </p>

              <div className="mx-auto mt-10 grid max-w-6xl gap-8 md:grid-cols-3">
                {/* Outras cidades */}
                <div>
                  <h3 className="mb-4 font-display text-lg font-bold">
                    Outras cidades atendidas
                  </h3>
                  <ul className="flex flex-wrap gap-2">
                    {cityPages
                      .filter((c) => c.slug !== city.slug)
                      .map((c) => (
                        <li key={c.slug}>
                          <Link
                            to={`/baterias/${c.slug}`}
                            title={`Bateria automotiva em ${c.name} — entrega ${c.deliveryTime}`}
                            className="inline-block rounded-full border border-border bg-card px-3 py-1.5 text-sm font-medium text-foreground hover:border-primary/40 hover:text-primary"
                          >
                            Bateria em {c.name}
                          </Link>
                        </li>
                      ))}
                  </ul>
                </div>

                {/* Marcas atendidas */}
                <div>
                  <h3 className="mb-4 font-display text-lg font-bold">
                    Marcas em {city.name}
                  </h3>
                  <ul className="flex flex-wrap gap-2">
                    {brandPages.map((b) => (
                      <li key={b.slug}>
                        <Link
                          to={`/baterias/marca/${b.slug}`}
                          title={`Bateria ${b.name} em ${city.name}`}
                          className="inline-block rounded-full border border-border bg-card px-3 py-1.5 text-sm font-medium text-foreground hover:border-primary/40 hover:text-primary"
                        >
                          Bateria {b.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Amperagens */}
                <div>
                  <h3 className="mb-4 font-display text-lg font-bold">
                    Baterias por amperagem
                  </h3>
                  <ul className="flex flex-wrap gap-2">
                    {amperagePages.map((a) => (
                      <li key={a.slug}>
                        <Link
                          to={`/baterias/amperagem/${a.slug}`}
                          title={`Bateria ${a.ah}Ah em ${city.name} — entrega ${city.deliveryTime}`}
                          className="inline-block rounded-full border border-border bg-card px-3 py-1.5 text-sm font-medium text-foreground hover:border-primary/40 hover:text-primary"
                        >
                          Bateria {a.ah}Ah
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <p className="mx-auto mt-10 max-w-3xl text-center text-sm text-muted-foreground">
                Veja também:{" "}
                {brandPages.slice(0, 4).map((b, i) => (
                  <span key={b.slug}>
                    <Link
                      to={`/baterias/marca/${b.slug}`}
                      className="font-medium text-foreground hover:text-primary"
                    >
                      Bateria {b.name} em {city.name}
                    </Link>
                    {i < 3 ? " · " : ""}
                  </span>
                ))}
              </p>
            </div>
          </section>
        </main>
        <Footer />
        <CartDrawer />
        <FloatingWhatsApp />
      </div>
    </CartProvider>
  );
}

function Feature({ icon, title, sub }: { icon: React.ReactNode; title: string; sub: string }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-border bg-card p-4">
      <div className="rounded-lg bg-primary/10 p-2 text-primary">{icon}</div>
      <div>
        <p className="font-display text-sm font-bold leading-tight">{title}</p>
        <p className="text-xs text-muted-foreground">{sub}</p>
      </div>
    </div>
  );
}
