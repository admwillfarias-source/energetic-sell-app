import { lazy, Suspense, useEffect, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useCart, formatBRL } from "@/context/CartContext";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import batteryImg from "@/assets/battery-product.webp";

const checkoutImport = () =>
  import("@/components/CheckoutDialog").then((m) => ({ default: m.CheckoutDialog }));
const CheckoutDialog = lazy(checkoutImport);

// Preload no idle para abrir instantâneo ao clicar em "Peça agora"
if (typeof window !== "undefined") {
  const preload = () => checkoutImport();
  if ("requestIdleCallback" in window) {
    (window as any).requestIdleCallback(preload, { timeout: 2500 });
  } else {
    setTimeout(preload, 1500);
  }
}

export function CartDrawer() {
  const { items, isOpen, setOpen, setQuantity, remove, subtotal } = useCart();
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  useEffect(() => {
    const handler = () => {
      setOpen(false);
      setCheckoutOpen(true);
    };
    window.addEventListener("open-checkout", handler);
    return () => window.removeEventListener("open-checkout", handler);
  }, [setOpen]);

  const checkout = () => setCheckoutOpen(true);

  return (
    <>
    <Sheet open={isOpen} onOpenChange={setOpen}>
      <SheetContent side="right" className="flex w-full flex-col p-0 sm:max-w-md">
        <SheetHeader className="border-b border-border p-6">
          <SheetTitle className="font-display text-xl">Seu carrinho</SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
            <div className="mb-4 grid h-16 w-16 place-items-center rounded-full bg-secondary">
              <ShoppingBag className="h-7 w-7 text-muted-foreground" />
            </div>
            <p className="font-display text-lg font-bold">Carrinho vazio</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Adicione uma bateria para continuar.
            </p>
            <Button onClick={() => setOpen(false)} variant="outline" className="mt-6">
              Ver catálogo
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-6">
              <ul className="space-y-4">
                {items.map((it) => (
                  <li
                    key={it.battery.id}
                    className="flex gap-3 rounded-xl border border-border bg-card p-3"
                  >
                    <div className="grid h-20 w-20 shrink-0 place-items-center rounded-lg bg-secondary p-2">
                      <img
                        src={batteryImg}
                        alt={it.battery.name}
                        className="h-full w-full object-contain"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="font-display text-sm font-bold leading-tight">
                        {it.battery.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {it.battery.brand} • {it.battery.amperage}Ah
                      </p>

                      <div className="mt-2 flex items-center justify-between">
                        <div className="flex items-center gap-1 rounded-md border border-border">
                          <button
                            onClick={() => setQuantity(it.battery.id, it.quantity - 1)}
                            className="grid h-7 w-7 place-items-center text-muted-foreground hover:text-foreground"
                            aria-label="Diminuir"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="w-6 text-center text-sm font-semibold">
                            {it.quantity}
                          </span>
                          <button
                            onClick={() => setQuantity(it.battery.id, it.quantity + 1)}
                            className="grid h-7 w-7 place-items-center text-muted-foreground hover:text-foreground"
                            aria-label="Aumentar"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <span className="font-display text-sm font-bold">
                          {formatBRL(it.battery.price * it.quantity)}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => remove(it.battery.id)}
                      className="self-start text-muted-foreground hover:text-destructive"
                      aria-label="Remover"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="border-t border-border bg-secondary/30 p-6">
              <div className="mb-1 flex items-center justify-between text-sm text-muted-foreground">
                <span>Instalação</span>
                <span className="font-medium text-success">Grátis</span>
              </div>
              <div className="mb-4 flex items-center justify-between">
                <span className="font-display font-bold">Subtotal</span>
                <span className="font-display text-2xl font-bold">{formatBRL(subtotal)}</span>
              </div>
              <Button
                onClick={checkout}
                size="lg"
                className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
              >
                Finalizar pedido
              </Button>
              <p className="mt-2 text-center text-xs text-muted-foreground">
                Pagamento na entrega • Pix, cartão ou dinheiro
              </p>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
    {checkoutOpen && (
      <Suspense fallback={null}>
        <CheckoutDialog open={checkoutOpen} onOpenChange={setCheckoutOpen} />
      </Suspense>
    )}
    </>
  );
}
