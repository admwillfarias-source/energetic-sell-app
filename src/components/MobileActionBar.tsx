import { Phone, MessageCircle } from "lucide-react";
import { handleCallClick } from "@/lib/tracking";

const WHATSAPP_URL =
  "https://wa.me/5551993199486?text=Ol%C3%A1!%20Solicito%20a%20minha%20bateria.";

export default function MobileActionBar() {
  return (
    <div
      className="fixed inset-x-0 z-[9999] lg:hidden border-t border-border bg-background/98 backdrop-blur-md shadow-[0_-6px_16px_-2px_hsl(var(--foreground)/0.18)]"
      style={{
        bottom: "max(env(safe-area-inset-bottom, 0px), 16px)",
        paddingTop: "8px",
        paddingBottom: "8px",
      }}
    >
      <div className="grid grid-cols-2 gap-2 px-3 max-w-md mx-auto">
        <a
          href="tel:+555135165472"
          onClick={(event) => handleCallClick(event, "home", "mobile-bar")}
          className="flex items-center justify-center gap-2 rounded-lg bg-primary text-primary-foreground font-extrabold text-sm h-11 active:scale-[0.98] transition-transform shadow-sm"
        >
          <Phone className="h-4 w-4" />
          Ligar agora
        </a>
        <a
          href={WHATSAPP_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 rounded-lg bg-awr-green text-awr-green-foreground font-extrabold text-sm h-11 active:scale-[0.98] transition-transform shadow-sm"
        >
          <MessageCircle className="h-4 w-4" />
          WhatsApp
        </a>
      </div>
    </div>
  );
}
