import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft, Download, Play, Search } from "lucide-react";

type Fitment = {
  id: string;
  brand: string;
  model: string;
  year_start: number;
  year_end: number;
  code: string;
  sku_heliar: string | null;
  sku_moura: string | null;
  sku_zetta: string | null;
  sku_excell: string | null;
};

type SkuStatus = "ok" | "missing" | "empty";

type FitmentReport = Fitment & {
  statuses: Record<"heliar" | "moura" | "zetta" | "excell", SkuStatus>;
  missingSkus: string[];
  hasAnyDelivery: boolean;
};

const BRAND_KEYS = ["heliar", "moura", "zetta", "excell"] as const;
type BrandKey = typeof BRAND_KEYS[number];

const SKU_FIELD: Record<BrandKey, keyof Fitment> = {
  heliar: "sku_heliar",
  moura: "sku_moura",
  zetta: "sku_zetta",
  excell: "sku_excell",
};

// Mesmas variantes aceitas pelo wc-products edge function
function skuVariants(term: string): string[] {
  const t = term.trim().toUpperCase();
  if (!t) return [];
  const set = new Set<string>([t]);
  if (t.startsWith("HEFB")) set.add(t.replace(/^HEFB/, "EFB"));
  if (t.startsWith("HFB")) set.add(t.replace(/^HFB/, "EFB"));
  if (t.startsWith("EFB")) set.add(`H${t}`);
  if (t.startsWith("HAGM")) set.add(t.replace(/^HAGM/, "AGM"));
  if (t.startsWith("AGM")) set.add(`H${t}`);
  if (t.startsWith("HS")) set.add(t.replace(/^HS/, "H"));
  return Array.from(set);
}

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

