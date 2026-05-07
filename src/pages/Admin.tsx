import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, LogOut, Search, MessageSquare, Send, ShieldCheck } from "lucide-react";
import { invalidateCatalogCache } from "@/lib/catalogStore";

type DBFit = { id: string; brand: string; model: string; year_start: number; year_end: number; code: string };

export default function Admin() {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) navigate("/auth");
  }, [loading, user, navigate]);

  if (loading) return <div className="min-h-screen grid place-items-center">Carregando...</div>;
  if (!user) return null;
  if (!isAdmin) {
    return (
      <div className="min-h-screen grid place-items-center p-6 text-center">
        <div>
          <h1 className="text-xl font-bold mb-2">Acesso restrito</h1>
          <p className="text-muted-foreground mb-4">
            Sua conta ({user.email}) não tem permissão de administrador.
          </p>
          <Button variant="outline" onClick={async () => { await supabase.auth.signOut(); navigate("/auth"); }}>
            Sair
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container flex items-center justify-between py-4">
          <h1 className="font-display text-xl font-bold">Administração do Catálogo</h1>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => navigate("/admin/validacao-skus")} className="gap-1.5">
              <ShieldCheck className="h-4 w-4" /> Validar SKUs
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigate("/admin/whatsapp-test")} className="gap-1.5">
              <Send className="h-4 w-4" /> Teste WhatsApp
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigate("/admin/whatsapp-logs")} className="gap-1.5">
              <MessageSquare className="h-4 w-4" /> Logs WhatsApp
            </Button>
            <span className="text-sm text-muted-foreground">{user.email}</span>
            <Button variant="outline" size="sm" onClick={async () => { await supabase.auth.signOut(); navigate("/"); }} className="gap-1.5">
              <LogOut className="h-4 w-4" /> Sair
            </Button>
          </div>
        </div>
      </header>

      <main className="container py-8 space-y-10">
        <PriorityBrandsAdmin />
        <FitmentsAdmin />
      </main>
    </div>
  );
}

// ============================ PRIORITY BRANDS ============================
import { Checkbox } from "@/components/ui/checkbox";
import { ALL_BRANDS, getPriorityBrands, setPriorityBrands } from "@/lib/priorityBrands";

function PriorityBrandsAdmin() {
  const [selected, setSelected] = useState<string[]>(() => getPriorityBrands());

  const toggle = (brand: string) => {
    setSelected((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand],
    );
  };

  const save = () => {
    setPriorityBrands(selected);
    toast({ title: "Marcas em destaque salvas" });
  };

  return (
    <section className="rounded-lg border border-border bg-card p-5">
      <h2 className="font-display text-lg font-bold">Marcas em destaque (1ª página)</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Selecione quais marcas devem aparecer primeiro no bloco "Mais vendidas".
      </p>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {ALL_BRANDS.map((brand) => (
          <label
            key={brand}
            className="flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-sm cursor-pointer hover:bg-muted/50"
          >
            <Checkbox
              checked={selected.includes(brand)}
              onCheckedChange={() => toggle(brand)}
            />
            <span>{brand}</span>
          </label>
        ))}
      </div>
      <div className="mt-4 flex justify-end">
        <Button onClick={save}>Salvar</Button>
      </div>
    </section>
  );
}

