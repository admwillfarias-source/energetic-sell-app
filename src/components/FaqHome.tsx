import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs: { question: string; answer: string }[] = [
  {
    question: "Qual a área de atendimento?",
    answer:
      "Porto Alegre e grande Porto Alegre (Canoas, Gravataí, Cachoeirinha, Alvorada e região).",
  },
  {
    question: "Quanto tempo leva a entrega?",
    answer: "Em média 35 minutos após o pedido.",
  },
  {
    question: "Vocês retiram a bateria velha?",
    answer: "Sim, o técnico leva a bateria antiga sem custo adicional.",
  },
  {
    question: "Quais formas de pagamento?",
    answer: "Cartão de crédito em até 10x sem juros, débito, Pix e dinheiro.",
  },
  {
    question: "A bateria tem garantia?",
    answer: "Sim, todas as baterias têm garantia de fábrica.",
  },
];

export default function FaqHome() {
  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
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
          Dúvidas <span className="text-primary">frequentes</span>
        </h2>
        <Accordion type="single" collapsible className="bg-card rounded-xl border border-border">
          {faqs.map((f, i) => (
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
