import { MessageCircle } from "lucide-react";

const WHATSAPP_URL =
  "https://wa.me/5551993199486?text=Ol%C3%A1!%20Solicito%20a%20minha%20bateria.";

export default function FloatingWhatsApp() {
  return (
    <a
      href={WHATSAPP_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Falar no WhatsApp"
      className="hidden lg:flex fixed bottom-6 right-6 z-[9998] items-center gap-2 rounded-full bg-awr-green text-awr-green-foreground font-bold px-5 py-3 shadow-xl hover:scale-105 transition-transform"
    >
      <MessageCircle className="h-5 w-5" />
      <span>WhatsApp</span>
    </a>
  );
}
