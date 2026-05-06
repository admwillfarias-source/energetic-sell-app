import { ArrowRight, ShieldCheck, Truck, CreditCard, MessageCircle, Tag } from "lucide-react";
import { Battery } from "@/data/batteries";
import { Button } from "@/components/ui/button";
import { useCart, formatBRL } from "@/context/CartContext";
import { toast } from "@/hooks/use-toast";
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
    add(battery);
    toast({
      title: "Adicionada ao carrinho",
      description: `${battery.name} • ${battery.amperage}Ah`,
    });
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
      <div className="flex items-center justify-center gap-2 bg-primary px-4 py-2 text-center text-xs font-semibold text-primary-foreground sm:text-sm">
        <ShieldCheck className="h-4 w-4 shrink-0" />
        Agende ou receba em até 35 min
      </div>

      {/* Bloco preço */}
      <div className="flex items-center gap-3 p-4 sm:gap-4 sm:p-5">
        <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-lg bg-white p-1 sm:h-28 sm:w-28">
          <BatteryImage
            src={battery.image}
            alt={`Bateria ${battery.brand} ${battery.name} ${battery.amperage}Ah`}
            width={200}
            height={200}
            priority={priority}
            sizes={COMPACT_SIZES}
          />
        </div>
        <div className="min-w-0 flex-1 text-right">
          <p className="text-sm leading-tight text-muted-foreground sm:text-base">
            Em <span className="font-bold text-accent">10x</span> sem juros de
          </p>
          <p className="font-display text-3xl font-extrabold leading-none text-primary sm:text-4xl">
            {formatBRL(installment)}
          </p>
          <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
            valor à vista{" "}
            <span className="font-bold text-primary">{formatBRL(battery.price)}</span>
          </p>
        </div>
      </div>

      {/* Faixa desconto PIX */}
      <div className="flex items-center gap-2 bg-accent px-4 py-2.5 text-accent-foreground">
        <Tag className="h-4 w-4 shrink-0 -rotate-90" />
        <p className="text-xs font-semibold sm:text-sm">
          DESCONTO <span className="font-bold">via PIX ou Dinheiro:</span>{" "}
          <span className="font-extrabold">{formatBRL(pixPrice)}</span>
        </p>
      </div>

      {/* Modelo / Amperagem */}
      <div className="border-b border-border px-4 py-3 text-center text-sm sm:text-base">
        <span className="text-muted-foreground">Modelo: </span>
        <span className="font-bold text-foreground">{battery.name}</span>
        <span className="mx-2 text-muted-foreground">/</span>
        <span className="text-muted-foreground">Amperagem: </span>
        <span className="font-bold text-foreground">{battery.amperage} Ah</span>
      </div>

      {/* Cidade */}
      <div className="flex items-center gap-3 border-b border-border px-4 py-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/10">
          <Truck className="h-4 w-4 text-primary" />
        </div>
        <p className="flex-1 text-sm font-semibold text-foreground">{city}</p>
      </div>

      {/* Veículo */}
      {vehicleLabel && (
        <div className="flex items-center gap-3 border-b border-border px-4 py-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/10">
            <ShieldCheck className="h-4 w-4 text-primary" />
          </div>
          <p className="flex-1 text-sm font-semibold text-foreground">{vehicleLabel}</p>
        </div>
      )}

      {/* Benefícios */}
      <ul className="divide-y divide-border">
        <li className="flex items-center gap-3 px-4 py-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-awr-green/10">
            <Truck className="h-4 w-4 text-awr-green" />
          </div>
          <p className="text-sm">
            <span className="font-bold text-accent">GRÁTIS</span>{" "}
            <span className="text-foreground">entrega, teste e instalação</span>
          </p>
        </li>
        <li className="flex items-center gap-3 px-4 py-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/10">
            <CreditCard className="h-4 w-4 text-primary" />
          </div>
          <p className="text-sm text-foreground">
            Pagamento na entrega:{" "}
            <span className="font-bold text-accent">
              aceitamos cartão, PIX ou dinheiro
            </span>
          </p>
        </li>
        <li className="flex items-center gap-3 px-4 py-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/10">
            <ShieldCheck className="h-4 w-4 text-primary" />
          </div>
          <p className="text-sm text-foreground">
            <span className="font-bold text-accent">{battery.warranty} meses</span> de garantia
          </p>
        </li>
      </ul>

      {/* CTA principal */}
      <div className="space-y-2 p-4">
        <Button
          onClick={onBuy}
          size="lg"
          className="h-12 w-full justify-between gap-2 bg-accent text-base font-bold uppercase tracking-wide text-accent-foreground hover:bg-accent/90"
        >
          <span className="flex-1 text-center">Peça agora sua bateria!</span>
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <ArrowRight className="h-4 w-4" />
          </span>
        </Button>
        <Button
          asChild
          variant="outline"
          className="h-11 w-full gap-2 border-awr-green/50 bg-awr-green/10 text-awr-green hover:bg-awr-green hover:text-white"
        >
          <a href={whatsHref} target="_blank" rel="noopener noreferrer">
            <MessageCircle className="h-4 w-4" />
            Falar no WhatsApp
          </a>
        </Button>
        <p className="pt-1 text-center text-[11px] text-muted-foreground">
          Venda condicionada à devolução da bateria inservível.
        </p>
      </div>
    </article>
  );
}
