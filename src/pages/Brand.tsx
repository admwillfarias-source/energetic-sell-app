import { useEffect } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import { CartProvider } from "@/context/CartContext";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CartDrawer } from "@/components/CartDrawer";
import { SEO } from "@/components/SEO";
import { BatteryGrid } from "@/components/BatteryGrid";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";
import { Button } from "@/components/ui/button";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";
import { getBrandBySlug, brandPages } from "@/data/brandContent";
import { cityPages } from "@/data/cityContent";
import {
  breadcrumbLd, faqLd, organizationLd, SITE_URL, PHONE_E164,
} from "@/lib/seoSchemas";
import { ChevronRight, ShieldCheck, Award, Phone, Factory } from "lucide-react";

const PHONE_DISPLAY = "(51) 99319-9486";

export default function Brand() {
  const { slug } = useParams<{ slug: string }>();
  const brand = slug ? getBrandBySlug(slug) : undefined;

  useEffect(() => { window.scrollTo(0, 0); }, [slug]);

  if (!brand) return <Navigate to="/" replace />;

  const canonical = `${SITE_URL}/baterias/marca/${brand.slug}`;
  const title = `Bateria ${brand.name} | Preço a partir de ${brand.priceRange.split(" - ")[0]} | AWR`;
  const description = `Bateria ${brand.name} com entrega e instalação grátis em Gravataí, Porto Alegre e região. ${brand.tagline} Garantia de fábrica ${brand.warranty}.`;

  const jsonLd = [
    breadcrumbLd([
      { name: "Início", url: SITE_URL },
      { name: "Marcas", url: `${SITE_URL}/baterias/marca/${brand.slug}` },
      { name: `Bateria ${brand.name}`, url: canonical },
    ]),
    faqLd(brand.faq),
    organizationLd(),
  ];

  return (
    <CartProvider>
      <SEO title={title} description={description} canonical={canonical} jsonLd={jsonLd} />
      <div className="min-h-screen bg-background">
        <Header />
        <main>
          <nav className="container py-4 text-sm text-muted-foreground" aria-label="Breadcrumb">
            <ol className="flex flex-wrap items-center gap-1.5">
              <li><Link to="/" className="hover:text-foreground">Início</Link></li>
              <li><ChevronRight className="h-3.5 w-3.5" /></li>
              <li className="text-foreground font-medium">Bateria {brand.name}</li>
            </ol>
          </nav>

          <section className="border-b border-border bg-gradient-to-b from-muted/40 to-background">
            <div className="container py-10 md:py-14">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-accent-foreground">
                <Award className="h-3.5 w-3.5" /> Marca homologada
              </span>
              <h1 className="mt-4 font-display text-3xl font-extrabold leading-tight md:text-5xl">
                Bateria {brand.name}
              </h1>
              <p className="mt-3 max-w-2xl text-lg text-muted-foreground">{brand.tagline}</p>
              <p className="mt-4 max-w-3xl text-muted-foreground">{brand.description}</p>

              <div className="mt-5 flex flex-wrap gap-3">
                <Button asChild size="lg"><a href="#catalogo">Ver baterias {brand.name}</a></Button>
                <Button asChild size="lg" variant="outline" className="gap-2">
                  <a href={`https://wa.me/${PHONE_E164.replace("+","")}`} target="_blank" rel="noopener noreferrer">
                    <Phone className="h-4 w-4" /> WhatsApp {PHONE_DISPLAY}
                  </a>
                </Button>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <Stat icon={<ShieldCheck className="h-5 w-5" />} label="Garantia" value={brand.warranty} />
                <Stat icon={<Award className="h-5 w-5" />} label="Faixa de preço" value={brand.priceRange} />
                <Stat icon={<Factory className="h-5 w-5" />} label="Origem" value={brand.origin} />
              </div>
            </div>
          </section>

          {/* Linhas */}
          <section className="border-b border-border py-12">
            <div className="container">
              <h2 className="font-display text-2xl font-bold md:text-3xl">Linhas {brand.name}</h2>
              <div className="mt-6 grid gap-4 md:grid-cols-3">
                {brand.lines.map((l) => (
                  <div key={l.name} className="rounded-xl border border-border bg-card p-5">
                    <p className="font-display text-lg font-bold">{l.name}</p>
                    <p className="mt-2 text-sm text-muted-foreground">{l.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <BatteryGrid />

          {/* FAQ */}
          <section className="py-14">
            <div className="container max-w-3xl">
              <h2 className="text-center font-display text-2xl font-bold md:text-3xl">
                Perguntas frequentes — Bateria {brand.name}
              </h2>
              <Accordion type="single" collapsible className="mt-6">
                {brand.faq.map((f, i) => (
                  <AccordionItem key={i} value={`faq-${i}`}>
                    <AccordionTrigger className="text-left">{f.q}</AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </section>

          {/* Cidades atendidas */}
          <section className="border-t border-border bg-muted/30 py-14">
            <div className="container">
              <h2 className="text-center font-display text-2xl font-bold md:text-3xl">
                Bateria {brand.name} nas cidades atendidas
              </h2>
              <ul className="mx-auto mt-6 flex max-w-4xl flex-wrap justify-center gap-2">
                {cityPages.map((c) => (
                  <li key={c.slug}>
                    <Link
                      to={`/baterias/${c.slug}`}
                      className="inline-block rounded-full border border-border bg-card px-3 py-1.5 text-sm font-medium hover:border-primary hover:text-primary"
                    >
                      Bateria {brand.name} em {c.name}
                    </Link>
                  </li>
                ))}
              </ul>

              <h3 className="mt-10 text-center font-display text-lg font-bold">Outras marcas</h3>
              <ul className="mx-auto mt-4 flex max-w-3xl flex-wrap justify-center gap-2">
                {brandPages.filter((b) => b.slug !== brand.slug).map((b) => (
                  <li key={b.slug}>
                    <Link
                      to={`/baterias/marca/${b.slug}`}
                      className="inline-block rounded-full border border-border bg-card px-3 py-1.5 text-sm hover:border-primary hover:text-primary"
                    >
                      Bateria {b.name}
                    </Link>
                  </li>
                ))}
              </ul>
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

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-border bg-card p-4">
      <div className="rounded-lg bg-primary/10 p-2 text-primary">{icon}</div>
      <div>
        <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
        <p className="font-display text-sm font-bold">{value}</p>
      </div>
    </div>
  );
}
