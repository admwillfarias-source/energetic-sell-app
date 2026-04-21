import { useState, useEffect } from "react";
import { X, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import VehicleAutocomplete from "@/components/VehicleAutocomplete";
import { handleCallClick } from "@/lib/tracking";

export default function EngagementPopup() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem("popup_dismissed")) return;
    const ua = navigator.userAgent || "";
    if (/Lighthouse|Chrome-Lighthouse|HeadlessChrome|PageSpeed/i.test(ua)) return;

    // Não exibir se o cliente está vendo resultado de busca por veículo
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get("v")?.trim()) return;
    } catch {
      // ignore
    }

    const timer = setTimeout(() => setShow(true), 20000);
    return () => clearTimeout(timer);
  }, []);

  const dismiss = () => {
    setShow(false);
    sessionStorage.setItem("popup_dismissed", "1");
  };

  if (!show) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      onClick={dismiss}
      role="dialog"
      aria-modal="true"
      aria-labelledby="popup-title"
    >
      <div className="absolute inset-0 bg-foreground/60 backdrop-blur-sm" />
      <div
        className="relative bg-card rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={dismiss}
          className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Fechar"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="text-center mb-4">
          <div className="text-4xl mb-2">🔋</div>
          <h3 id="popup-title" className="font-display text-xl font-extrabold text-foreground mb-1">
            Encontre a bateria certa
          </h3>
          <p className="text-muted-foreground text-sm">
            Digite seu carro e ano ou ligue agora para falar com um especialista.
          </p>
        </div>

        <div className="mb-3">
          <VehicleAutocomplete variant="inline" onSelect={dismiss} />
        </div>

        <Button
          asChild
          variant="outline"
          className="border-primary text-primary hover:bg-primary hover:text-primary-foreground font-bold gap-2 h-12 w-full"
        >
          <a
            href="tel:+555135165472"
            onClick={(event) => {
              handleCallClick(event, "home", "popup");
              dismiss();
            }}
          >
            <Phone className="h-5 w-5" />
            Ligar Agora
          </a>
        </Button>

        <p className="text-foreground text-xs font-semibold mt-3 text-center">
          Entrega e instalação em até 35 minutos ⚡️
        </p>
      </div>
    </div>
  );
}
