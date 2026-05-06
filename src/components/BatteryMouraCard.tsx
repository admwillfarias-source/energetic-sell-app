import { ShieldCheck, Truck, CreditCard, MessageCircle, Tag } from "lucide-react";
import { Battery } from "@/data/batteries";
import { Button } from "@/components/ui/button";
import { useCart, formatBRL } from "@/context/CartContext";
import { BatteryImage } from "@/components/BatteryImage";
import { COMPACT_SIZES } from "@/lib/imageSrcset";

const WHATSAPP_NUMBER = "555135165472";

type Props = {
  battery: Battery;
  vehicleLabel?: string;
  city?: string;
  highlight?: boolean;
  priority?: boolean;
};

export function BatteryMouraCard({
  battery,
  vehicleLabel,
  city = "Porto Alegre, RS",
  highlight,
  priority = false,
}: Props) {
  const { add } = useCart();

  const onBuy = () => {
    // Adiciona silenciosamente ao carrinho (sem toast, sem abrir drawer)
    // e dispara direto o checkout.
    add(battery);
    window.dispatchEvent(new CustomEvent("open-checkout"));
  };

  const installment = battery.price / 10;
  const pixPrice = battery.price * 0.97;

  const whatsMsg = encodeURIComponent(
    `Olá! Quero a bateria ${battery.brand} ${battery.name} ${battery.amperage}Ah` +
      (vehicleLabel ? ` para meu ${vehicleLabel}.` : "."),
  );
  const whatsHref = `https://wa.me/${WHATSAPP_NUMBER}?text=${whatsMsg}`;

  return (
    <article
      className={`overflow-hidden rounded-2xl border bg-card shadow-sm ${
        highlight ? "border-accent ring-1 ring-accent/30" : "border-border"
      }`}
    >
      {/* Faixa topo: agendamento */}
      <div className="flex items-center justify-center gap-2 bg-primary px-3 py-1.5 text-center text-[11px] font-semibold text-primary-foreground sm:text-sm">
        <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
        Agende ou receba em até 35 min
      </div>

      {/* Bloco preço + foto + PIX — centralizado verticalmente */}
      <div className="flex flex-col items-center px-3 pt-3">
        <div className="flex h-28 w-28 items-center justify-center rounded-lg bg-white p-1 sm:h-32 sm:w-32">
          <BatteryImage
            src={battery.image}
            alt={`Bateria ${battery.brand} ${battery.name} ${battery.amperage}Ah`}
            width={240}
            height={240}
            priority={priority}
            sizes={COMPACT_SIZES}
          />
        </div>
        <p className="mt-2 text-sm leading-tight text-muted-foreground">
          Em <span className="font-bold text-accent">10x</span> sem juros de
        </p>
        <p className="font-display text-4xl font-extrabold leading-none text-primary sm:text-5xl">
          {formatBRL(installment)}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          à vista{" "}
          <span className="font-bold text-primary">{formatBRL(battery.price)}</span>
        </p>
      </div>

      {/* Faixa desconto PIX — centralizada, colada ao preço */}
      <div className="mx-auto mt-2 mb-3 flex w-fit items-center justify-center gap-2 rounded-full bg-accent px-3 py-1 text-accent-foreground">
        <Tag className="h-3.5 w-3.5 shrink-0 -rotate-90" />
        <p className="text-[11px] font-semibold sm:text-xs">
          PIX/Dinheiro:{" "}
          <span className="font-extrabold">{formatBRL(pixPrice)}</span>
        </p>
      </div>

      {/* Modelo / Amperagem — linha única */}
      <div className="border-b border-border px-3 py-2 text-center text-xs sm:text-sm">
        <span className="font-bold text-foreground">{battery.name}</span>
        <span className="mx-1.5 text-muted-foreground">·</span>
        <span className="font-bold text-foreground">{battery.amperage}Ah</span>
        <span className="mx-1.5 text-muted-foreground">·</span>
        <span className="text-muted-foreground">{city}</span>
      </div>

      {/* Benefícios — compactos */}
      <ul className="divide-y divide-border">
        <li className="flex items-center gap-2.5 px-3 py-2">
          <Truck className="h-4 w-4 shrink-0 text-awr-green" />
          <p className="text-xs">
            <span className="font-bold text-accent">GRÁTIS</span>{" "}
            <span className="text-foreground">entrega, teste e instalação</span>
          </p>
        </li>
        <li className="flex items-center gap-2.5 px-3 py-2">
          <CreditCard className="h-4 w-4 shrink-0 text-primary" />
          <p className="text-xs text-foreground">
            Cartão, <span className="font-bold text-accent">PIX ou dinheiro</span> na entrega
          </p>
        </li>
        <li className="flex items-center gap-2.5 px-3 py-2">
          <ShieldCheck className="h-4 w-4 shrink-0 text-primary" />
          <p className="text-xs text-foreground">
            <span className="font-bold text-accent">{battery.warranty} meses</span> de garantia
          </p>
        </li>
      </ul>

      {/* CTA principal */}
      <div className="space-y-2 p-3">
        <Button
          onClick={onBuy}
          size="lg"
          className="h-11 w-full bg-accent text-sm font-bold uppercase tracking-wide text-accent-foreground hover:bg-accent/90 sm:text-base"
        >
          Peça agora sua bateria!
        </Button>
        <Button
          asChild
          variant="outline"
          className="h-10 w-full gap-2 border-awr-green/50 bg-awr-green/10 text-sm text-awr-green hover:bg-awr-green hover:text-white"
        >
          <a href={whatsHref} target="_blank" rel="noopener noreferrer">
            <MessageCircle className="h-4 w-4" />
            Falar no WhatsApp
          </a>
        </Button>
      </div>
    </article>
  );
}
