import { Phone, ShoppingCart, Award } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";

export function Header() {
  const { items, setOpen } = useCart();
  const count = items.reduce((s, i) => s + i.quantity, 0);

  return (
    <header className="fixed inset-x-0 top-0 z-[70] bg-secondary border-b border-border">
      <div className="container mx-auto px-3 h-12 flex items-center justify-between gap-2">
        <div className="flex items-center gap-3 min-w-0">
          <a href="#inicio" className="font-display text-xl font-extrabold text-secondary-foreground whitespace-nowrap">
            AWR <span className="text-primary">Baterias</span>
          </a>
          <span
            className="hidden md:inline-flex items-center gap-1.5 rounded-full bg-accent/15 border border-accent/30 px-2.5 py-1 text-[11px] font-semibold text-accent"
            aria-label="Empresa atuando desde 2009 com mais de 1500 clientes"
          >
            <Award className="h-3 w-3" aria-hidden="true" />
            Desde 2009 · +1500 clientes
          </span>
        </div>
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-secondary-foreground/90">
          <Link to="/catalogo" className="hover:text-primary transition-colors">Catálogo</Link>
          <Link to="/servicos" className="hover:text-primary transition-colors">Serviços</Link>
          
          <a href="#contato" className="hover:text-primary transition-colors">Contato</a>
        </nav>
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm" className="text-secondary-foreground hidden sm:inline-flex hover:bg-accent/20 hover:text-accent">
            <a href="tel:+555135165472" target="_top" aria-label="Ligar para AWR Baterias">
              <Phone className="h-4 w-4 mr-2" />(51) 3516-5472
            </a>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setOpen(true)}
            className="relative"
            data-debug-id="open-cart"
            aria-label="Abrir carrinho"
          >
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
