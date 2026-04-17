import { Battery } from "@/data/batteries";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useCart, formatBRL } from "@/context/CartContext";
import { ShoppingCart, ShieldCheck, Zap, Check, ExternalLink } from "lucide-react";
import batteryImg from "@/assets/battery-product.png";
import { toast } from "@/hooks/use-toast";

type Props = {
  battery: Battery | null;
  onOpenChange: (open: boolean) => void;
};

export function BatteryDetailDialog({ battery, onOpenChange }: Props) {
  const { add, setOpen } = useCart();

  if (!battery) return null;

  const onBuy = () => {
    add(battery);
    toast({ title: "Adicionada ao carrinho", description: battery.name });
    onOpenChange(false);
    setOpen(true);
  };

  return (
    <Dialog open={!!battery} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl overflow-hidden p-0">
        <div className="grid md:grid-cols-2">
          <div className="flex aspect-square items-center justify-center bg-secondary/60 p-8">
            <img
              src={batteryImg}
              alt={battery.name}
              className="h-full w-full object-contain"
              width={500}
              height={500}
            />
          </div>

          <div className="flex flex-col p-6 md:p-8">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              {battery.brand}
            </span>
            <DialogTitle className="mt-1 font-display text-2xl font-bold leading-tight">
              {battery.name}
            </DialogTitle>
            <DialogDescription className="mt-2 text-sm">
              {battery.description}
            </DialogDescription>

            <div className="mt-5 flex flex-wrap gap-3 text-sm">
              <span className="inline-flex items-center gap-1.5 rounded-md bg-secondary px-3 py-1.5">
                <Zap className="h-4 w-4 text-accent" />
                {battery.amperage}Ah
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-md bg-secondary px-3 py-1.5">
                <ShieldCheck className="h-4 w-4 text-accent" />
                {battery.warranty} meses de garantia
              </span>
            </div>

            <div className="mt-5">
              <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Características
              </h4>
              <ul className="space-y-1.5">
                {battery.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-success" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-5">
              <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Compatível com
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {battery.compatibility.map((c) => (
                  <span
                    key={c}
                    className="rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground"
                  >
                    {c}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-auto pt-6">
              <div className="flex items-baseline gap-2">
                {battery.oldPrice && (
                  <span className="text-sm text-muted-foreground line-through">
                    {formatBRL(battery.oldPrice)}
                  </span>
                )}
                <span className="font-display text-3xl font-bold">
                  {formatBRL(battery.price)}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">ou 10x sem juros</p>
              <Button
                onClick={onBuy}
                size="lg"
                className="mt-4 w-full gap-2 bg-accent text-accent-foreground hover:bg-accent/90"
              >
                <ShoppingCart className="h-4 w-4" />
                Adicionar ao carrinho
              </Button>
              {battery.permalink && (
                <a
                  href={battery.permalink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex w-full items-center justify-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
                >
                  <ExternalLink className="h-4 w-4" />
                  Ver no site original
                </a>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
