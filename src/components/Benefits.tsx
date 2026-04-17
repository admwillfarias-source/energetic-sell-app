import { ShieldCheck, Truck, Recycle, Wallet } from "lucide-react";

const items = [
  { icon: Wrench, title: "Instalação grátis", desc: "Nosso técnico instala onde estiver." },
  { icon: Recycle, title: "Troca da bateria velha", desc: "Recolhemos sem custo adicional." },
  { icon: ShieldCheck, title: "Garantia de fábrica", desc: "Até 36 meses de garantia." },
  { icon: Wallet, title: "Pague na entrega", desc: "Pix, cartão ou dinheiro." },
];

import { Wrench } from "lucide-react";

export function Benefits() {
  return (
    <section className="bg-background py-12">
      <div className="container">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((i) => (
            <div
              key={i.title}
              className="flex items-start gap-3 rounded-xl border border-border bg-card p-5 shadow-card"
            >
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-accent/15 text-accent">
                <i.icon className="h-5 w-5" />
              </span>
              <div>
                <h3 className="font-display text-sm font-bold">{i.title}</h3>
                <p className="mt-0.5 text-xs text-muted-foreground">{i.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
