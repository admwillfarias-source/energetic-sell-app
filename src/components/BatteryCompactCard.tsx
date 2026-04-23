import { ShoppingCart, ShieldCheck, Zap, Clock, Award, MessageCircle } from "lucide-react";
import { Battery } from "@/data/batteries";
import { Button } from "@/components/ui/button";
import { useCart, formatBRL } from "@/context/CartContext";
import { toast } from "@/hooks/use-toast";
import batteryImg from "@/assets/battery-product.png";

const isRemote = (s: string) => /^https?:\/\//.test(s);
const WHATSAPP_NUMBER = "555135165472";

type Props = {
  battery: Battery;
  highlight?: boolean;
  vehicleLabel?: string;
};

export function BatteryCompactCard({ battery, highlight, vehicleLabel }: Props) {
  const { add } = useCart();

  const onBuy = () => {
    add(battery);
    toast({
      title: "Adicionada ao carrinho",
      description: `${battery.name} • ${battery.amperage}Ah`,
    });
    window.dispatchEvent(new CustomEvent("open-checkout"));
  };

  const whatsMsg = encodeURIComponent(
    `Olá! Quero a bateria ${battery.brand} ${battery.name} ${battery.amperage}Ah` +
      (vehicleLabel ? ` para meu ${vehicleLabel}.` : "."),
  );
  const whatsHref = `https://wa.me/${WHATSAPP_NUMBER}?text=${whatsMsg}`;

  const discount =
    battery.oldPrice && battery.oldPrice > battery.price
      ? Math.round(100 - (battery.price / battery.oldPrice) * 100)
      : 0;
  const installment = battery.price / 10;

  return (
    <article
      className={`group relative flex flex-col overflow-hidden rounded-2xl border bg-card shadow-card transition-all hover:-translate-y-0.5 hover:shadow-elevated md:flex-row ${
        highlight ? "border-accent shadow-elevated ring-2 ring-accent/30" : "border-border"
      }`}
    >
      {highlight && (
        <span className="absolute left-4 top-4 z-10 inline-flex items-center gap-1 rounded-full bg-accent px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-accent-foreground shadow-md">
          <Award className="h-3 w-3" />
          Recomendada
        </span>
      )}

      {/* Imagem */}
      <div className="relative flex aspect-square w-full shrink-0 items-center justify-center bg-white p-4 md:aspect-auto md:w-44">
        {discount > 0 && (
          <span className="absolute right-3 top-3 rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold uppercase text-primary-foreground">
            -{discount}%
          </span>
        )}
        <img
          src={isRemote(battery.image) ? battery.image : batteryImg}
          alt={`Bateria ${battery.brand} ${battery.name} ${battery.amperage}Ah`}
          onError={(e) => ((e.currentTarget as HTMLImageElement).src = batteryImg)}
          loading="lazy"
          width={300}
          height={300}
          className="h-full w-full max-w-[160px] object-contain transition-transform duration-300 group-hover:scale-105"
        />
      </div>

      {/* Conteúdo */}
      <div className="flex flex-1 flex-col gap-3 p-4 md:p-5">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              {battery.brand}
            </span>
            <h3 className="font-display text-base font-bold leading-tight md:text-lg">
              {battery.name}
            </h3>
          </div>
          <div className="text-right">
            {battery.oldPrice && (
              <div className="text-[11px] text-muted-foreground line-through">
                {formatBRL(battery.oldPrice)}
              </div>
            )}
            <div className="font-display text-xl font-extrabold leading-none text-foreground md:text-2xl">
              {formatBRL(battery.price)}
            </div>
            <div className="text-[11px] font-semibold text-accent">
              ou 10x de {formatBRL(installment)} sem juros
            </div>
          </div>
        </div>

        {/* Specs em linha */}
        <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
          <span className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-1 font-semibold text-primary">
            <Zap className="h-3 w-3" />
            {battery.amperage}Ah
          </span>
          <span className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-1 font-semibold text-primary">
            <ShieldCheck className="h-3 w-3" />
            {battery.warranty} meses garantia
          </span>
          <span className="inline-flex items-center gap-1 rounded-md bg-awr-green/10 px-2 py-1 font-semibold text-awr-green">
            <Clock className="h-3 w-3" />
            Entrega em 35 min
          </span>
        </div>

        {/* CTAs */}
        <div className="mt-auto flex flex-col gap-2 pt-1 sm:flex-row">
          <Button
            onClick={onBuy}
            className="flex-1 gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <ShoppingCart className="h-4 w-4" />
            Comprar agora
          </Button>
          <Button
            asChild
            variant="outline"
            className="flex-1 gap-2 border-awr-green/50 bg-awr-green/10 text-awr-green hover:bg-awr-green hover:text-white"
          >
            <a href={whatsHref} target="_blank" rel="noopener noreferrer">
              <FaWhatsapp className="h-4 w-4" />
              WhatsApp
            </a>
          </Button>
        </div>
      </div>
    </article>
  );
}
