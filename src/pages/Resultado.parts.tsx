// Seções "abaixo da dobra" da página /resultado.
// Carregadas via React.lazy + Suspense para sair do JS do paint inicial.
import { Link } from "react-router-dom";
import { MapPin } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { cityPages as cityPagesType } from "@/data/cityContent";

type City = (typeof cityPagesType)[number];

export function ResultadoFAQ({
  vehicle,
  faq,
}: {
  vehicle: string;
  faq: Array<{ q: string; a: string }>;
}) {
  if (!faq.length) return null;
  return (
    <section className="mt-6 rounded-2xl border border-border bg-card p-5 md:p-7">
      <h2 className="font-display text-lg font-bold md:text-xl">
        Perguntas frequentes sobre bateria para {vehicle}
      </h2>
      <Accordion type="single" collapsible className="mt-3">
        {faq.map((f, i) => (
          <AccordionItem key={i} value={`faq-${i}`}>
            <AccordionTrigger className="text-left text-sm font-semibold md:text-base">
              {f.q}
            </AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground md:text-base">
              {f.a}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}

export function ResultadoCidades({
  vehicle,
  cities,
}: {
  vehicle: string;
  cities: City[];
}) {
  return (
    <section className="mt-6 rounded-2xl border border-border bg-card p-5 md:p-7">
      <h2 className="font-display text-lg font-bold md:text-xl">
        Atendimento de bateria para {vehicle} em Porto Alegre e região
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Entregamos a bateria do {vehicle} nas principais cidades da região metropolitana:
      </p>
      <ul className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
        {cities.map((c) => (
          <li key={c.slug}>
            <Link
              to={`/baterias/${c.slug}`}
              className="group inline-flex w-full items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-xs font-semibold transition-colors hover:border-primary hover:text-primary md:text-sm"
            >
              <MapPin className="h-3.5 w-3.5 text-primary" />
              Bateria em {c.name}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
