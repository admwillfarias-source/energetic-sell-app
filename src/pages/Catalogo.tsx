import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { CartProvider } from "@/context/CartContext";
import { Header } from "@/components/Header";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { fetchBatteries } from "@/lib/api/batteries";
import { Battery } from "@/data/batteries";
import { BatteryMouraCard } from "@/components/BatteryMouraCard";
import { brandPages } from "@/data/brandContent";
import { amperagePages } from "@/data/amperageContent";
import { Filter, ChevronRight, MessageCircle, X } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger,
} from "@/components/ui/sheet";
import {
  breadcrumbLd, organizationLd, SITE_URL,
} from "@/lib/seoSchemas";

const Footer = lazy(() => import("@/components/Footer").then((m) => ({ default: m.Footer })));
const CartDrawer = lazy(() => import("@/components/CartDrawer").then((m) => ({ default: m.CartDrawer })));
const FloatingWhatsApp = lazy(() => import("@/components/FloatingWhatsApp"));

const BRANDS = ["Moura", "Heliar", "Excell", "Zetta", "Freedom", "Eletran"] as const;
const AH_BUCKETS = [
  { label: "Até 50Ah", min: 0, max: 50 },
  { label: "50–60Ah", min: 50, max: 60 },
  { label: "60–70Ah", min: 60, max: 70 },
  { label: "70–90Ah", min: 70, max: 90 },
  { label: "90Ah+", min: 90, max: 9999 },
];

const WHATS_HREF =
  "https://wa.me/5551993199486?text=Ol%C3%A1!%20Quero%20ver%20o%20cat%C3%A1logo%20de%20baterias.";

