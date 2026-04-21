import { Search, Truck, CreditCard } from "lucide-react";

const steps = [
  {
    icon: Search,
    title: "1. Busque seu carro",
    desc: "Informe o modelo e ano ou o código da bateria.",
  },
  {
    icon: Truck,
    title: "2. Confirme a entrega",
    desc: "Entrega e instalação grátis em até 35 minutos.",
  },
  {
    icon: CreditCard,
    title: "3. Pague na entrega",
    desc: "PIX, cartão em até 10x sem juros ou dinheiro.",
  },
];

export default function HowToOrder() {
  return (
    <section className="py-12 md:py-16 bg-muted/30" aria-labelledby="how-to-order-title">
      <div className="container mx-auto px-4">
        <h2
          id="how-to-order-title"
          className="font-display text-2xl md:text-3xl font-extrabold text-center mb-8 md:mb-12"
        >
          Como pedir sua bateria em <span className="text-primary">3 passos</span>
        </h2>
        <ol className="grid gap-6 md:grid-cols-3 max-w-4xl mx-auto">
          {steps.map((s) => {
            const Icon = s.icon;
            return (
              <li
                key={s.title}
                className="flex flex-col items-center text-center bg-card rounded-xl p-6 border border-border shadow-sm"
              >
                <span className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Icon className="h-7 w-7 text-primary" aria-hidden="true" />
                </span>
                <h3 className="font-bold text-lg mb-1">{s.title}</h3>
                <p className="text-sm text-muted-foreground">{s.desc}</p>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
