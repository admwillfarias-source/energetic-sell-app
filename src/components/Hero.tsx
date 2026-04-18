import { ShieldCheck, Truck, Wrench } from "lucide-react";
import heroImg from "@/assets/hero-battery.jpg";
import VehicleAutocomplete from "@/components/VehicleAutocomplete";

export function Hero() {
  return (
    <section id="inicio" className="relative overflow-hidden bg-gradient-hero text-primary-foreground">
      <div className="absolute inset-0 opacity-25">
        <img
          src={heroImg}
          alt="Técnico instalando bateria automotiva"
          className="h-full w-full object-cover"
          width={1600}
          height={1200}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/80 to-transparent" />
      </div>

      <div className="container relative grid gap-12 py-16 md:py-24 lg:grid-cols-2 lg:py-32">
        <div className="flex flex-col justify-center animate-fade-in-up">
          <span className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-accent/40 bg-accent/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-accent">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            Atendimento em até 2 horas
          </span>
          <h1 className="font-display text-4xl font-bold leading-[1.05] tracking-tight md:text-5xl lg:text-6xl">
            Bateria nova em casa,{" "}
            <span className="text-accent">com instalação grátis</span>
          </h1>
          <p className="mt-5 max-w-xl text-base text-primary-foreground/80 md:text-lg">
            Encontre a bateria certa para o seu carro, agende a entrega e pague na hora.
            Levamos sua bateria velha sem custo.
          </p>

          <div className="mt-8 flex flex-wrap gap-5 text-sm">
            <div className="flex items-center gap-2">
              <Wrench className="h-4 w-4 text-accent" />
              <span>Instalação no local</span>
            </div>
            <div className="flex items-center gap-2">
              <Truck className="h-4 w-4 text-accent" />
              <span>Entrega rápida</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-accent" />
              <span>Garantia de fábrica</span>
            </div>
          </div>
        </div>

        <div className="flex items-center">
          <div className="w-full rounded-2xl bg-card p-6 text-card-foreground shadow-elevated md:p-8">
            <h2 className="font-display text-xl font-bold md:text-2xl">
              Encontre a bateria do seu carro
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Digite a marca, modelo e ano. Ex: <strong>Fiat Uno 2015</strong>.
            </p>

            <div className="mt-6">
              <VehicleAutocomplete variant="inline" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
