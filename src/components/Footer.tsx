import { Battery as BatteryIcon, MessageCircle, Phone, Mail, Instagram, Facebook } from "lucide-react";

export function Footer() {
  return (
    <footer id="contato" className="bg-primary text-primary-foreground">
      <div className="container py-14">
        <div className="grid gap-10 md:grid-cols-4">
          <div>
            <a href="#inicio" className="flex items-center gap-2">
              <span className="grid h-9 w-9 place-items-center rounded-md bg-gradient-accent">
                <BatteryIcon className="h-5 w-5 text-accent-foreground" strokeWidth={2.5} />
              </span>
              <span className="font-display text-xl font-bold">
                Bateria<span className="text-accent">Já</span>
              </span>
            </a>
            <p className="mt-4 text-sm text-primary-foreground/70">
              Bateria nova entregue e instalada onde você estiver. Atendimento em até 2h.
            </p>
          </div>

          <div>
            <h4 className="mb-4 font-display text-sm font-bold uppercase tracking-wider text-accent">
              Atendimento
            </h4>
            <ul className="space-y-2.5 text-sm text-primary-foreground/80">
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4" /> 0800 123 4567
              </li>
              <li className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4" /> WhatsApp 24h
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4" /> contato@bateriaja.com.br
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 font-display text-sm font-bold uppercase tracking-wider text-accent">
              Empresa
            </h4>
            <ul className="space-y-2.5 text-sm text-primary-foreground/80">
              <li><a href="#inicio" className="hover:text-accent">Sobre nós</a></li>
              <li><a href="#como-funciona" className="hover:text-accent">Como funciona</a></li>
              <li><a href="#catalogo" className="hover:text-accent">Catálogo</a></li>
              <li><a href="#" className="hover:text-accent">Garantia</a></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 font-display text-sm font-bold uppercase tracking-wider text-accent">
              Pagamento
            </h4>
            <p className="text-sm text-primary-foreground/80">
              Pix, cartão de crédito (até 10x), débito ou dinheiro. Pagamento na entrega.
            </p>
            <div className="mt-4 flex gap-3">
              <a href="#" aria-label="Instagram" className="grid h-9 w-9 place-items-center rounded-full bg-primary-foreground/10 hover:bg-accent hover:text-accent-foreground">
                <Instagram className="h-4 w-4" />
              </a>
              <a href="#" aria-label="Facebook" className="grid h-9 w-9 place-items-center rounded-full bg-primary-foreground/10 hover:bg-accent hover:text-accent-foreground">
                <Facebook className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-primary-foreground/10 pt-6 text-center text-xs text-primary-foreground/60">
          © {new Date().getFullYear()} BateriaJá. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  );
}
