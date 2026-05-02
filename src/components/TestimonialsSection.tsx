import { Star } from "lucide-react";
import type { Testimonial } from "@/data/testimonials";

interface Props {
  city: string;
  items: Testimonial[];
}

export function TestimonialsSection({ city, items }: Props) {
  if (!items.length) return null;
  return (
    <section className="border-t border-border bg-background py-14">
      <div className="container max-w-5xl">
        <div className="text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-accent-foreground">
            <Star className="h-3.5 w-3.5" /> 5,0 no Google • +1.500 avaliações
          </span>
          <h2 className="mt-3 font-display text-2xl font-bold md:text-3xl">
            O que dizem nossos clientes em {city}
          </h2>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {items.map((t, i) => (
            <article
              key={i}
              className="rounded-xl border border-border bg-card p-5"
            >
              <div className="flex items-center gap-1 text-primary">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <Star key={j} className="h-4 w-4 fill-current" />
                ))}
              </div>
              <p className="mt-3 text-sm leading-relaxed text-foreground">"{t.body}"</p>
              <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">{t.author}</span>
                {t.neighborhood && <span>{t.neighborhood}</span>}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default TestimonialsSection;
