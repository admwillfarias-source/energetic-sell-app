import { Phone, MessageCircle, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { cityPages } from "@/data/cityContent";
import { brandPages } from "@/data/brandContent";
import { amperagePages } from "@/data/amperageContent";
import { handleCallClick } from "@/lib/tracking";
import PaymentMethods from "@/components/PaymentMethods";

// Pré-carrega o chunk da página de cidade ao passar o mouse no link.
const prefetchCity = () => {
  void import("@/pages/City.tsx");
};

const links = [
  { label: "Início", href: "/" },
  { label: "Serviços", href: "/servicos" },
  { label: "Catálogo", href: "/catalogo" },
  { label: "Blog", href: "/blog" },
  { label: "Contato", href: "#contato" },
];

export function Footer() {
  return (
    <footer id="contato" className="bg-secondary text-secondary-foreground py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-5 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-display font-extrabold text-lg">
                A
              </span>
              <span className="font-display font-bold text-xl">
                AWR <span className="text-primary">Baterias</span>
              </span>
            </div>
            <p className="text-secondary-foreground/60 text-sm mb-4">
              +15 anos atendendo a região metropolitana de Porto Alegre com qualidade e agilidade.
            </p>
            <p className="flex items-center gap-2 text-secondary-foreground/60 text-sm">
              <Clock className="h-4 w-4" aria-hidden="true" />
              POA: 6h-22h | Demais: 8:30-18h
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-bold mb-4">Navegação</h4>
            <nav className="flex flex-col gap-2">
              {links.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  className="text-secondary-foreground/60 hover:text-primary transition-colors text-sm"
                >
                  {l.label}
                </a>
              ))}
            </nav>
          </div>

          {/* City Pages */}
          <div>
            <h4 className="font-bold mb-4">Cidades</h4>
            <nav className="flex flex-col gap-2">
              {cityPages.map((c) => (
                <Link
                  key={c.slug}
                  to={`/baterias/${c.slug}`}
                  onMouseEnter={prefetchCity}
                  onFocus={prefetchCity}
                  className="text-secondary-foreground/60 hover:text-primary transition-colors text-sm"
                >
                  Bateria em {c.name} <span className="text-secondary-foreground/40">• {c.deliveryTime}</span>
                </Link>
              ))}
            </nav>
          </div>

          {/* Brands + Amperagens */}
          <div>
            <h4 className="font-bold mb-4">Marcas</h4>
            <nav className="flex flex-col gap-2">
              {brandPages.map((b) => (
                <Link
                  key={b.slug}
                  to={`/baterias/marca/${b.slug}`}
                  className="text-secondary-foreground/60 hover:text-primary transition-colors text-sm"
                >
                  Bateria {b.name}
                </Link>
              ))}
            </nav>
            <h4 className="font-bold mt-6 mb-3">Amperagens</h4>
            <div className="flex flex-wrap gap-1.5">
              {amperagePages.map((a) => (
                <Link
                  key={a.slug}
                  to={`/baterias/amperagem/${a.slug}`}
                  className="rounded-full border border-border px-2.5 py-0.5 text-xs text-secondary-foreground/70 hover:border-primary hover:text-primary"
                >
                  {a.ah}Ah
                </Link>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold mb-4">Contato</h4>
            <div className="space-y-3">
              <a
                href="tel:+555135165472"
                onClick={(event) => handleCallClick(event, "home", "footer")}
                className="flex items-center gap-2 text-secondary-foreground/60 hover:text-accent transition-colors text-sm"
              >
                <Phone className="h-4 w-4" aria-hidden="true" /> (51) 3516-5472
              </a>
              <a
                href="https://wa.me/5551993199486"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-secondary-foreground/60 hover:text-primary transition-colors text-sm"
              >
                <MessageCircle className="h-4 w-4" aria-hidden="true" /> WhatsApp
              </a>
              <p className="flex items-start gap-2 text-secondary-foreground/60 text-sm">
                📍 6 lojas na região metropolitana
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-border pt-6 mb-6">
          <PaymentMethods />
        </div>

        <div className="border-t border-border pt-6 text-center text-secondary-foreground/40 text-sm pb-20 lg:pb-0">
          © {new Date().getFullYear()} AWR Baterias. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  );
}

export default Footer;
