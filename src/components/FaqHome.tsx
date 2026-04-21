import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { homepageFaqs } from "@/data/faqData";

export default function FaqHome() {
  const top = homepageFaqs.slice(0, 3);

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: top.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };

  return (
    <section className="py-12 md:py-16 bg-muted/30" aria-labelledby="faq-home-title">
      <div className="container mx-auto px-4 max-w-3xl">
        <h2
          id="faq-home-title"
          className="font-display text-2xl md:text-3xl font-extrabold text-center mb-8"
        >
          Perguntas <span className="text-primary">frequentes</span>
        </h2>
        <Accordion type="single" collapsible className="bg-card rounded-xl border border-border">
          {top.map((f, i) => (
            <AccordionItem key={f.question} value={`item-${i}`} className="px-4">
              <AccordionTrigger className="text-left font-semibold">
                {f.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{f.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
      />
    </section>
  );
}
