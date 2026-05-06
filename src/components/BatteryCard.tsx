import { ShoppingCart, ShieldCheck, Zap, Clock, CalendarClock, BadgeCheck } from "lucide-react";
import { Battery } from "@/data/batteries";
import { Button } from "@/components/ui/button";
import { useCart, formatBRL } from "@/context/CartContext";
import { toast } from "@/hooks/use-toast";
import { BatteryImage } from "@/components/BatteryImage";
import { CARD_SIZES } from "@/lib/imageSrcset";

type Props = {
  battery: Battery;
  onSelect?: (b: Battery) => void;
  /** Cards na primeira dobra: carrega ansioso e prioriza */
  priority?: boolean;
};

export function BatteryCard({ battery, onSelect, priority = false }: Props) {
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

  const isOemBrand = /^(moura|heliar)/i.test(battery.brand);
  const waText = encodeURIComponent(
    `Olá! Tenho interesse na bateria ${battery.brand} ${battery.name} (${battery.amperage}Ah). Pode me ajudar?`,
  );
  const waHref = `https://wa.me/5551993199486?text=${waText}`;

  return (
    <article
      onClick={() => onSelect?.(battery)}
      className="group flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-card transition-all hover:-translate-y-1 hover:border-accent/60 hover:shadow-elevated"
    >
      <div className="relative flex aspect-square items-center justify-center overflow-hidden bg-white p-3 sm:p-6">
        {discount > 0 && (
          <span className="absolute left-2 top-2 sm:left-3 sm:top-3 rounded-full bg-accent px-2 py-0.5 sm:px-2.5 sm:py-1 text-[10px] sm:text-[11px] font-bold uppercase tracking-wide text-accent-foreground">
            -{discount}%
          </span>
        )}
        {isOemBrand && (
          <span className="absolute right-2 top-2 sm:right-3 sm:top-3 inline-flex items-center gap-1 rounded-full bg-primary px-2 py-0.5 sm:px-2.5 sm:py-1 text-[9px] sm:text-[10px] font-bold uppercase tracking-wide text-primary-foreground shadow-sm">
            <BadgeCheck className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
            <span className="hidden sm:inline">Indicado pela montadora</span>
            <span className="sm:hidden">Montadora</span>
          </span>
        )}
        <BatteryImage
          src={battery.image}
          alt={`Bateria ${battery.brand} ${battery.name} ${battery.amperage}Ah — garantia ${battery.warranty} meses`}
          width={400}
          height={400}
          priority={priority}
          sizes={CARD_SIZES}
          className="transition-transform duration-500 group-hover:scale-105"
        />
      </div>

      <div className="flex flex-1 flex-col p-3 sm:p-5">
        <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          {battery.brand}
        </span>
        <h3 className="mt-0.5 sm:mt-1 font-display text-sm sm:text-base font-bold leading-tight">{battery.name}</h3>

        <div className="mt-2 sm:mt-3 flex flex-wrap gap-1.5 sm:gap-2 text-[11px] sm:text-xs">
          <span className="inline-flex items-center gap-1 rounded-md bg-primary px-1.5 py-0.5 sm:px-2 sm:py-1 font-semibold text-white">
            <Zap className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
            {battery.amperage}Ah
          </span>
          <span className="inline-flex items-center gap-1 rounded-md bg-primary px-1.5 py-0.5 sm:px-2 sm:py-1 font-semibold text-white">
            <ShieldCheck className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
            {battery.warranty} meses
          </span>
        </div>

        {isOemBrand && (
          <div className="mt-2 sm:mt-3 hidden sm:block rounded-lg border border-accent/40 bg-accent/10 p-2.5">
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

        <div className="mt-auto pt-3 sm:pt-4">
          <div className="flex items-baseline gap-1.5 sm:gap-2">
            {battery.oldPrice && (
              <span className="text-[11px] sm:text-xs text-muted-foreground line-through">
                {formatBRL(battery.oldPrice)}
              </span>
            )}
            <span className="font-display text-lg sm:text-xl font-bold text-foreground">
              {formatBRL(battery.price)}
            </span>
          </div>
          <p className="text-[11px] sm:text-xs font-bold text-awr-green">
            {formatBRL(battery.price * 0.97)} no Pix <span className="font-normal text-muted-foreground">(-3%)</span>
          </p>
          <p className="text-[10px] sm:text-[11px] text-muted-foreground">ou 10x sem juros</p>

          <Button
            onClick={onBuy}
            size="sm"
            className="mt-2 sm:mt-3 w-full gap-1.5 sm:gap-2 bg-primary text-primary-foreground hover:bg-primary-glow text-xs sm:text-sm h-9 sm:h-10"
          >
            <ShoppingCart className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            Solicitar a sua bateria
          </Button>
          <a
            href={waHref}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="mt-2 inline-flex w-full items-center justify-center gap-1.5 rounded-md border border-[#25D366]/30 bg-[#25D366]/10 px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold text-[#128C7E] hover:bg-[#25D366]/20 transition-colors"
          >
            <svg className="h-3.5 w-3.5 sm:h-4 sm:w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.626.712.226 1.36.194 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
            </svg>
            Chamar no WhatsApp
          </a>
        </div>
      </div>
    </article>
  );
}
