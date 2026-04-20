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
import {
  MapPin, Clock, ShieldCheck, Truck, Wrench, Phone, ChevronRight,
} from "lucide-react";

const SITE = "https://awrbaterias.com.br";
const PHONE_E164 = "+5551985419143";
const PHONE_DISPLAY = "(51) 98541-9143";

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

  const localBusiness = {
    "@context": "https://schema.org",
    "@type": "AutomotiveBusiness",
    name: `AWR Baterias - ${city.name}`,
    image: `${SITE}/og-image.jpg`,
    url: canonical,
    telephone: PHONE_E164,
    priceRange: "R$ 350 - R$ 2.500",
    address: {
      "@type": "PostalAddress",
      addressLocality: city.name,
      addressRegion: city.state,
      addressCountry: "BR",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: city.geo.lat,
      longitude: city.geo.lng,
    },
    areaServed: city.neighborhoods.map((n) => ({
      "@type": "Place",
      name: `${n}, ${city.name}`,
    })),
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"],
      opens: "08:00",
      closes: "22:00",
    },
  };

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: city.faq.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Início", item: SITE },
      {
        "@type": "ListItem", position: 2,
        name: `Bateria em ${city.name}`, item: canonical,
      },
    ],
  };

  return (
    <CartProvider>
      <SEO
        title={title}
        description={description}
        canonical={canonical}
        jsonLd={[localBusiness, faqLd, breadcrumb]}
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

          {/* FAQ */}
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

          {/* Outras cidades */}
          <section className="border-t border-border bg-muted/30 py-12">
            <div className="container">
              <h2 className="text-center font-display text-xl font-bold md:text-2xl">
                Outras cidades atendidas
              </h2>
              <div className="mx-auto mt-6 flex max-w-4xl flex-wrap justify-center gap-2">
                {cityPages.filter((c) => c.slug !== city.slug).map((c) => (
                  <Link
                    key={c.slug}
                    to={`/baterias/${c.slug}`}
                    className="rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:border-primary/40 hover:text-primary"
                  >
                    Bateria em {c.name}
                  </Link>
                ))}
              </div>
            </div>
          </section>
        </main>
        <Footer />
        <CartDrawer />
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
