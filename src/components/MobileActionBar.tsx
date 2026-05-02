import { Phone, MessageCircle } from "lucide-react";
import { handleCallClick } from "@/lib/tracking";

const WHATSAPP_URL =
  "https://wa.me/5551993199486?text=Ol%C3%A1!%20Solicito%20a%20minha%20bateria.";

export default function MobileActionBar() {
  return (
    <div
      data-debug-id="mobile-action-bar"
      className="fixed inset-x-0 z-40 lg:hidden border-b border-border bg-background/98 backdrop-blur-md shadow-[0_6px_16px_-2px_hsl(var(--foreground)/0.18)]"
      style={{
        top: "calc(env(safe-area-inset-top, 0px) + 64px)",
        paddingTop: "8px",
        paddingBottom: "8px",
      }}
    >
      <div className="grid grid-cols-2 gap-2 px-3 max-w-md mx-auto">
        <a
          href="tel:+555135165472"
          target="_top"
          rel="nofollow"
          onClick={(event) => handleCallClick(event, "home", "mobile-bar")}
          style={{ touchAction: "manipulation", WebkitTapHighlightColor: "transparent" }}
          className="flex items-center justify-center gap-2 rounded-lg bg-primary text-primary-foreground font-extrabold text-sm h-11 cursor-pointer active:scale-[0.98] transition-transform shadow-sm relative z-10"
          aria-label="Ligar agora para AWR Baterias"
        >
          <Phone className="h-4 w-4 pointer-events-none" />
          <span className="pointer-events-none">Ligar agora</span>
        </a>
        <a
          href={WHATSAPP_URL}
          target="_blank"
          rel="noopener noreferrer"
          style={{ touchAction: "manipulation", WebkitTapHighlightColor: "transparent" }}
          className="flex items-center justify-center gap-2 rounded-lg bg-awr-green text-awr-green-foreground font-extrabold text-sm h-11 active:scale-[0.98] transition-transform shadow-sm relative z-10"
        >
          <MessageCircle className="h-4 w-4 pointer-events-none" />
          <span className="pointer-events-none">WhatsApp</span>
        </a>
      </div>
    </div>
  );
}