function FiltersUI({
  selectedBrands, toggleBrand,
  selectedBuckets, toggleBucket,
  clear,
}: {
  selectedBrands: Set<string>;
  toggleBrand: (b: string) => void;
  selectedBuckets: Set<string>;
  toggleBucket: (b: string) => void;
  clear: () => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-foreground">Marca</h3>
          {(selectedBrands.size > 0 || selectedBuckets.size > 0) && (
            <button onClick={clear} className="text-xs text-primary hover:underline">Limpar</button>
          )}
        </div>
        <div className="space-y-2">
          {BRANDS.map((b) => (
            <label key={b} className="flex items-center gap-2 text-sm cursor-pointer">
              <Checkbox
                checked={selectedBrands.has(b)}
                onCheckedChange={() => toggleBrand(b)}
              />
              <span>{b}</span>
            </label>
          ))}
        </div>
      </div>
      <div>
        <h3 className="font-semibold text-foreground mb-3">Amperagem</h3>
        <div className="flex flex-wrap gap-2">
          {AH_BUCKETS.map((b) => {
            const active = selectedBuckets.has(b.label);
            return (
              <button
                key={b.label}
                onClick={() => toggleBucket(b.label)}
                className={
                  "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors " +
                  (active
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-foreground hover:border-primary")
                }
              >
                {b.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function Catalogo() {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  const isMobile = useIsMobile();
  const PER_PAGE = isMobile ? 4 : 8;
  const [page, setPage] = useState(1);

  const [selectedBrands, setSelectedBrands] = useState<Set<string>>(new Set());
  const [selectedBuckets, setSelectedBuckets] = useState<Set<string>>(new Set());

  const toggleBrand = (b: string) => {
    setPage(1);
    setSelectedBrands((s) => {
      const n = new Set(s); n.has(b) ? n.delete(b) : n.add(b); return n;
    });
  };
  const toggleBucket = (b: string) => {
    setPage(1);
    setSelectedBuckets((s) => {
      const n = new Set(s); n.has(b) ? n.delete(b) : n.add(b); return n;
    });
  };
  const clear = () => { setPage(1); setSelectedBrands(new Set()); setSelectedBuckets(new Set()); };

  const { data: batteries = [], isLoading, isError, refetch } = useQuery({
    queryKey: ["catalog-all"],
    queryFn: () => fetchBatteries({ perPage: 100 }),
    staleTime: 5 * 60 * 1000,
  });

  const filtered = useMemo(() => {
    return batteries.filter((b) => {
      if (selectedBrands.size > 0 && !selectedBrands.has(b.brand)) return false;
      if (selectedBuckets.size > 0) {
        const bucket = AH_BUCKETS.find((x) => b.amperage >= x.min && b.amperage < x.max);
        if (!bucket || !selectedBuckets.has(bucket.label)) return false;
      }
      return true;
    });
  }, [batteries, selectedBrands, selectedBuckets]);

  const grouped = useMemo(() => {
    const map = new Map<string, Battery[]>();
    for (const b of filtered) {
      if (!map.has(b.brand)) map.set(b.brand, []);
      map.get(b.brand)!.push(b);
    }
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [filtered]);

  const canonical = `${SITE_URL}/catalogo`;
  const title = "Catálogo de Baterias | Moura, Heliar, Excell e Zetta | AWR";
  const description =
    "Catálogo completo de baterias automotivas: Moura, Heliar, Excell, Zetta e mais. Filtre por marca e amperagem. Entrega e instalação grátis em Porto Alegre.";

  const itemListLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: filtered.slice(0, 30).map((b, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: `${b.brand} ${b.name} ${b.amperage}Ah`,
    })),
  };

  const jsonLd = [
    breadcrumbLd([
      { name: "Início", url: SITE_URL },
      { name: "Catálogo", url: canonical },
    ]),
    organizationLd(),
    itemListLd,
  ];

  return (
    <CartProvider>
      <SEO title={title} description={description} canonical={canonical} jsonLd={jsonLd} />
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-[116px] lg:pt-16">
          {/* Hero */}
          <section className="bg-secondary text-secondary-foreground py-10 md:py-14">
            <div className="container mx-auto px-4">
              <h1 className="font-display text-3xl md:text-4xl font-extrabold mb-2">
                Catálogo de baterias automotivas
              </h1>
              <p className="text-secondary-foreground/85 max-w-2xl">
                Moura, Heliar, Excell, Zetta e mais. Entrega e instalação grátis em até 35 minutos
                em Porto Alegre e região metropolitana.
              </p>
            </div>
          </section>

          {/* Conteúdo */}
          <section className="py-8 md:py-10">
            <div className="container mx-auto px-4">
              {/* Filtros mobile */}
              <div className="lg:hidden mb-4 flex items-center justify-between gap-2">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Filter className="h-4 w-4 mr-2" />
                      Filtros
                      {(selectedBrands.size + selectedBuckets.size) > 0 && (
                        <span className="ml-2 rounded-full bg-primary text-primary-foreground text-xs px-2 py-0.5">
                          {selectedBrands.size + selectedBuckets.size}
                        </span>
                      )}
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-80">
                    <SheetHeader>
                      <SheetTitle>Filtrar baterias</SheetTitle>
                    </SheetHeader>
                    <div className="mt-6">
                      <FiltersUI
                        selectedBrands={selectedBrands}
                        toggleBrand={toggleBrand}
                        selectedBuckets={selectedBuckets}
                        toggleBucket={toggleBucket}
                        clear={clear}
                      />
                    </div>
                  </SheetContent>
                </Sheet>
                <span className="text-sm text-muted-foreground">
                  {isLoading ? "..." : `${filtered.length} produtos`}
                </span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-8">
                {/* Sidebar desktop */}
                <aside className="hidden lg:block">
                  <div className="sticky top-24 rounded-2xl border border-border bg-card p-5">
                    <FiltersUI
                      selectedBrands={selectedBrands}
                      toggleBrand={toggleBrand}
                      selectedBuckets={selectedBuckets}
                      toggleBucket={toggleBucket}
                      clear={clear}
                    />
                  </div>
                </aside>

                {/* Grid de produtos */}
                <div>
                  {isLoading && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                      {Array.from({ length: 6 }).map((_, i) => (
                        <Skeleton key={i} className="h-72 w-full rounded-2xl" />
                      ))}
                    </div>
                  )}

                  {isError && (
                    <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-center">
                      <p className="text-destructive font-semibold mb-3">Erro ao carregar o catálogo.</p>
                      <Button onClick={() => refetch()}>Tentar novamente</Button>
                    </div>
                  )}

                  {!isLoading && !isError && filtered.length === 0 && (
                    <div className="rounded-xl border border-border bg-card p-8 text-center">
                      <p className="text-foreground font-semibold mb-2">
                        Nenhuma bateria encontrada com esses filtros.
                      </p>
                      <Button variant="outline" onClick={clear}>
                        <X className="h-4 w-4 mr-2" /> Limpar filtros
                      </Button>
                    </div>
                  )}

                  {!isLoading && !isError && grouped.map(([brand, list]) => (
                    <div key={brand} className="mb-10">
                      <div className="flex items-end justify-between mb-4">
                        <h2 className="font-display text-xl md:text-2xl font-extrabold text-foreground">
                          Baterias {brand}
                        </h2>
                        <Link
                          to={`/baterias/marca/${brand.toLowerCase()}`}
                          className="text-sm text-primary hover:underline inline-flex items-center"
                        >
                          Ver mais <ChevronRight className="h-4 w-4" />
                        </Link>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                        {list.map((b) => (
                          <BatteryMouraCard key={b.id} battery={b} />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Hub SEO */}
          <section className="py-12 bg-muted/30 border-t border-border">
            <div className="container mx-auto px-4">
              <h2 className="font-display text-xl md:text-2xl font-extrabold text-foreground mb-6">
                Navegue por marca ou amperagem
              </h2>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="font-semibold text-foreground mb-3">Marcas</h3>
                  <div className="flex flex-wrap gap-2">
                    {brandPages.map((b) => (
                      <Link
                        key={b.slug}
                        to={`/baterias/marca/${b.slug}`}
                        className="rounded-full border border-border bg-card px-3 py-1.5 text-sm hover:border-primary transition-colors"
                      >
                        {b.name}
                      </Link>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-3">Amperagem</h3>
                  <div className="flex flex-wrap gap-2">
                    {amperagePages.map((a) => (
                      <Link
                        key={a.slug}
                        to={`/baterias/amperagem/${a.slug}`}
                        className="rounded-full border border-border bg-card px-3 py-1.5 text-sm hover:border-primary transition-colors"
                      >
                        {a.ah}Ah
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="py-12 bg-primary text-primary-foreground text-center">
            <div className="container mx-auto px-4">
              <h2 className="font-display text-xl md:text-2xl font-extrabold mb-3">
                Não encontrou? Fale conosco
              </h2>
              <p className="mb-5 text-primary-foreground/90">
                Diga seu carro e ano — nós encontramos a bateria certa em segundos.
              </p>
              <Button asChild size="lg" className="bg-awr-green hover:bg-awr-green/90 text-awr-green-foreground font-bold">
                <a href={WHATS_HREF} target="_top" rel="noopener noreferrer">
                  <MessageCircle className="h-5 w-5 mr-2" /> Falar no WhatsApp
                </a>
              </Button>
            </div>
          </section>
        </main>
        <Suspense fallback={null}>
          <Footer />
          <CartDrawer />
          <FloatingWhatsApp />
        </Suspense>
      </div>
    </CartProvider>
  );
}
