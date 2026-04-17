import { useState } from "react";
import { Search, ShieldCheck, Truck, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { carBrands, years } from "@/data/batteries";
import heroImg from "@/assets/hero-battery.jpg";
import { toast } from "@/hooks/use-toast";

export function Hero() {
  const [brand, setBrand] = useState<string>("");
  const [model, setModel] = useState<string>("");
  const [year, setYear] = useState<string>("");

  const models = carBrands.find((b) => b.name === brand)?.models ?? [];

  const onSearch = () => {
    if (!brand || !model || !year) {
      toast({
        title: "Selecione veículo, modelo e ano",
        description: "Precisamos dessas informações para encontrar a bateria certa.",
      });
      return;
    }
    toast({
      title: "Encontramos baterias para o seu veículo",
      description: `${brand} ${model} ${year} — confira o catálogo abaixo.`,
    });
    document.getElementById("catalogo")?.scrollIntoView({ behavior: "smooth" });
  };

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
              Selecione marca, modelo e ano do veículo.
            </p>

            <div className="mt-6 grid gap-3">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-muted-foreground">
                  Marca
                </label>
                <Select
                  value={brand}
                  onValueChange={(v) => {
                    setBrand(v);
                    setModel("");
                  }}
                >
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Selecione a marca" />
                  </SelectTrigger>
                  <SelectContent>
                    {carBrands.map((b) => (
                      <SelectItem key={b.name} value={b.name}>
                        {b.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-muted-foreground">
                  Modelo
                </label>
                <Select value={model} onValueChange={setModel} disabled={!brand}>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder={brand ? "Selecione o modelo" : "Escolha a marca primeiro"} />
                  </SelectTrigger>
                  <SelectContent>
                    {models.map((m) => (
                      <SelectItem key={m} value={m}>
                        {m}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-muted-foreground">
                  Ano
                </label>
                <Select value={year} onValueChange={setYear}>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Selecione o ano" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {years.map((y) => (
                      <SelectItem key={y} value={y}>
                        {y}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                size="lg"
                onClick={onSearch}
                className="mt-2 h-12 w-full gap-2 bg-accent text-accent-foreground hover:bg-accent/90"
              >
                <Search className="h-4 w-4" />
                Encontrar minha bateria
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
