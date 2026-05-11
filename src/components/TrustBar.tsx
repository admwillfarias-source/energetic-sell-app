import { Star, Users, ShieldCheck, Truck } from "lucide-react";

const ITEMS = [
  { icon: Star, label: "5,0 no Google", sub: "1500+ avaliações" },
  { icon: Users, label: "Desde 2009", sub: "+15 anos de experiência" },
  { icon: ShieldCheck, label: "Garantia de fábrica", sub: "até 24 meses" },
  { icon: Truck, label: "Entrega em 35 min", sub: "Porto Alegre e região" },
] as const;

export default function TrustBar() {
  return (
    <section
      aria-label="Prova social"
      className="border-y border-border bg-muted/40"
    >
      <div className="container mx-auto px-4 py-4 md:py-5">
        <ul className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {ITEMS.map((it) => (
            <li
              key={it.label}
              className="flex items-center gap-2.5 rounded-lg bg-card/60 px-3 py-2 md:bg-transparent md:px-0 md:py-0"
            >
              <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <it.icon className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-bold leading-tight text-foreground">
                  {it.label}
                </p>
                <p className="text-[11px] leading-tight text-muted-foreground">
                  {it.sub}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
