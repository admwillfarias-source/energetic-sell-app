import { Phone, MessageCircle, Clock, CreditCard, Wrench, Gauge, Star, ChevronDown } from "lucide-react";
import { handleCallClick } from "@/lib/tracking";
import { Button } from "@/components/ui/button";
import heroBg from "@/assets/hero-bg.webp";
import heroBgSm from "@/assets/hero-bg-sm.webp";

const WHATSAPP_URL =
  "https://wa.me/5551993199486?text=Ol%C3%A1!%20Preciso%20de%20uma%20bateria.";

const badges = [
  { icon: CreditCard, text: "Pagamento na Entrega" },
  { icon: Wrench, text: "Instalação Gratuita" },
  { icon: Gauge, text: "Scanner Automotivo" },
];

export default function HeroSection() {
  return (
    <section id="inicio" className="relative min-h-[90vh] flex items-center pt-16">
      <div className="absolute inset-0 z-0">
        <picture>
          <source media="(max-width: 768px)" srcSet={heroBgSm} type="image/webp" />
          <img
            src={heroBg}
            alt="Técnico instalando bateria automotiva AWR"
            className="w-full h-full object-cover"
            width={1200}
            height={900}
            fetchPriority="high"
            decoding="sync"
          />
        </picture>
        <div className="absolute inset-0 bg-gradient-to-r from-secondary/95 via-secondary/80 to-secondary/40" />
      </div>

      <div className="container mx-auto px-4 relative z-10 py-16 md:py-24">
        <div className="max-w-2xl">
          <div
            className="inline-flex items-center gap-2 bg-accent/20 border border-accent/40 rounded-full px-4 py-1.5 mb-6"
            role="status"
          >
            <Clock className="h-4 w-4 text-accent" aria-hidden="true" />
            <span className="text-accent font-semibold text-sm">
              Porto Alegre: Plantão 6h às 22h
            </span>
          </div>

          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-extrabold text-secondary-foreground leading-tight mb-4">
            A bateria do seu carro entregue e instalada em até{" "}
            <span className="text-primary">35 minutos</span>
          </h1>

          <p className="text-lg md:text-xl text-secondary-foreground/80 mb-6">
            Marcas{" "}
            <strong className="text-accent">Moura, Heliar, Freedom, Excell, Zetta e Eletran</strong>.
            Automotiva, estacionária e ciclo profundo. Até 10x sem juros. Instalação gratuita.
          </p>

          <div className="flex flex-wrap gap-3 mb-8">
            {badges.map((b) => (
              <div
                key={b.text}
                className="flex items-center gap-2 bg-secondary/60 backdrop-blur-sm border border-border rounded-lg px-3 py-2"
              >
                <b.icon className="h-4 w-4 text-primary" />
                <span className="text-secondary-foreground text-sm font-medium">{b.text}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mb-8">
            <Button
              asChild
              size="lg"
              className="bg-awr-green hover:bg-awr-green/90 text-awr-green-foreground font-bold text-base gap-2 h-14 px-8 animate-pulse-glow"
            >
              <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="h-5 w-5" />
                Peça no WhatsApp
              </a>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-primary text-primary hover:bg-primary hover:text-primary-foreground font-bold text-base gap-2 h-14 px-8 bg-background/10 backdrop-blur"
            >
              <a
                href="tel:+555135165472"
                onClick={(event) => handleCallClick(event, "home", "hero")}
              >
                <Phone className="h-5 w-5" />
                Ligue Agora
              </a>
            </Button>
          </div>

          <div className="flex items-center gap-2 text-secondary-foreground/90">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-accent text-accent" />
              ))}
            </div>
            <span className="text-sm font-medium">1500+ clientes satisfeitos no Google</span>
          </div>

          <div className="flex flex-wrap gap-2 mt-6">
            <a
              href="#catalogo"
              className="text-sm bg-secondary-foreground/10 hover:bg-primary/20 text-secondary-foreground border border-secondary-foreground/20 rounded-full px-4 py-2.5 transition-colors"
            >
              🔍 Encontrar minha bateria
            </a>
            <a
              href="#servicos"
              className="text-sm bg-secondary-foreground/10 hover:bg-primary/20 text-secondary-foreground border border-secondary-foreground/20 rounded-full px-4 py-2.5 transition-colors"
            >
              🔧 Ver serviços
            </a>
            <a
              href="#contato"
              className="text-sm bg-secondary-foreground/10 hover:bg-primary/20 text-secondary-foreground border border-secondary-foreground/20 rounded-full px-4 py-2.5 transition-colors"
            >
              📋 Falar conosco
            </a>
          </div>
        </div>
      </div>

      <a
        href="#servicos"
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center justify-center gap-1 text-secondary-foreground/80 hover:text-primary transition-colors animate-bounce min-h-[44px] min-w-[44px]"
        aria-label="Rolar para baixo"
      >
        <span className="text-xs font-medium">Saiba mais</span>
        <ChevronDown className="h-5 w-5" />
      </a>
    </section>
  );
}
