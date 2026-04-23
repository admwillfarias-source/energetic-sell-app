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
      className={`group relative flex flex-row overflow-hidden rounded-xl border bg-card shadow-sm transition-all hover:shadow-md ${
        highlight ? "border-accent ring-1 ring-accent/30" : "border-border"
      }`}
    >
      {highlight && (
        <span className="absolute left-2 top-2 z-10 inline-flex items-center gap-0.5 rounded-full bg-accent px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-accent-foreground shadow">
          <Award className="h-2.5 w-2.5" />
          Top
        </span>
      )}

      {/* Imagem */}
      <div className="relative flex w-24 shrink-0 items-center justify-center bg-white p-2 sm:w-28">
        {discount > 0 && (
          <span className="absolute right-1 top-1 rounded-full bg-primary px-1.5 py-0.5 text-[9px] font-bold uppercase text-primary-foreground">
            -{discount}%
          </span>
        )}
        <img
          src={isRemote(battery.image) ? battery.image : batteryImg}
          alt={`Bateria ${battery.brand} ${battery.name} ${battery.amperage}Ah`}
          onError={(e) => ((e.currentTarget as HTMLImageElement).src = batteryImg)}
          loading="lazy"
          width={200}
          height={200}
          className="h-full w-full object-contain"
        />
      </div>

      {/* Conteúdo */}
      <div className="flex flex-1 flex-col gap-1.5 p-2.5 sm:p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <span className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
              {battery.brand}
            </span>
            <h3 className="truncate font-display text-sm font-bold leading-tight">
              {battery.name}
            </h3>
          </div>
          <div className="text-right">
            {battery.oldPrice && (
              <div className="text-[10px] text-muted-foreground line-through">
                {formatBRL(battery.oldPrice)}
              </div>
            )}
            <div className="font-display text-base font-extrabold leading-none text-foreground sm:text-lg">
              {formatBRL(battery.price)}
            </div>
            <div className="text-[9px] font-semibold text-accent">
              10x {formatBRL(installment)}
            </div>
          </div>
        </div>

        {/* Specs em linha */}
        <div className="flex flex-wrap items-center gap-1 text-[10px]">
          <span className="inline-flex items-center gap-0.5 rounded bg-primary/10 px-1.5 py-0.5 font-semibold text-primary">
            <Zap className="h-2.5 w-2.5" />
            {battery.amperage}Ah
          </span>
          <span className="inline-flex items-center gap-0.5 rounded bg-primary/10 px-1.5 py-0.5 font-semibold text-primary">
            <ShieldCheck className="h-2.5 w-2.5" />
            {battery.warranty}m
          </span>
          <span className="inline-flex items-center gap-0.5 rounded bg-awr-green/10 px-1.5 py-0.5 font-semibold text-awr-green">
            <Clock className="h-2.5 w-2.5" />
            35 min
          </span>
        </div>

        {/* CTAs */}
        <div className="mt-auto flex gap-1.5 pt-1">
          <Button
            onClick={onBuy}
            size="sm"
            className="h-8 flex-1 gap-1 px-2 text-xs bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <ShoppingCart className="h-3.5 w-3.5" />
            Comprar
          </Button>
          <Button
            asChild
            size="sm"
            variant="outline"
            className="h-8 flex-1 gap-1 px-2 text-xs border-awr-green/50 bg-awr-green/10 text-awr-green hover:bg-awr-green hover:text-white"
          >
            <a href={whatsHref} target="_blank" rel="noopener noreferrer">
              <MessageCircle className="h-3.5 w-3.5" />
              WhatsApp
            </a>
          </Button>
        </div>
      </div>
    </article>
  );
}
