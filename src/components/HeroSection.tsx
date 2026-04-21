import { MessageCircle, Clock, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import VehicleAutocomplete from "@/components/VehicleAutocomplete";
import heroBg from "@/assets/hero-bg.webp";
import heroBgSm from "@/assets/hero-bg-sm.webp";

const WHATSAPP_URL =
  "https://wa.me/5551993199486?text=Ol%C3%A1!%20Solicito%20a%20minha%20bateria.";

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

      <div className="container mx-auto px-4 relative z-10 py-12 md:py-20">
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
            Automotiva, estacionária e ciclo profundo. Até 10x sem juros.
          </p>

          <div className="mb-6 rounded-2xl bg-card/95 p-4 shadow-lg backdrop-blur md:p-5">
            <VehicleAutocomplete variant="inline" />
          </div>

          <div className="hidden sm:flex flex-col sm:flex-row gap-3 mb-6">
            <Button
              asChild
              size="lg"
              className="bg-awr-green hover:bg-awr-green/90 text-awr-green-foreground font-bold text-base gap-2 h-14 px-8 animate-pulse-glow"
            >
              <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="h-5 w-5" />
                Solicite a sua bateria
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
        </div>
      </div>
    </section>
  );
}
