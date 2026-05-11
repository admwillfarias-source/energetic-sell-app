import { lazy, Suspense, useEffect } from "react";
import { Link } from "react-router-dom";
import { CartProvider } from "@/context/CartContext";
import { Header } from "@/components/Header";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Clock, ShieldCheck, Truck, Recycle, Award, MessageCircle, Phone, MapPin, Wrench } from "lucide-react";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";
import { homepageFaqs } from "@/data/faqData";
import { stores } from "@/data/stores";
import {
  breadcrumbLd, faqLd, organizationLd, SITE_URL, PHONE_E164,
} from "@/lib/seoSchemas";
import HowItWorks from "@/components/HowItWorks";
import ManufacturerLogos from "@/components/ManufacturerLogos";

const Footer = lazy(() => import("@/components/Footer").then((m) => ({ default: m.Footer })));
const CartDrawer = lazy(() => import("@/components/CartDrawer").then((m) => ({ default: m.CartDrawer })));
const FloatingWhatsApp = lazy(() => import("@/components/FloatingWhatsApp"));

const WHATS_HREF =
  "https://wa.me/5551993199486?text=Ol%C3%A1!%20Quero%20saber%20mais%20sobre%20os%20servi%C3%A7os%20da%20AWR%20Baterias.";
const PHONE_DISPLAY = "(51) 99319-9486";

const SERVICES = [
  {
    icon: Truck,
    title: "Entrega em até 35 minutos",
    desc: "Atendimento expresso em Porto Alegre e região metropolitana, das 6h às 22h, todos os dias.",
  },
  {
    icon: Wrench,
    title: "Instalação gratuita",
    desc: "Técnico especializado faz a troca, testa o alternador e limpa os bornes — tudo no local, sem custo.",
  },
  {
    icon: ShieldCheck,
    title: "Garantia de fábrica",
    desc: "Até 24 meses para Moura, Heliar e Freedom; 18 meses para Excell. Acionamento direto pela AWR.",
  },
  {
    icon: Recycle,
    title: "Descarte ecológico",
    desc: "Recolhemos sua bateria velha e damos destinação ambientalmente correta.",
  },
  {
    icon: Award,
    title: "Distribuidor oficial",
    desc: "Revenda autorizada Moura, Heliar, Excell e Zetta desde 2009 — preço de fábrica e produto original.",
  },
  {
    icon: Clock,
    function: undefined,
    title: "Plantão 6h às 22h",
    desc: "Inclusive sábados, domingos e feriados — porque pane elétrica não escolhe hora.",
  },
];

