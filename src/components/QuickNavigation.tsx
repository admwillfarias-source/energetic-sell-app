import { useState } from "react";
import { Link } from "react-router-dom";
import { MapPin, Car, TrendingUp, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cityPages } from "@/data/cityContent";
import { vehiclePages } from "@/data/vehicles";

const allCities = cityPages.map((c) => ({
  name: c.name,
  slug: c.slug,
  badge: c.deliveryTime,
}));

const initialNeighborhoods = [
  { name: "Menino Deus" },
  { name: "Moinhos de Vento" },
  { name: "Petrópolis" },
  { name: "Centro Histórico" },
  { name: "Cidade Baixa" },
  { name: "Bom Fim" },
  { name: "Cristal" },
  { name: "Tristeza" },
];

const allPoaNeighborhoods =
  cityPages.find((c) => c.slug === "porto-alegre")?.neighborhoods || [];

const popularVehicles = vehiclePages.slice(0, 6);

export default function QuickNavigation() {
  const [showAllCities, setShowAllCities] = useState(false);
  const [showAllNeighborhoods, setShowAllNeighborhoods] = useState(false);
  const [showAllVehicles, setShowAllVehicles] = useState(false);

  const displayedNeighborhoods = showAllNeighborhoods
    ? allPoaNeighborhoods.map((n) => ({ name: n }))
    : initialNeighborhoods;

  const displayedCities = showAllCities ? allCities : allCities.slice(0, 6);
  const displayedVehicles = showAllVehicles ? vehiclePages : popularVehicles;

  return (
    <section className="py-10 md:py-14 bg-muted" id="navegacao-rapida">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-primary/10 rounded-full px-4 py-1.5 mb-3">
            <TrendingUp className="h-4 w-4 text-primary" />
            <span className="text-primary font-semibold text-sm">Mais Buscados</span>
          </div>
          <h2 className="font-display text-2xl md:text-3xl font-extrabold text-foreground">
            Encontre Rápido
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div>
            <h3 className="flex items-center gap-2 font-bold text-foreground mb-4">
              <MapPin className="h-4 w-4 text-primary" /> Cidades Atendidas
            </h3>
            <div className="flex flex-col gap-2">
              {displayedCities.map((c) => (
                <Link
                  key={c.slug}
                  to={`/baterias/${c.slug}`}
                  className="flex items-center justify-between bg-card border border-border rounded-lg px-4 py-2.5 hover:border-primary/40 hover:shadow-sm transition-all group"
                >
                  <span className="font-medium text-foreground group-hover:text-primary transition-colors text-sm">
                    {c.name}
                  </span>
                  <span className="text-xs bg-primary/10 text-primary rounded-full px-2 py-0.5 font-medium">
                    {c.badge}
                  </span>
                </Link>
              ))}
            </div>
            {!showAllCities && allCities.length > 6 && (
              <Button
                variant="outline"
                size="sm"
                className="w-full mt-3 gap-2 text-xs"
                onClick={() => setShowAllCities(true)}
              >
                <Search className="h-3.5 w-3.5" /> Ver Todas as Cidades
              </Button>
            )}
          </div>

          <div>
            <h3 className="flex items-center gap-2 font-bold text-foreground mb-4">
              <MapPin className="h-4 w-4 text-primary" /> Bairros em Porto Alegre
            </h3>
            <div className="flex flex-col gap-2">
              {displayedNeighborhoods.map((n) => (
                <a
                  key={n.name}
                  href="#catalogo"
                  className="flex items-center bg-card border border-border rounded-lg px-4 py-2.5 hover:border-primary/40 hover:shadow-sm transition-all group"
                >
                  <span className="font-medium text-foreground group-hover:text-primary transition-colors text-sm">
                    {n.name}
                  </span>
                </a>
              ))}
            </div>
            {!showAllNeighborhoods &&
              allPoaNeighborhoods.length > initialNeighborhoods.length && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-3 gap-2 text-xs"
                  onClick={() => setShowAllNeighborhoods(true)}
                >
                  <Search className="h-3.5 w-3.5" /> Ver Mais Bairros
                </Button>
              )}
          </div>

          <div>
            <h3 className="flex items-center gap-2 font-bold text-foreground mb-4">
              <Car className="h-4 w-4 text-primary" /> Veículos Populares
            </h3>
            <div className="flex flex-col gap-2">
              {displayedVehicles.map((v) => (
                <a
                  key={v.slug}
                  href="#catalogo"
                  className="flex items-center bg-card border border-border rounded-lg px-4 py-2.5 hover:border-primary/40 hover:shadow-sm transition-all group"
                >
                  <span className="font-medium text-foreground group-hover:text-primary transition-colors text-sm">
                    Bateria para {v.make} {v.model}
                  </span>
                </a>
              ))}
            </div>
            {!showAllVehicles && (
              <Button
                variant="outline"
                size="sm"
                className="w-full mt-3 gap-2 text-xs"
                onClick={() => setShowAllVehicles(true)}
              >
                <Search className="h-3.5 w-3.5" /> Ver Mais Veículos
              </Button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
