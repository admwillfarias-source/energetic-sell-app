import { Search, MapPin, CheckCircle2 } from "lucide-react";

const steps = [
  { icon: Search, title: "Escolha sua bateria", desc: "Informe o modelo do seu veículo e selecione a bateria ideal." },
  { icon: MapPin, title: "Informe o endereço", desc: "Atendemos Porto Alegre e grande Porto Alegre." },
  { icon: CheckCircle2, title: "Receba e pronto", desc: "Técnico vai até você, instala e leva a bateria velha." },
];

export function HowItWorks() {
  return (
    <section id="como-funciona" className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <h2 className="font-display text-2xl md:text-3xl font-extrabold text-center mb-10">
          Simples <span className="text-primary">assim:</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {steps.map((s, i) => (
            <div key={s.title} className="relative bg-card border border-border rounded-xl p-6 text-center">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground font-extrabold text-sm shadow-md">
                {i + 1}
              </div>
              <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary mb-4 mt-2">
                <s.icon className="h-7 w-7" />
              </div>
              <h3 className="font-bold text-lg mb-2">{s.title}</h3>
              <p className="text-sm text-muted-foreground">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
