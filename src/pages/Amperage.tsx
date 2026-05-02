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
import { getAmperageBySlug, amperagePages } from "@/data/amperageContent";
import { cityPages } from "@/data/cityContent";
import { brandPages } from "@/data/brandContent";
import {
  breadcrumbLd, faqLd, organizationLd, SITE_URL, PHONE_E164,
} from "@/lib/seoSchemas";
import { ChevronRight, Phone, Zap, Tag } from "lucide-react";

const PHONE_DISPLAY = "(51) 99319-9486";

export default function Amperage() {
  const { ah } = useParams<{ ah: string }>();
  const data = ah ? getAmperageBySlug(ah) : undefined;

  useEffect(() => { window.scrollTo(0, 0); }, [ah]);

  if (!data) return <Navigate to="/" replace />;

  const canonical = `${SITE_URL}/baterias/amperagem/${data.slug}`;
  const title = `Bateria ${data.ah}Ah | Preço a partir de ${data.priceRange.split(" - ")[0]} | AWR`;
  const description = `Bateria ${data.ah}Ah com entrega e instalação grátis em Gravataí, Porto Alegre e região. ${data.tagline} Marcas Moura, Heliar e Zetta com garantia.`;

  const jsonLd = [
    breadcrumbLd([
      { name: "Início", url: SITE_URL },
      { name: `Bateria ${data.ah}Ah`, url: canonical },
    ]),
    faqLd(data.faq),
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
              <li className="text-foreground font-medium">Bateria {data.ah}Ah</li>
            </ol>
          </nav>

          <section className="border-b border-border bg-gradient-to-b from-muted/40 to-background">
            <div className="container py-10 md:py-14">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-accent-foreground">
                <Zap className="h-3.5 w-3.5" /> {data.ah} Amperes
              </span>
              <h1 className="mt-4 font-display text-3xl font-extrabold leading-tight md:text-5xl">
                Bateria Automotiva {data.ah}Ah
              </h1>
              <p className="mt-3 max-w-2xl text-lg text-muted-foreground">{data.tagline}</p>
              <p className="mt-4 max-w-3xl text-muted-foreground">{data.description}</p>

              <div className="mt-5 flex flex-wrap gap-3">
                <Button asChild size="lg"><a href="#catalogo">Ver baterias {data.ah}Ah</a></Button>
                <Button asChild size="lg" variant="outline" className="gap-2">
                  <a href={`https://wa.me/${PHONE_E164.replace("+","")}`} target="_blank" rel="noopener noreferrer">
                    <Phone className="h-4 w-4" /> WhatsApp {PHONE_DISPLAY}
                  </a>
                </Button>
              </div>

              <div className="mt-6 inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2">
                <Tag className="h-4 w-4 text-primary" />
                <span className="text-sm">
                  Faixa de preço: <strong>{data.priceRange}</strong>
                </span>
              </div>
            </div>
          </section>

          {/* Carros típicos */}
          <section className="border-b border-border py-10">
            <div className="container">
              <h2 className="font-display text-xl font-bold md:text-2xl">
                Carros que usam bateria {data.ah}Ah
              </h2>
              <ul className="mt-4 flex flex-wrap gap-2">
                {data.typicalCars.map((c) => (
                  <li
                    key={c}
                    className="rounded-full border border-border bg-card px-3 py-1.5 text-sm"
                  >
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <BatteryGrid />

          {/* FAQ */}
          <section className="py-14">
            <div className="container max-w-3xl">
              <h2 className="text-center font-display text-2xl font-bold md:text-3xl">
                Perguntas frequentes — Bateria {data.ah}Ah
              </h2>
              <Accordion type="single" collapsible className="mt-6">
                {data.faq.map((f, i) => (
                  <AccordionItem key={i} value={`faq-${i}`}>
                    <AccordionTrigger className="text-left">{f.q}</AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </section>

          {/* Links cruzados */}
          <section className="border-t border-border bg-muted/30 py-14">
            <div className="container">
              <h2 className="text-center font-display text-xl font-bold md:text-2xl">
                Outras amperagens
              </h2>
              <ul className="mx-auto mt-4 flex max-w-3xl flex-wrap justify-center gap-2">
                {amperagePages.filter((a) => a.slug !== data.slug).map((a) => (
                  <li key={a.slug}>
                    <Link
                      to={`/baterias/amperagem/${a.slug}`}
                      className="inline-block rounded-full border border-border bg-card px-3 py-1.5 text-sm hover:border-primary hover:text-primary"
                    >
                      Bateria {a.ah}Ah
                    </Link>
                  </li>
                ))}
              </ul>

              <h3 className="mt-10 text-center font-display text-lg font-bold">Marcas disponíveis</h3>
              <ul className="mx-auto mt-4 flex max-w-3xl flex-wrap justify-center gap-2">
                {brandPages.map((b) => (
                  <li key={b.slug}>
                    <Link
                      to={`/baterias/marca/${b.slug}`}
                      className="inline-block rounded-full border border-border bg-card px-3 py-1.5 text-sm hover:border-primary hover:text-primary"
                    >
                      Bateria {b.name} {data.ah}Ah
                    </Link>
                  </li>
                ))}
              </ul>

              <h3 className="mt-10 text-center font-display text-lg font-bold">Cidades atendidas</h3>
              <ul className="mx-auto mt-4 flex max-w-4xl flex-wrap justify-center gap-2">
                {cityPages.map((c) => (
                  <li key={c.slug}>
                    <Link
                      to={`/baterias/${c.slug}`}
                      className="inline-block rounded-full border border-border bg-card px-3 py-1.5 text-sm hover:border-primary hover:text-primary"
                    >
                      {data.ah}Ah em {c.name}
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
