import { ShoppingCart, ShieldCheck, Zap, ExternalLink, Clock, CalendarClock } from "lucide-react";
import { Battery } from "@/data/batteries";
import { Button } from "@/components/ui/button";
import { useCart, formatBRL } from "@/context/CartContext";
import { toast } from "@/hooks/use-toast";
import batteryImg from "@/assets/battery-product.png";

const isRemote = (s: string) => /^https?:\/\//.test(s);

type Props = {
  battery: Battery;
  onSelect?: (b: Battery) => void;
};

export function BatteryCard({ battery, onSelect }: Props) {
  const { add } = useCart();

  const onBuy = (e: React.MouseEvent) => {
    e.stopPropagation();
    add(battery);
    toast({
      title: "Adicionada ao carrinho",
      description: `${battery.name} • ${battery.amperage}Ah`,
    });
    window.dispatchEvent(new CustomEvent("open-checkout"));
  };

  const discount =
    battery.oldPrice && battery.oldPrice > battery.price
      ? Math.round(100 - (battery.price / battery.oldPrice) * 100)
      : 0;

  return (
    <article
      onClick={() => onSelect?.(battery)}
      className="group flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-card transition-all hover:-translate-y-1 hover:border-accent/60 hover:shadow-elevated"
    >
      <div className="relative flex aspect-square items-center justify-center overflow-hidden bg-white p-6">
        {discount > 0 && (
          <span className="absolute left-3 top-3 rounded-full bg-accent px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-accent-foreground">
            -{discount}%
          </span>
        )}
        <img
          src={isRemote(battery.image) ? battery.image : batteryImg}
          alt={`Bateria ${battery.brand} ${battery.name} ${battery.amperage}Ah — garantia ${battery.warranty} meses`}
          onError={(e) => ((e.currentTarget as HTMLImageElement).src = batteryImg)}
          loading="lazy"
          width={400}
          height={400}
          className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-105"
        />
      </div>

      <div className="flex flex-1 flex-col p-5">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          {battery.brand}
        </span>
        <h3 className="mt-1 font-display text-base font-bold leading-tight">{battery.name}</h3>

        <div className="mt-3 flex flex-wrap gap-2 text-xs">
          <span className="inline-flex items-center gap-1 rounded-md bg-primary px-2 py-1 font-semibold text-white">
            <Zap className="h-3.5 w-3.5" />
            {battery.amperage}Ah
          </span>
          <span className="inline-flex items-center gap-1 rounded-md bg-primary px-2 py-1 font-semibold text-white">
            <ShieldCheck className="h-3.5 w-3.5" />
            {battery.warranty} meses
          </span>
        </div>

        {(/^(moura|heliar)/i.test(battery.brand)) && (
          <div className="mt-3 rounded-lg border border-accent/40 bg-accent/10 p-2.5">
            <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-accent-foreground">
              <Clock className="h-3.5 w-3.5 text-accent" />
              Receba em até 35 min
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <CalendarClock className="h-3 w-3" />
              ou agende a entrega no horário que preferir
            </div>
          </div>
        )}

        <div className="mt-auto pt-4">
          <div className="flex items-baseline gap-2">
            {battery.oldPrice && (
              <span className="text-xs text-muted-foreground line-through">
                {formatBRL(battery.oldPrice)}
              </span>
            )}
            <span className="font-display text-xl font-bold text-foreground">
              {formatBRL(battery.price)}
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground">ou 10x sem juros</p>

          <Button
            onClick={onBuy}
            className="mt-3 w-full gap-2 bg-primary text-primary-foreground hover:bg-primary-glow"
          >
            <ShoppingCart className="h-4 w-4" />
            Solicitar a sua bateria
          </Button>
          {battery.permalink && (
            <a
              href={battery.permalink}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="mt-2 inline-flex w-full items-center justify-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Ver no site
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
