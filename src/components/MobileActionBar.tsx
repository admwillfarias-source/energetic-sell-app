import { Phone, MessageCircle } from "lucide-react";
import { handleCallClick } from "@/lib/tracking";

const WHATSAPP_URL =
  "https://wa.me/5551993199486?text=Ol%C3%A1!%20Solicito%20a%20minha%20bateria.";

export default function MobileActionBar() {
  return (
    <div className="fixed bottom-0 inset-x-0 z-40 lg:hidden border-t border-border bg-secondary/95 backdrop-blur shadow-[0_-4px_12px_-2px_hsl(var(--secondary)/0.4)]">
      <div className="grid grid-cols-2 gap-2 p-2">
        <a
          href="tel:+555135165472"
          onClick={(event) => handleCallClick(event, "home", "mobile-bar")}
          className="flex items-center justify-center gap-2 rounded-lg bg-primary text-primary-foreground font-bold text-sm h-12 active:scale-[0.98] transition-transform"
        >
          <Phone className="h-4 w-4" />
          Ligar
        </a>
        <a
          href={WHATSAPP_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 rounded-lg bg-awr-green text-awr-green-foreground font-bold text-sm h-12 active:scale-[0.98] transition-transform"
        >
          <MessageCircle className="h-4 w-4" />
          WhatsApp
        </a>
      </div>
    </div>
  );
}
