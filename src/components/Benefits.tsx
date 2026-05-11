import { Zap, Battery, CreditCard, ShieldCheck } from "lucide-react";

const items = [
  { icon: Zap, title: "35 minutos", desc: "Entrega e instalação rápida em Porto Alegre e região." },
  { icon: Battery, title: "Marcas originais", desc: "Moura, Heliar, Zetta e Excell com garantia de fábrica." },
  { icon: CreditCard, title: "10x sem juros", desc: "Parcelamento facilitado, sem burocracia." },
  { icon: ShieldCheck, title: "Desde 2009", desc: "Mais de 15 anos atendendo motoristas com qualidade." },
];

export function Benefits() {
  return (
    <section className="bg-background py-12 md:py-16" aria-labelledby="benefits-title">
      <div className="container">
        <h2
          id="benefits-title"
          className="font-display text-2xl md:text-3xl font-extrabold text-center mb-8 md:mb-10"
        >
          Por que escolher a <span className="text-primary">AWR?</span>
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((i) => (
            <div
              key={i.title}
              className="flex flex-col items-start gap-3 rounded-xl border border-border bg-card p-5 shadow-card"
            >
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                <i.icon className="h-6 w-6" />
              </span>
              <div>
                <h3 className="font-display text-base font-bold">{i.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{i.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
