import { MessageCircle, ArrowUp } from "lucide-react";
import { trackLead } from "@/lib/tracking";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

export default function FinalCtaBanner() {
  const waUrl = buildWhatsAppUrl({
    intro: "Olá! Quero pedir minha bateria agora.",
  });

  const scrollTop = () => {
    const el = document.getElementById("inicio");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    else window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <section
      aria-labelledby="final-cta-title"
      className="bg-secondary text-secondary-foreground py-14 md:py-20"
    >
      <div className="container mx-auto px-4 text-center">
        <h2
          id="final-cta-title"
          className="font-display text-3xl md:text-4xl font-extrabold mb-3"
        >
          Precisa de bateria <span className="text-primary">agora?</span>
        </h2>
        <p className="text-base md:text-lg text-secondary-foreground/80 mb-8">
          Técnicos disponíveis. Entrega em até 35 minutos.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackLead("final-cta-banner")}
            className="inline-flex h-14 items-center justify-center gap-2 rounded-xl bg-primary px-8 text-base md:text-lg font-extrabold text-primary-foreground shadow-lg transition-colors hover:bg-primary/90"
          >
            <MessageCircle className="h-5 w-5" />
            Pedir minha bateria
          </a>
          <button
            type="button"
            onClick={scrollTop}
            className="inline-flex h-14 items-center justify-center gap-2 rounded-xl border border-secondary-foreground/20 bg-secondary-foreground/5 px-6 text-sm md:text-base font-bold text-secondary-foreground transition-colors hover:bg-secondary-foreground/10"
          >
            <ArrowUp className="h-4 w-4" />
            Buscar pelo veículo
          </button>
        </div>
      </div>
    </section>
  );
}