export default function Servicos() {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  const canonical = `${SITE_URL}/servicos`;
  const title = "Serviços AWR Baterias | Entrega e instalação em 35 min em POA";
  const description =
    "Entrega e instalação gratuita de baterias automotivas em até 35 minutos em Porto Alegre e região. Garantia de fábrica, plantão 6h-22h e descarte ecológico.";

  const serviceLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    serviceType: "Entrega e instalação de baterias automotivas",
    provider: { "@type": "AutomotiveBusiness", name: "AWR Baterias", telephone: PHONE_E164 },
    areaServed: stores.map((s) => ({ "@type": "City", name: s.city })),
    offers: { "@type": "Offer", price: "0", priceCurrency: "BRL", description: "Instalação gratuita" },
  };

  const jsonLd = [
    breadcrumbLd([
      { name: "Início", url: SITE_URL },
      { name: "Serviços", url: canonical },
    ]),
    faqLd(homepageFaqs),
    organizationLd(),
    serviceLd,
  ];

  return (
    <CartProvider>
      <SEO title={title} description={description} canonical={canonical} jsonLd={jsonLd} />
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-[116px] lg:pt-16">
          {/* Hero */}
          <section className="relative bg-secondary text-secondary-foreground py-14 md:py-20">
            <div className="container mx-auto px-4">
              <div className="max-w-3xl">
                <div className="inline-flex items-center gap-2 rounded-full bg-accent/20 border border-accent/40 px-4 py-1.5 mb-4">
                  <Clock className="h-4 w-4 text-accent" />
                  <span className="text-accent font-semibold text-sm">Plantão 6h às 22h, todos os dias</span>
                </div>
                <h1 className="font-display text-3xl md:text-5xl font-extrabold leading-tight mb-4">
                  Bateria entregue e instalada em até{" "}
                  <span className="text-primary">35 minutos</span>
                </h1>
                <p className="text-lg text-secondary-foreground/85 mb-6">
                  Nossa equipe técnica vai até você em Porto Alegre e região metropolitana,
                  faz o diagnóstico do sistema elétrico e instala a bateria nova sem custo adicional.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Button asChild size="lg" className="bg-awr-green hover:bg-awr-green/90 text-awr-green-foreground font-bold">
                    <a href={WHATS_HREF} target="_top" rel="noopener noreferrer">
                      <MessageCircle className="h-5 w-5 mr-2" />
                      Chamar no WhatsApp
                    </a>
                  </Button>
                  <Button asChild size="lg" variant="outline" className="border-secondary-foreground/30 text-secondary-foreground hover:bg-secondary-foreground/10">
                    <a href={`tel:+${PHONE_E164}`}>
                      <Phone className="h-5 w-5 mr-2" />
                      {PHONE_DISPLAY}
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          </section>

          {/* Lista de serviços */}
          <section className="py-14 md:py-20">
            <div className="container mx-auto px-4">
              <div className="max-w-2xl mx-auto text-center mb-10">
                <h2 className="font-display text-2xl md:text-4xl font-extrabold text-foreground mb-3">
                  O que está incluído no seu atendimento
                </h2>
                <p className="text-muted-foreground">
                  Você paga apenas a bateria. Tudo o que vem junto é por nossa conta.
                </p>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {SERVICES.map((s) => (
                  <div
                    key={s.title}
                    className="rounded-2xl border border-border bg-card p-6 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary mb-4">
                      <s.icon className="h-6 w-6" />
                    </div>
                    <h3 className="font-display text-lg font-bold text-foreground mb-1.5">{s.title}</h3>
                    <p className="text-sm text-muted-foreground">{s.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Como funciona */}
          <HowItWorks />

          {/* Áreas de atendimento */}
          <section className="py-14 md:py-20 bg-muted/30">
            <div className="container mx-auto px-4">
              <div className="max-w-2xl mx-auto text-center mb-10">
                <h2 className="font-display text-2xl md:text-4xl font-extrabold text-foreground mb-3">
                  Onde atendemos
                </h2>
                <p className="text-muted-foreground">
                  Porto Alegre e toda a região metropolitana com entrega expressa.
                </p>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {stores.map((s) => (
                  <a
                    key={s.id}
                    href={s.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex gap-3 rounded-xl border border-border bg-card p-4 hover:border-primary transition-colors"
                  >
                    <MapPin className="h-5 w-5 shrink-0 text-primary mt-0.5" />
                    <div className="min-w-0">
                      <p className="font-semibold text-foreground text-sm leading-snug">{s.city}</p>
                      <p className="text-xs text-muted-foreground line-clamp-2">{s.address}</p>
                      <p className="text-xs text-muted-foreground mt-1">{s.hours}</p>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </section>

          {/* Marcas */}
          <section className="py-14 bg-background">
            <div className="container mx-auto px-4">
              <div className="max-w-2xl mx-auto text-center mb-8">
                <h2 className="font-display text-xl md:text-2xl font-extrabold text-foreground mb-2">
                  Marcas oficiais que distribuímos
                </h2>
                <p className="text-sm text-muted-foreground">
                  Distribuidor autorizado desde 2009. Produto original, com nota fiscal e garantia de fábrica.
                </p>
              </div>
              <ManufacturerLogos />
            </div>
          </section>

          {/* FAQ */}
          <section className="py-14 md:py-20 bg-muted/30">
            <div className="container mx-auto px-4 max-w-3xl">
              <h2 className="font-display text-2xl md:text-4xl font-extrabold text-center text-foreground mb-8">
                Perguntas frequentes
              </h2>
              <Accordion type="single" collapsible className="bg-card rounded-2xl border border-border px-2">
                {homepageFaqs.map((f, i) => (
                  <AccordionItem key={i} value={`q-${i}`} className="px-3">
                    <AccordionTrigger className="text-left font-semibold">{f.question}</AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">{f.answer}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </section>

          {/* CTA final */}
          <section className="py-14 bg-primary text-primary-foreground">
            <div className="container mx-auto px-4 text-center">
              <h2 className="font-display text-2xl md:text-3xl font-extrabold mb-3">
                Pronto para resolver agora?
              </h2>
              <p className="text-primary-foreground/90 mb-6 max-w-xl mx-auto">
                Fale com nosso atendimento e em até 35 minutos sua bateria nova está instalada.
              </p>
              <div className="flex flex-wrap gap-3 justify-center">
                <Button asChild size="lg" className="bg-awr-green hover:bg-awr-green/90 text-awr-green-foreground font-bold">
                  <a href={WHATS_HREF} target="_top" rel="noopener noreferrer">
                    <MessageCircle className="h-5 w-5 mr-2" />
                    WhatsApp
                  </a>
                </Button>
                <Button asChild size="lg" variant="secondary">
                  <Link to="/catalogo">Ver catálogo</Link>
                </Button>
              </div>
            </div>
          </section>
        </main>
        <Suspense fallback={null}>
          <Footer />
          <CartDrawer />
          <FloatingWhatsApp />
        </Suspense>
      </div>
    </CartProvider>
  );
}
