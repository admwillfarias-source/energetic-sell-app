import { useEffect } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import { CartProvider } from "@/context/CartContext";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CartDrawer } from "@/components/CartDrawer";
import { SEO } from "@/components/SEO";
import VehicleSearch from "@/components/VehicleSearch";
import { BatteryGrid } from "@/components/BatteryGrid";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";
import CityMap from "@/components/CityMap";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  getNeighborhoodBySlug,
  getNeighborhoodsByCity,
} from "@/data/neighborhoodContent";
import { getCityBySlug } from "@/data/cityContent";
import {
  breadcrumbLd,
  faqLd,
  localBusinessLd,
  SITE_URL,
  PHONE_E164,
} from "@/lib/seoSchemas";
import { MapPin, Clock, ShieldCheck, Wrench, Phone, ChevronRight } from "lucide-react";

const PHONE_DISPLAY = "(51) 99319-9486";

export default function Neighborhood() {
  const { citySlug = "porto-alegre", slug } = useParams<{ citySlug: string; slug: string }>();
  const n = slug ? getNeighborhoodBySlug(slug, citySlug) : undefined;
  const city = getCityBySlug(citySlug);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  if (!n || !city) return <Navigate to="/" replace />;

  const canonical = `${SITE_URL}/baterias/${citySlug}/${n.slug}`;
  const title = `Bateria ${n.name} ${n.city} | Entrega ${n.deliveryTime} | AWR`;
  const description = `Bateria automotiva em ${n.name}, ${n.city}, com entrega e instalação ${n.deliveryTime}. Moura, Heliar, Zetta e Excell com garantia de fábrica. 10x sem juros, atendimento todos os dias.`;

  const faq = [
    {
      q: `Quanto tempo demora a entrega de bateria em ${n.name}?`,
      a: `Em ${n.name} a entrega e instalação são feitas em ${n.deliveryTime}, todos os dias das 8h às 22h.`,
    },
    {
      q: `A instalação está incluída em ${n.name}?`,
      a: `Sim, a instalação no ${n.name} é gratuita e feita por técnico especializado no local: residência, trabalho ou na rua.`,
    },
    {
      q: `Quais marcas de bateria atendem ${n.name}?`,
      a: `Atendemos ${n.name} com Moura, Heliar, Zetta e Excell — todas com nota fiscal e garantia de fábrica de até 24 meses.`,
    },
  ];

  const jsonLd = [
    breadcrumbLd([
      { name: "Início", url: SITE_URL },
      { name: `Bateria em ${n.city}`, url: `${SITE_URL}/baterias/${citySlug}` },
      { name: `Bateria em ${n.name}`, url: canonical },
    ]),
    localBusinessLd({
      url: canonical,
      name: `AWR Baterias - ${n.name}`,
      city: n.city,
      state: n.cityState,
      geo: n.geo,
      areas: [{ name: `${n.name}, ${n.city}`, deliveryTime: n.deliveryTime }],
    }),
    faqLd(faq),
  ];

  const otherInZone = getNeighborhoodsByCity(citySlug).filter((x) => x.slug !== n.slug);

  return (
    <CartProvider>
      <SEO title={title} description={description} canonical={canonical} jsonLd={jsonLd} />
      <div className="min-h-screen bg-background">
        <Header />
        <main>
          {/* Breadcrumb HTML */}
          <nav className="container py-4 text-sm text-muted-foreground" aria-label="Breadcrumb">
            <ol className="flex flex-wrap items-center gap-1.5">
              <li><Link to="/" className="hover:text-foreground">Início</Link></li>
              <li><ChevronRight className="h-3.5 w-3.5" /></li>
              <li>
                <Link to={`/baterias/${citySlug}`} className="hover:text-foreground">
                  Bateria em {n.city}
                </Link>
              </li>
              <li><ChevronRight className="h-3.5 w-3.5" /></li>
              <li className="text-foreground font-medium">{n.name}</li>
            </ol>
          </nav>

          {/* Hero do bairro */}
          <section className="border-b border-border bg-gradient-to-b from-muted/40 to-background">
            <div className="container py-10 md:py-14">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-accent-foreground">
                <MapPin className="h-3.5 w-3.5" />
                Zona {n.zone} • {n.city}
              </span>
              <h1 className="mt-4 font-display text-3xl font-extrabold leading-tight md:text-5xl">
                Bateria Automotiva em {n.name}
              </h1>
              <p className="mt-3 max-w-2xl text-lg text-muted-foreground">
                Entrega e instalação em <strong className="text-foreground">{n.deliveryTime}</strong> no {n.name}.
              </p>
              <p className="mt-3 max-w-3xl text-muted-foreground">{n.intro}</p>

              <div className="mt-5 flex flex-wrap gap-3">
                <Button asChild size="lg" className="gap-2">
                  <a href="#catalogo">Ver baterias</a>
                </Button>
                <Button asChild size="lg" variant="outline" className="gap-2">
                  <a href={`https://wa.me/${PHONE_E164.replace("+","")}`} target="_blank" rel="noopener noreferrer">
                    <Phone className="h-4 w-4" /> WhatsApp {PHONE_DISPLAY}
                  </a>
                </Button>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <Feature icon={<Clock className="h-5 w-5" />} title={n.deliveryTime} sub="Entrega no mesmo dia" />
                <Feature icon={<Wrench className="h-5 w-5" />} title="Instalação grátis" sub="Técnico no local" />
                <Feature icon={<ShieldCheck className="h-5 w-5" />} title="Garantia 24 meses" sub="Direto da fábrica" />
              </div>

              {n.references.length > 0 && (
                <div className="mt-6">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Referências do bairro
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {n.references.map((r) => (
                      <span key={r} className="rounded-full border border-border bg-card px-3 py-1 text-xs">
                        {r}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Busca + catálogo */}
          <VehicleSearch />
          <BatteryGrid />

          {/* Mapa do bairro */}
          <section className="border-t border-border py-12">
            <div className="container max-w-5xl">
              <h2 className="font-display text-xl font-bold md:text-2xl">
                Cobertura em {n.name}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Atendemos {n.name} e arredores em {n.deliveryTime}.
              </p>
              <div className="mt-4">
                <CityMap
                  query={`${n.name}, ${n.city}, ${n.cityState}`}
                  title={`Mapa de ${n.name}, ${n.city}`}
                  height={320}
                />
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section className="py-14">
            <div className="container max-w-3xl">
              <h2 className="text-center font-display text-2xl font-bold md:text-3xl">
                Perguntas frequentes — bateria em {n.name}
              </h2>
              <Accordion type="single" collapsible className="mt-6">
                {faq.map((f, i) => (
                  <AccordionItem key={i} value={`faq-${i}`}>
                    <AccordionTrigger className="text-left">{f.q}</AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </section>

          {/* Outros bairros — ordenados por tempo */}
          {otherInZone.length > 0 && (
            <section className="border-t border-border bg-muted/30 py-14">
              <div className="container">
                <h2 className="text-center font-display text-2xl font-bold md:text-3xl">
                  Outros bairros atendidos em {n.city}
                </h2>
                <p className="mx-auto mt-2 max-w-2xl text-center text-muted-foreground">
                  Ordenados por tempo de entrega.
                </p>
                <ul className="mx-auto mt-6 grid max-w-5xl gap-2 sm:grid-cols-2 md:grid-cols-3">
                  {otherInZone.map((nb) => (
                    <li key={nb.slug}>
                      <Link
                        to={`/baterias/${citySlug}/${nb.slug}`}
                        className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-medium hover:border-primary hover:text-primary"
                      >
                        <span className="inline-flex items-center gap-2">
                          <MapPin className="h-3.5 w-3.5 text-primary" />
                          Bateria em {nb.name}
                        </span>
                        <span className="text-xs text-muted-foreground">{nb.deliveryTime}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          )}
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
