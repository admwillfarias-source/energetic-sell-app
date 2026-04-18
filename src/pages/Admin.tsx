import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, LogOut, Search } from "lucide-react";
import { invalidateCatalogCache } from "@/lib/catalogStore";

type DBFit = { id: string; brand: string; model: string; year_start: number; year_end: number; code: string };
type DBEq = { id: string; moura: string[]; heliar: string[]; zetta: string[]; excell: string[]; tudor: string[] };

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
            <span className="text-sm text-muted-foreground">{user.email}</span>
            <Button variant="outline" size="sm" onClick={async () => { await supabase.auth.signOut(); navigate("/"); }} className="gap-1.5">
              <LogOut className="h-4 w-4" /> Sair
            </Button>
          </div>
        </div>
      </header>

      <main className="container py-8">
        <Tabs defaultValue="fitments">
          <TabsList>
            <TabsTrigger value="fitments">Aplicações</TabsTrigger>
            <TabsTrigger value="equivalents">Equivalências</TabsTrigger>
          </TabsList>
          <TabsContent value="fitments" className="mt-6">
            <FitmentsAdmin />
          </TabsContent>
          <TabsContent value="equivalents" className="mt-6">
            <EquivalentsAdmin />
          </TabsContent>
        </Tabs>
      </main>
    </div>
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
          <div><Label>Código Moura</Label><Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Ex: M60AD" /></div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={save}>Salvar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============================ EQUIVALENTS ============================
function EquivalentsAdmin() {
  const [items, setItems] = useState<DBEq[]>([]);
  const [editing, setEditing] = useState<DBEq | null>(null);
  const [open, setOpen] = useState(false);

  const load = async () => {
    const { data, error } = await supabase.from("equivalents").select("*").order("created_at");
    if (error) { toast({ title: "Erro", description: error.message, variant: "destructive" }); return; }
    setItems((data as DBEq[]) ?? []);
  };
  useEffect(() => { load(); }, []);

  const onDelete = async (id: string) => {
    if (!confirm("Excluir esta equivalência?")) return;
    const { error } = await supabase.from("equivalents").delete().eq("id", id);
    if (error) { toast({ title: "Erro", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Excluído" });
    invalidateCatalogCache();
    load();
  };

  return (
    <div>
      <div className="mb-4 flex items-center gap-3">
        <Button onClick={() => { setEditing(null); setOpen(true); }} className="gap-1.5">
          <Plus className="h-4 w-4" /> Adicionar grupo
        </Button>
        <span className="text-sm text-muted-foreground">{items.length} grupos</span>
      </div>

      <div className="grid gap-3">
        {items.map((g) => (
          <div key={g.id} className="rounded-lg border border-border bg-card p-4">
            <div className="grid sm:grid-cols-4 gap-3 text-sm">
              <Pill label="Moura" values={g.moura} />
              <Pill label="Heliar" values={g.heliar} />
              <Pill label="Zetta" values={g.zetta} />
              <Pill label="Excell" values={g.excell} />
            </div>
            <div className="mt-3 flex justify-end gap-2">
              <button onClick={() => { setEditing(g); setOpen(true); }} className="p-1.5 hover:text-primary"><Pencil className="h-4 w-4" /></button>
              <button onClick={() => onDelete(g.id)} className="p-1.5 hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
            </div>
          </div>
        ))}
      </div>

      <EquivalentDialog open={open} onOpenChange={setOpen} item={editing} onSaved={() => { invalidateCatalogCache(); load(); }} />
    </div>
  );
}

function Pill({ label, values }: { label: string; values: string[] }) {
  return (
    <div>
      <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-1 flex flex-wrap gap-1">
        {values.length === 0 ? <span className="text-xs text-muted-foreground italic">—</span> :
          values.map((v) => <span key={v} className="rounded bg-muted px-2 py-0.5 text-xs font-mono">{v}</span>)}
      </div>
    </div>
  );
}

function EquivalentDialog({ open, onOpenChange, item, onSaved }: {
  open: boolean; onOpenChange: (o: boolean) => void; item: DBEq | null; onSaved: () => void;
}) {
  const [moura, setMoura] = useState("");
  const [heliar, setHeliar] = useState("");
  const [zetta, setZetta] = useState("");
  const [excell, setExcell] = useState("");

  useEffect(() => {
    if (open) {
      setMoura(item?.moura.join(", ") ?? "");
      setHeliar(item?.heliar.join(", ") ?? "");
      setZetta(item?.zetta.join(", ") ?? "");
      setExcell(item?.excell.join(", ") ?? "");
    }
  }, [open, item]);

  const parse = (s: string) => s.split(",").map((x) => x.trim()).filter(Boolean);

  const save = async () => {
    const payload = { moura: parse(moura), heliar: parse(heliar), zetta: parse(zetta), excell: parse(excell) };
    if (payload.moura.length === 0) {
      toast({ title: "Adicione pelo menos um código Moura", variant: "destructive" });
      return;
    }
    const { error } = item
      ? await supabase.from("equivalents").update(payload).eq("id", item.id)
      : await supabase.from("equivalents").insert(payload);
    if (error) { toast({ title: "Erro", description: error.message, variant: "destructive" }); return; }
    toast({ title: item ? "Atualizado" : "Adicionado" });
    onOpenChange(false);
    onSaved();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{item ? "Editar equivalência" : "Nova equivalência"}</DialogTitle>
        </DialogHeader>
        <p className="text-xs text-muted-foreground">
          Separe vários códigos por vírgula. Deixe vazio se a marca não tiver equivalente.
        </p>
        <div className="space-y-3">
          <div><Label>Moura</Label><Input value={moura} onChange={(e) => setMoura(e.target.value)} placeholder="M50ED, M50EX" /></div>
          <div><Label>Heliar</Label><Input value={heliar} onChange={(e) => setHeliar(e.target.value)} placeholder="H50GD" /></div>
          <div><Label>Zetta</Label><Input value={zetta} onChange={(e) => setZetta(e.target.value)} placeholder="50ED" /></div>
          <div><Label>Excell</Label><Input value={excell} onChange={(e) => setExcell(e.target.value)} placeholder="(opcional)" /></div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={save}>Salvar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
