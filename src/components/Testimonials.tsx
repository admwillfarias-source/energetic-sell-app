import { Star, BadgeCheck, ShieldCheck, Wrench, Wallet, Award } from "lucide-react";

interface Review {
  name: string;
  initials: string;
  city: string;
  date: string;
  rating: number;
  text: string;
  vehicle?: string;
  battery?: string;
  reply?: string;
}

const reviews: Review[] = [
  {
    name: "Carlos M.",
    initials: "CM",
    city: "Porto Alegre",
    date: "2025-03-12",
    rating: 5,
    text: "Liguei às 21h, em 30 minutos a bateria estava instalada. Atendimento de primeira e preço justo. Recomendo!",
    vehicle: "Onix 2018",
    battery: "Moura M60GD",
    reply: "Obrigado, Carlos! Conta com a gente sempre que precisar.",
  },
  {
    name: "Juliana R.",
    initials: "JR",
    city: "Canoas",
    date: "2025-02-28",
    rating: 5,
    text: "Meu carro não pegou de manhã. Pedi pelo WhatsApp, em 25 minutos o técnico chegou e ainda testou o alternador. Excelente!",
    vehicle: "HB20 2020",
    battery: "Heliar HG60DD",
  },
  {
    name: "Rodrigo S.",
    initials: "RS",
    city: "Gravataí",
    date: "2025-01-19",
    rating: 5,
    text: "Bateria Moura instalada no domingo à tarde. Pagamento no PIX na hora, garantia de 2 anos. Serviço impecável.",
    vehicle: "Strada 2017",
    battery: "Moura M70RE",
  },
  {
    name: "Patrícia L.",
    initials: "PL",
    city: "Cachoeirinha",
    date: "2024-12-05",
    rating: 5,
    text: "Agendei para o dia seguinte às 9h e chegaram pontualmente. Técnico educado, explicou tudo e ainda recolheu a bateria velha.",
    vehicle: "Renegade 2019",
    battery: "Heliar HG70JE",
  },
  {
    name: "Eduardo T.",
    initials: "ET",
    city: "Esteio",
    date: "2024-11-22",
    rating: 5,
    text: "Tenho 4 carros na frota. Sempre que preciso, eles resolvem rápido e com nota fiscal. Parceria de anos.",
    vehicle: "Frota — utilitários",
    battery: "Moura M75LE",
    reply: "Valeu, Eduardo! Obrigado pela confiança contínua.",
  },
  {
    name: "Marina F.",
    initials: "MF",
    city: "Novo Hamburgo",
    date: "2024-10-14",
    rating: 5,
    text: "Saí do trabalho e o carro não ligou. Chamei pelo site, em meia hora estava resolvido. Paguei no cartão em 10x sem juros.",
    vehicle: "Civic 2016",
    battery: "Heliar HG60DD",
  },
];

const reviewLd = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: "AWR Baterias",
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "5.0",
    reviewCount: 1500,
  },
  review: reviews.map((r) => ({
    "@type": "Review",
    author: { "@type": "Person", name: r.name },
    datePublished: r.date,
    reviewRating: { "@type": "Rating", ratingValue: r.rating, bestRating: 5 },
    reviewBody: r.text,
  })),
};

const seals = [
  { icon: ShieldCheck, label: "Garantia 24 meses" },
  { icon: Wrench, label: "Instalação grátis" },
  { icon: Wallet, label: "Pague na entrega" },
  { icon: Award, label: "Distribuidor oficial" },
];

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
}

export default function Testimonials() {
  return (
    <section className="py-12 md:py-16" aria-labelledby="testimonials-title">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8 md:mb-10">
          <h2
            id="testimonials-title"
            className="font-display text-2xl md:text-3xl font-extrabold mb-3"
          >
            O que nossos <span className="text-primary">clientes dizem</span>
          </h2>
          <a
            href="https://www.google.com/search?q=AWR+Baterias+Porto+Alegre"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold shadow-sm hover:border-accent/50 transition-colors"
            aria-label="Ver avaliações no Google"
          >
            <span className="flex" aria-hidden="true">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-accent text-accent" />
              ))}
            </span>
            <span className="font-bold">5.0</span>
            <span className="text-muted-foreground">·</span>
            <span>1500+ avaliações no Google</span>
          </a>
        </div>

        <div className="flex md:grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 overflow-x-auto md:overflow-visible snap-x snap-mandatory pb-4 -mx-4 px-4 md:mx-0 md:px-0">
          {reviews.map((r) => (
            <article
              key={r.name + r.date}
              className="snap-center flex-shrink-0 w-[85%] md:w-auto bg-card border border-border rounded-xl p-5 shadow-sm flex flex-col"
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                  {r.initials}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm flex items-center gap-1.5">
                    {r.name}
                    <BadgeCheck className="h-3.5 w-3.5 text-accent" aria-label="Compra verificada" />
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {r.city} · {formatDate(r.date)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <div className="flex" aria-label={`${r.rating} de 5 estrelas`}>
                  {[...Array(r.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-accent text-accent" />
                  ))}
                </div>
                <span className="text-[10px] font-semibold uppercase tracking-wide text-awr-green bg-awr-green/10 rounded px-1.5 py-0.5">
                  Compra verificada
                </span>
              </div>
              <p className="text-sm text-foreground/80 leading-relaxed">{r.text}</p>
              {(r.vehicle || r.battery) && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {r.vehicle && (
                    <span className="text-[11px] rounded-full bg-muted px-2 py-0.5 text-muted-foreground">
                      🚗 {r.vehicle}
                    </span>
                  )}
                  {r.battery && (
                    <span className="text-[11px] rounded-full bg-primary/10 px-2 py-0.5 font-semibold text-primary">
                      🔋 {r.battery}
                    </span>
                  )}
                </div>
              )}
              {r.reply && (
                <div className="mt-3 rounded-md border-l-2 border-accent bg-accent/5 px-3 py-2 text-xs text-foreground/70">
                  <span className="font-semibold text-foreground">AWR Baterias:</span> {r.reply}
                </div>
              )}
            </article>
          ))}
        </div>

        <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-3 max-w-4xl mx-auto">
          {seals.map((s) => (
            <div
              key={s.label}
              className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2.5 shadow-sm"
            >
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-accent/15 text-accent">
                <s.icon className="h-4 w-4" aria-hidden="true" />
              </span>
              <span className="text-xs font-semibold text-foreground">{s.label}</span>
            </div>
          ))}
        </div>
      </div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(reviewLd) }}
      />
    </section>
  );
}