export default function SkuValidation() {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();

  const [fitments, setFitments] = useState<Fitment[]>([]);
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressTotal, setProgressTotal] = useState(0);
  const [availableSkus, setAvailableSkus] = useState<Set<string> | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "no-delivery" | "partial">("no-delivery");

  useEffect(() => {
    if (!loading && !user) navigate("/auth");
  }, [loading, user, navigate]);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("fitments")
        .select("id,brand,model,year_start,year_end,code,sku_heliar,sku_moura,sku_zetta,sku_excell")
        .order("brand").order("model").order("year_start");
      if (error) { toast({ title: "Erro ao carregar fitments", description: error.message, variant: "destructive" }); return; }
      setFitments((data as Fitment[]) ?? []);
    })();
  }, []);

  const allSkus = useMemo(() => {
    const s = new Set<string>();
    for (const f of fitments) {
      for (const k of BRAND_KEYS) {
        const v = (f[SKU_FIELD[k]] as string | null)?.trim().toUpperCase();
        if (v) s.add(v);
      }
    }
    return Array.from(s);
  }, [fitments]);

  const runValidation = async () => {
    if (running || !allSkus.length) return;
    setRunning(true);
    setAvailableSkus(null);

    const expanded = Array.from(new Set(allSkus.flatMap(skuVariants)));
    const groups = chunk(expanded, 25);
    setProgress(0);
    setProgressTotal(groups.length);

    const found = new Set<string>();
    try {
      for (let i = 0; i < groups.length; i++) {
        const params = new URLSearchParams({ per_page: "30", codes: groups[i].join(",") });
        const { data, error } = await supabase.functions.invoke<Array<{ sku?: string }>>(
          `wc-products?${params.toString()}`,
          { method: "GET" },
        );
        if (error) {
          console.warn("validation chunk error", error.message);
        } else if (Array.isArray(data)) {
          for (const p of data) {
            const sku = (p.sku ?? "").trim().toUpperCase();
            if (sku) found.add(sku);
          }
        }
        setProgress(i + 1);
      }
      setAvailableSkus(found);
      toast({ title: "Validação concluída", description: `${found.size} SKUs encontrados no WooCommerce` });
    } catch (e) {
      toast({ title: "Erro na validação", description: (e as Error).message, variant: "destructive" });
    } finally {
      setRunning(false);
    }
  };

  const reports: FitmentReport[] = useMemo(() => {
    if (!availableSkus) return [];
    return fitments.map((f) => {
      const statuses = {} as Record<BrandKey, SkuStatus>;
      const missing: string[] = [];
      let hasAny = false;
      for (const k of BRAND_KEYS) {
        const raw = (f[SKU_FIELD[k]] as string | null)?.trim().toUpperCase();
        if (!raw) { statuses[k] = "empty"; continue; }
        const variants = skuVariants(raw);
        const ok = variants.some((v) => availableSkus.has(v));
        statuses[k] = ok ? "ok" : "missing";
        if (ok) hasAny = true;
        else missing.push(raw);
      }
      return { ...f, statuses, missingSkus: missing, hasAnyDelivery: hasAny };
    });
  }, [fitments, availableSkus]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return reports.filter((r) => {
      if (filter === "no-delivery" && r.hasAnyDelivery) return false;
      if (filter === "partial" && (!r.hasAnyDelivery || r.missingSkus.length === 0)) return false;
      if (!q) return true;
      return `${r.brand} ${r.model} ${r.code}`.toLowerCase().includes(q);
    });
  }, [reports, search, filter]);

  const stats = useMemo(() => {
    if (!reports.length) return null;
    const noDelivery = reports.filter((r) => !r.hasAnyDelivery).length;
    const partial = reports.filter((r) => r.hasAnyDelivery && r.missingSkus.length > 0).length;
    const complete = reports.length - noDelivery - partial;
    return { total: reports.length, noDelivery, partial, complete };
  }, [reports]);

  const exportCsv = () => {
    if (!filtered.length) return;
    const header = ["Marca", "Modelo", "Ano Início", "Ano Fim", "Código", "Heliar", "Moura", "Zetta", "Excell", "SKUs sem entrega", "Situação"];
    const rows = filtered.map((r) => [
      r.brand, r.model, r.year_start, r.year_end, r.code,
      `${r.sku_heliar ?? ""} [${r.statuses.heliar}]`,
      `${r.sku_moura ?? ""} [${r.statuses.moura}]`,
      `${r.sku_zetta ?? ""} [${r.statuses.zetta}]`,
      `${r.sku_excell ?? ""} [${r.statuses.excell}]`,
      r.missingSkus.join(" | "),
      r.hasAnyDelivery ? (r.missingSkus.length ? "Parcial" : "OK") : "Sem entrega",
    ]);
    const csv = [header, ...rows].map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `validacao-skus-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) return <div className="min-h-screen grid place-items-center">Carregando...</div>;
  if (!user || !isAdmin) return null;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container flex items-center justify-between py-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate("/admin")} className="gap-1.5">
              <ArrowLeft className="h-4 w-4" /> Voltar
            </Button>
            <h1 className="font-display text-xl font-bold">Validação de SKUs vs WooCommerce</h1>
          </div>
        </div>
      </header>

      <main className="container py-8 space-y-6">
        <section className="rounded-lg border border-border bg-card p-5">
          <p className="text-sm text-muted-foreground">
            Compara os SKUs cadastrados na tabela de aplicações ({fitments.length} aplicações,
            {" "}{allSkus.length} SKUs únicos) com o catálogo do WooCommerce e lista os
            veículos que ficaram sem nenhuma bateria disponível.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Button onClick={runValidation} disabled={running || !allSkus.length} className="gap-1.5">
              <Play className="h-4 w-4" /> {running ? "Validando..." : "Executar validação"}
            </Button>
            {running && progressTotal > 0 && (
              <div className="flex-1 min-w-[200px] max-w-md">
                <Progress value={(progress / progressTotal) * 100} />
                <p className="text-xs text-muted-foreground mt-1">{progress} / {progressTotal} lotes</p>
              </div>
            )}
          </div>
        </section>

        {stats && (
          <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Stat label="Total de aplicações" value={stats.total} />
            <Stat label="Sem entrega" value={stats.noDelivery} tone="destructive" />
            <Stat label="Parcial (alguma marca falta)" value={stats.partial} tone="warning" />
            <Stat label="Completas" value={stats.complete} tone="success" />
          </section>
        )}

        {availableSkus && (
          <section className="rounded-lg border border-border bg-card overflow-hidden">
            <div className="p-4 flex flex-wrap items-center gap-3 border-b border-border">
              <div className="relative flex-1 min-w-[240px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por marca, modelo ou código" className="pl-9" />
              </div>
              <div className="flex gap-1 rounded-md border border-border p-1">
                {(["no-delivery", "partial", "all"] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-3 py-1 text-xs rounded ${filter === f ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
                  >
                    {f === "no-delivery" ? "Sem entrega" : f === "partial" ? "Parciais" : "Todos"}
                  </button>
                ))}
              </div>
              <Button variant="outline" size="sm" onClick={exportCsv} className="gap-1.5" disabled={!filtered.length}>
                <Download className="h-4 w-4" /> Exportar CSV
              </Button>
              <span className="text-sm text-muted-foreground">{filtered.length} resultado(s)</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-left">
                  <tr>
                    <th className="px-3 py-2">Marca</th>
                    <th className="px-3 py-2">Modelo</th>
                    <th className="px-3 py-2">Anos</th>
                    <th className="px-3 py-2">Heliar</th>
                    <th className="px-3 py-2">Moura</th>
                    <th className="px-3 py-2">Zetta</th>
                    <th className="px-3 py-2">Excell</th>
                    <th className="px-3 py-2">Situação</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.slice(0, 1000).map((r) => (
                    <tr key={r.id} className="border-t border-border hover:bg-muted/30">
                      <td className="px-3 py-2 font-medium">{r.brand}</td>
                      <td className="px-3 py-2">{r.model}</td>
                      <td className="px-3 py-2 whitespace-nowrap">{r.year_start}–{r.year_end}</td>
                      {BRAND_KEYS.map((k) => (
                        <td key={k} className="px-3 py-2 font-mono text-xs">
                          <SkuCell value={(r[SKU_FIELD[k]] as string | null) ?? ""} status={r.statuses[k]} />
                        </td>
                      ))}
                      <td className="px-3 py-2">
                        {!r.hasAnyDelivery ? (
                          <span className="rounded bg-destructive/15 text-destructive px-2 py-0.5 text-xs font-medium">Sem entrega</span>
                        ) : r.missingSkus.length ? (
                          <span className="rounded bg-yellow-500/15 text-yellow-700 dark:text-yellow-400 px-2 py-0.5 text-xs font-medium">Parcial</span>
                        ) : (
                          <span className="rounded bg-green-500/15 text-green-700 dark:text-green-400 px-2 py-0.5 text-xs font-medium">OK</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filtered.length > 1000 && (
                <div className="p-2 text-center text-xs text-muted-foreground">Mostrando 1000 de {filtered.length} — refine a busca ou exporte para CSV</div>
              )}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: number; tone?: "destructive" | "warning" | "success" }) {
  const toneClass = tone === "destructive" ? "text-destructive"
    : tone === "warning" ? "text-yellow-700 dark:text-yellow-400"
    : tone === "success" ? "text-green-700 dark:text-green-400"
    : "text-foreground";
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className={`text-2xl font-bold ${toneClass}`}>{value}</div>
    </div>
  );
}

function SkuCell({ value, status }: { value: string; status: SkuStatus }) {
  if (status === "empty") return <span className="text-muted-foreground">—</span>;
  const cls = status === "ok"
    ? "text-green-700 dark:text-green-400"
    : "text-destructive font-semibold";
  return <span className={cls}>{value}</span>;
}
