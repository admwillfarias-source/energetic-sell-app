import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const WHATSAPP_URL =
  "https://wa.me/5551993199486?text=Ol%C3%A1!%20Solicito%20a%20minha%20bateria.";

export default function HeroWhatsButton() {
  return (
    <Button
      asChild
      size="lg"
      className="bg-awr-green hover:bg-awr-green/90 text-awr-green-foreground font-bold text-base gap-2 h-14 px-8 animate-pulse-glow"
    >
      <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
        <MessageCircle className="h-5 w-5" />
        Solicite a sua bateria
      </a>
    </Button>
  );
}
