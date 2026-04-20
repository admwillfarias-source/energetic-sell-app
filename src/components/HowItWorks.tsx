import { Search, MessageCircle, Truck, Wrench } from "lucide-react";

const steps = [
  { icon: Search, title: "Escolha sua bateria", desc: "Use o catálogo ou informe seu carro." },
  { icon: MessageCircle, title: "Confirme no WhatsApp", desc: "Atendimento rápido e sem burocracia." },
  { icon: Truck, title: "Entrega em até 35 min", desc: "Plantão das 6h às 22h em Porto Alegre." },
  { icon: Wrench, title: "Instalação gratuita", desc: "Técnico especializado no local." },
];

export function HowItWorks() {
  return (
    <section id="como-funciona" className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <h2 className="font-display text-3xl md:text-4xl font-extrabold text-center mb-12">
          Como <span className="text-primary">funciona</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {steps.map((s, i) => (
            <div key={s.title} className="bg-card border border-border rounded-xl p-6 text-center">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary mb-4">
                <s.icon className="h-6 w-6" />
              </div>
              <div className="text-xs font-bold text-primary mb-1">PASSO {i + 1}</div>
              <h3 className="font-bold text-lg mb-2">{s.title}</h3>
              <p className="text-sm text-muted-foreground">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