// ============================ FITMENTS ============================
function FitmentsAdmin() {
  const [items, setItems] = useState<DBFit[]>([]);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<DBFit | null>(null);
  const [open, setOpen] = useState(false);

  const load = async () => {
    const { data, error } = await supabase.from("fitments").select("*").order("brand").order("model").order("year_start");
    if (error) { toast({ title: "Erro", description: error.message, variant: "destructive" }); return; }
    setItems((data as DBFit[]) ?? []);
  };
  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter((i) =>
      `${i.brand} ${i.model} ${i.code}`.toLowerCase().includes(q),
    );
  }, [items, search]);

  const onDelete = async (id: string) => {
    if (!confirm("Excluir esta aplicação?")) return;
    const { error } = await supabase.from("fitments").delete().eq("id", id);
    if (error) { toast({ title: "Erro", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Excluído" });
    invalidateCatalogCache();
    load();
  };

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por marca, modelo ou código" className="pl-9" />
        </div>
        <Button onClick={() => { setEditing(null); setOpen(true); }} className="gap-1.5">
          <Plus className="h-4 w-4" /> Adicionar
        </Button>
        <span className="text-sm text-muted-foreground">{filtered.length} de {items.length}</span>
      </div>

      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left">
            <tr>
              <th className="px-3 py-2">Marca</th>
              <th className="px-3 py-2">Modelo</th>
              <th className="px-3 py-2">Anos</th>
              <th className="px-3 py-2">Código</th>
              <th className="px-3 py-2 w-24"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.slice(0, 500).map((i) => (
              <tr key={i.id} className="border-t border-border hover:bg-muted/30">
                <td className="px-3 py-2">{i.brand}</td>
                <td className="px-3 py-2">{i.model}</td>
                <td className="px-3 py-2">{i.year_start}–{i.year_end}</td>
                <td className="px-3 py-2 font-mono">{i.code}</td>
                <td className="px-3 py-2 text-right">
                  <button onClick={() => { setEditing(i); setOpen(true); }} className="p-1.5 hover:text-primary"><Pencil className="h-4 w-4" /></button>
                  <button onClick={() => onDelete(i.id)} className="p-1.5 hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length > 500 && (
          <div className="p-2 text-center text-xs text-muted-foreground">Mostrando 500 de {filtered.length} — refine a busca</div>
        )}
      </div>

      <FitmentDialog open={open} onOpenChange={setOpen} item={editing} onSaved={() => { invalidateCatalogCache(); load(); }} />
    </div>
  );
}

function FitmentDialog({ open, onOpenChange, item, onSaved }: {
  open: boolean; onOpenChange: (o: boolean) => void; item: DBFit | null; onSaved: () => void;
}) {
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [yearStart, setYearStart] = useState("");
  const [yearEnd, setYearEnd] = useState("");
  const [code, setCode] = useState("");

  useEffect(() => {
    if (open) {
      setBrand(item?.brand ?? "");
      setModel(item?.model ?? "");
      setYearStart(item ? String(item.year_start) : "");
      setYearEnd(item ? String(item.year_end) : "");
      setCode(item?.code ?? "");
    }
  }, [open, item]);

  const save = async () => {
    const ys = Number(yearStart);
    const ye = Number(yearEnd);
    if (!brand.trim() || !model.trim() || !code.trim() || !ys || !ye || ys > ye) {
      toast({ title: "Preencha todos os campos corretamente", variant: "destructive" });
      return;
    }
    const payload = { brand: brand.trim(), model: model.trim(), year_start: ys, year_end: ye, code: code.trim().toUpperCase() };
    const { error } = item
      ? await supabase.from("fitments").update(payload).eq("id", item.id)
      : await supabase.from("fitments").insert(payload);
    if (error) { toast({ title: "Erro", description: error.message, variant: "destructive" }); return; }
    toast({ title: item ? "Atualizado" : "Adicionado" });
    onOpenChange(false);
    onSaved();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{item ? "Editar aplicação" : "Nova aplicação"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Marca</Label><Input value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="Ex: Fiat" /></div>
            <div><Label>Modelo</Label><Input value={model} onChange={(e) => setModel(e.target.value)} placeholder="Ex: Cronos" /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Ano inicial</Label><Input type="number" value={yearStart} onChange={(e) => setYearStart(e.target.value)} placeholder="2018" /></div>
            <div><Label>Ano final</Label><Input type="number" value={yearEnd} onChange={(e) => setYearEnd(e.target.value)} placeholder="2024" /></div>
          </div>
          <div><Label>Código da bateria</Label><Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Ex: HAGM60HD" /></div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={save}>Salvar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
