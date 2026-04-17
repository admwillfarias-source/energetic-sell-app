import { Search, CalendarCheck, Wrench } from "lucide-react";

const steps = [
  {
    icon: Search,
    title: "1. Escolha sua bateria",
    desc: "Use a busca por veículo ou navegue pelo catálogo para achar a bateria ideal.",
  },
  {
    icon: CalendarCheck,
    title: "2. Agende a entrega",
    desc: "Escolha o melhor horário. Entregamos rápido na sua casa, trabalho ou onde estiver.",
  },
  {
    icon: Wrench,
    title: "3. Instalamos no local",
    desc: "Nosso técnico instala em minutos e leva sua bateria antiga sem custo extra.",
  },
];

export function HowItWorks() {
  return (
    <section id="como-funciona" className="border-y border-border bg-secondary/40 py-16 md:py-24">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-semibold uppercase tracking-wider text-accent-foreground/70">
            Simples assim
          </span>
          <h2 className="mt-2 font-display text-3xl font-bold md:text-4xl">
            Como funciona o BateriaJá
          </h2>
          <p className="mt-3 text-muted-foreground">
            Em três passos você troca a bateria do seu carro sem sair de casa.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {steps.map((s) => (
            <div
              key={s.title}
              className="group relative rounded-2xl border border-border bg-card p-6 shadow-card transition-all hover:-translate-y-1 hover:shadow-elevated"
            >
              <div className="mb-5 grid h-12 w-12 place-items-center rounded-xl bg-gradient-accent shadow-glow">
                <s.icon className="h-6 w-6 text-accent-foreground" strokeWidth={2.25} />
              </div>
              <h3 className="font-display text-lg font-bold">{s.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
