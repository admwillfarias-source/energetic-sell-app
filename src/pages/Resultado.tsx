import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, CarFront, Clock, ShieldCheck, Truck, Search } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchBatteriesByVehicle, fetchBatteries, type VehicleBrand } from "@/lib/api/batteries";
import { ensureCatalogLoaded } from "@/lib/catalogStore";
import { BatteryCompactCard } from "@/components/BatteryCompactCard";
import { Battery } from "@/data/batteries";
import { CartProvider } from "@/context/CartContext";
import { CartDrawer } from "@/components/CartDrawer";

export default function Resultado() {
  const [searchParams] = useSearchParams();
  const vehicle = searchParams.get("v") ?? "";
  const codesParam = searchParams.get("codes") ?? "";
  const codes = useMemo(
    () => (codesParam ? codesParam.split(",").map((c) => c.trim()).filter(Boolean) : []),
    [codesParam],
  );

  const [catalogReady, setCatalogReady] = useState(false);
  useEffect(() => {
    ensureCatalogLoaded().then(() => setCatalogReady(true)).catch(() => setCatalogReady(true));
  }, []);

  const { data: results = [], isLoading, isError, refetch } = useQuery({
    queryKey: ["resultado", { codes, vehicle }],
    queryFn: () => {
      if (vehicle && codes.length > 0) {
        const groups: Partial<Record<VehicleBrand, string[]>> = {};
        return fetchBatteriesByVehicle(codes, groups);
      }
      return fetchBatteries({ codes: codes.length ? codes : undefined, perPage: 30 });
    },
    enabled: catalogReady && codes.length > 0,
    staleTime: 5 * 60 * 1000,
  });

  // Ordena por marca (Moura, Zetta, Heliar, Excell) e depois por preço crescente
  const BRAND_ORDER: Record<string, number> = {
    moura: 0,
    zetta: 1,
    heliar: 2,
    excell: 3,
  };
  const sorted = useMemo<Battery[]>(
    () =>
      [...results].sort((a, b) => {
        const oa = BRAND_ORDER[a.brand?.toLowerCase() ?? ""] ?? 99;
        const ob = BRAND_ORDER[b.brand?.toLowerCase() ?? ""] ?? 99;
        if (oa !== ob) return oa - ob;
        return a.price - b.price;
      }),
    [results],
  );

  return (
    <CartProvider>
    <div className="flex min-h-screen flex-col">
      <SEO
        title={vehicle ? `Baterias para ${vehicle} | AWR Baterias` : "Resultado da busca | AWR Baterias"}
        description={`Baterias compatíveis ${vehicle ? `com ${vehicle} ` : ""}com entrega e instalação em até 35 minutos em Porto Alegre. 10x sem juros.`}
      />
      <Header />

      <main className="flex-1 bg-muted/30 pb-12 pt-24">
        <div className="container">
          {/* Breadcrumb / volta */}
          <div className="mb-4 flex items-center gap-2 text-sm">
            <Button asChild variant="ghost" size="sm" className="h-8 gap-1 px-2">
              <Link to="/">
                <ArrowLeft className="h-4 w-4" />
                Voltar
              </Link>
            </Button>
          </div>

          {/* Cabeçalho */}
          <div className="mb-6 rounded-2xl border border-accent/30 bg-gradient-to-br from-accent/15 via-card to-card p-5 shadow-card md:p-7">
            <div className="flex flex-wrap items-center gap-3">
              <div className="rounded-full bg-accent/20 p-2.5">
                <CarFront className="h-5 w-5 text-accent" />
              </div>
              <div className="flex-1">
                <p className="text-[11px] font-bold uppercase tracking-wider text-accent">
                  Resultado da busca
                </p>
                <h1 className="font-display text-xl font-extrabold leading-tight md:text-2xl">
                  {vehicle ? (
                    <>
                      Baterias compatíveis com <span className="text-primary">{vehicle}</span>
                    </>
                  ) : (
                    "Baterias compatíveis"
                  )}
                </h1>
              </div>
              <span className="text-xs text-muted-foreground">
                {sorted.length} {sorted.length === 1 ? "opção" : "opções"}
              </span>
            </div>

            {/* Bullets de confiança */}
            <div className="mt-4 grid grid-cols-1 gap-2 text-xs sm:grid-cols-3">
              <div className="inline-flex items-center gap-1.5 rounded-lg bg-background/60 px-3 py-2">
                <Clock className="h-4 w-4 text-awr-green" />
                <span className="font-semibold">Entrega em 35 min</span>
              </div>
              <div className="inline-flex items-center gap-1.5 rounded-lg bg-background/60 px-3 py-2">
                <Truck className="h-4 w-4 text-primary" />
                <span className="font-semibold">Instalação inclusa</span>
              </div>
              <div className="inline-flex items-center gap-1.5 rounded-lg bg-background/60 px-3 py-2">
                <ShieldCheck className="h-4 w-4 text-primary" />
                <span className="font-semibold">Garantia de fábrica</span>
              </div>
            </div>
          </div>

          {/* Lista */}
          {isLoading || !catalogReady ? (
            <div className="grid gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-44 rounded-2xl" />
              ))}
            </div>
          ) : isError ? (
            <div className="rounded-2xl border border-dashed border-destructive/40 bg-destructive/5 p-10 text-center">
              <p className="text-muted-foreground">Não foi possível carregar as baterias.</p>
              <Button onClick={() => refetch()} variant="outline" className="mt-4">
                Tentar novamente
              </Button>
            </div>
          ) : sorted.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center">
              <Search className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
              <p className="font-medium">Nenhuma bateria encontrada para essa busca.</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Tente outra grafia, inclua o ano ou fale com a gente no WhatsApp.
              </p>
              <Button asChild className="mt-4">
                <Link to="/">Nova busca</Link>
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {sorted.map((b, i) => (
                <BatteryCompactCard
                  key={b.id}
                  battery={b}
                  highlight={i === 0}
                  vehicleLabel={vehicle}
                  priority={i < 4}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
      <CartDrawer />
    </div>
    </CartProvider>
  );
}
