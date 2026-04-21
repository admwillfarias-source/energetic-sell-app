import { Star } from "lucide-react";

interface Review {
  name: string;
  initials: string;
  city: string;
  date: string;
  rating: number;
  text: string;
}

const reviews: Review[] = [
  {
    name: "Carlos M.",
    initials: "CM",
    city: "Porto Alegre",
    date: "2025-03-12",
    rating: 5,
    text: "Liguei às 21h, em 30 minutos a bateria estava instalada. Atendimento de primeira e preço justo. Recomendo!",
  },
  {
    name: "Juliana R.",
    initials: "JR",
    city: "Canoas",
    date: "2025-02-28",
    rating: 5,
    text: "Meu carro não pegou de manhã. Pedi pelo WhatsApp, em 25 minutos o técnico chegou e ainda testou o alternador. Excelente!",
  },
  {
    name: "Rodrigo S.",
    initials: "RS",
    city: "Gravataí",
    date: "2025-01-19",
    rating: 5,
    text: "Bateria Moura instalada no domingo à tarde. Pagamento no PIX na hora, garantia de 2 anos. Serviço impecável.",
  },
];

const reviewLd = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: "AWR Baterias",
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "5.0",
    reviewCount: reviews.length,
  },
  review: reviews.map((r) => ({
    "@type": "Review",
    author: { "@type": "Person", name: r.name },
    datePublished: r.date,
    reviewRating: { "@type": "Rating", ratingValue: r.rating, bestRating: 5 },
    reviewBody: r.text,
  })),
};

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
}

export default function Testimonials() {
  return (
    <section className="py-12 md:py-16" aria-labelledby="testimonials-title">
      <div className="container mx-auto px-4">
        <h2
          id="testimonials-title"
          className="font-display text-2xl md:text-3xl font-extrabold text-center mb-8 md:mb-12"
        >
          O que nossos <span className="text-primary">clientes dizem</span>
        </h2>
        <div className="flex md:grid md:grid-cols-3 gap-4 md:gap-6 overflow-x-auto md:overflow-visible snap-x snap-mandatory pb-4 -mx-4 px-4 md:mx-0 md:px-0">
          {reviews.map((r) => (
            <article
              key={r.name + r.date}
              className="snap-center flex-shrink-0 w-[85%] md:w-auto bg-card border border-border rounded-xl p-5 shadow-sm flex flex-col"
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                  {r.initials}
                </span>
                <div className="flex-1">
                  <p className="font-bold text-sm">{r.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {r.city} · {formatDate(r.date)}
                  </p>
                </div>
              </div>
              <div className="flex mb-2" aria-label={`${r.rating} de 5 estrelas`}>
                {[...Array(r.rating)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-accent text-accent" />
                ))}
              </div>
              <p className="text-sm text-foreground/80 leading-relaxed">{r.text}</p>
            </article>
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
