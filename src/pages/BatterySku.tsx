import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Loader2, PackageSearch } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { BatteryCard } from "@/components/BatteryCard";
import { BatteryDetailDialog } from "@/components/BatteryDetailDialog";
import { fetchBatteries } from "@/lib/api/batteries";
import type { Battery } from "@/data/batteries";
import { normalizeSku, looksLikeBatterySku } from "@/lib/batterySku";
import { ensureCatalogLoaded, getFitments } from "@/lib/catalogStore";

export default function BatterySku() {
  const { sku: rawSku = "" } = useParams<{ sku: string }>();
  const sku = useMemo(() => normalizeSku(decodeURIComponent(rawSku)), [rawSku]);

  const [loading, setLoading] = useState(true);
  const [batteries, setBatteries] = useState<Battery[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Battery | null>(null);
  const [vehicles, setVehicles] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        const [list] = await Promise.all([
          fetchBatteries({ codes: [sku], perPage: 30 }),
          ensureCatalogLoaded(),
        ]);
        if (cancelled) return;
        const filtered = list.filter((p) => p.sku?.toUpperCase() === sku);
        setBatteries(filtered.length ? filtered : list);

        // Encontra veículos compatíveis a partir da planilha de fitments.
        const fitments = getFitments();
        const matches = fitments.filter((f) =>
          [f.skuMoura, f.skuHeliar, f.skuZetta, f.skuExcell]
            .filter(Boolean)
            .some((s) => s!.toUpperCase() === sku),
        );
        const labels = matches.slice(0, 24).map((f) => {
          const yr = f.yearStart === f.yearEnd ? `${f.yearStart}` : `${f.yearStart}-${f.yearEnd}`;
          return `${f.brand} ${f.model} (${yr})`;
        });
        setVehicles(Array.from(new Set(labels)));
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Erro ao buscar produtos");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [sku]);

  const isValid = looksLikeBatterySku(sku);
  const title = `Bateria ${sku} • Modelos compatíveis | AWR Baterias`;
  const description = `Confira a bateria ${sku}, preços, garantia e veículos compatíveis. Entrega rápida em Porto Alegre e região.`;

  return (
    <>
      <SEO title={title} description={description} canonical={`/bateria/${sku}`} />
      <Header />
      <main className="min-h-[60vh] bg-background pb-16 pt-8">
        <div className="container mx-auto px-4">
          <Button asChild variant="ghost" size="sm" className="mb-4">
            <Link to="/" aria-label="Voltar para a página inicial">
              <ArrowLeft className="mr-1 h-4 w-4" />
              Voltar
            </Link>
          </Button>

          <header className="mb-6">
            <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              <PackageSearch className="h-3.5 w-3.5" />
              Modelo de bateria
            </div>
            <h1 className="font-display text-3xl font-extrabold text-foreground md:text-4xl">
              Bateria {sku}
            </h1>
            <p className="mt-2 max-w-2xl text-muted-foreground">
              {isValid
                ? "Resultados encontrados no catálogo para o código informado, com preços e garantia atualizados."
                : "O código informado não parece um modelo de bateria. Verifique a grafia ou volte à busca."}
            </p>
          </header>

          {loading && (
            <div className="flex items-center gap-2 py-12 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Buscando produtos para {sku}…
            </div>
          )}

          {!loading && error && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
              {error}
            </div>
          )}

          {!loading && !error && batteries.length === 0 && (
            <div className="rounded-lg border border-border bg-card p-8 text-center">
              <p className="font-medium text-foreground">
                Nenhum produto encontrado para {sku}.
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Tente outro código ou faça a busca por veículo na página inicial.
              </p>
              <Button asChild className="mt-4">
                <Link to="/#busca">Buscar por veículo</Link>
              </Button>
            </div>
          )}

          {!loading && !error && batteries.length > 0 && (
            <>
              <p className="mb-4 text-sm text-muted-foreground">
                {batteries.length} resultado{batteries.length > 1 ? "s" : ""} encontrado
                {batteries.length > 1 ? "s" : ""}.
              </p>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {batteries.map((b) => (
                  <BatteryCard key={b.id} battery={b} onSelect={setSelected} />
                ))}
              </div>
            </>
          )}

          {!loading && vehicles.length > 0 && (
            <section className="mt-10 rounded-2xl border border-border bg-card p-5">
              <h2 className="font-display text-lg font-bold text-foreground">
                Veículos compatíveis com {sku}
              </h2>
              <ul className="mt-3 flex flex-wrap gap-2">
                {vehicles.map((v) => (
                  <li
                    key={v}
                    className="rounded-full border border-border bg-background px-3 py-1 text-xs text-foreground"
                  >
                    {v}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </main>
      <Footer />
      <BatteryDetailDialog
        battery={selected}
        onOpenChange={(o) => !o && setSelected(null)}
      />
    </>
  );
}
