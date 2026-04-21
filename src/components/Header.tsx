import { Phone, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";

export function Header() {
  const { items, setOpen } = useCart();
  const count = items.reduce((s, i) => s + i.quantity, 0);

  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-secondary/95 backdrop-blur border-b border-border">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <a href="#inicio" className="font-display text-xl font-extrabold text-secondary-foreground">
          AWR <span className="text-primary">Baterias</span>
        </a>
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-secondary-foreground/90">
          <a href="#catalogo" className="hover:text-primary transition-colors">Catálogo</a>
          <a href="#servicos" className="hover:text-primary transition-colors">Serviços</a>
          <a href="#contato" className="hover:text-primary transition-colors">Contato</a>
        </nav>
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm" className="text-secondary-foreground hidden sm:inline-flex">
            <a href="tel:+555135165472"><Phone className="h-4 w-4 mr-2" />(51) 3516-5472</a>
          </Button>
          <Button variant="outline" size="sm" onClick={() => setOpen(true)} className="relative" data-debug-id="open-cart">
            <ShoppingCart className="h-4 w-4" />
            {count > 0 && (
              <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                {count}
              </span>
            )}
          </Button>
        </div>
      </div>
    </header>
  );
}
