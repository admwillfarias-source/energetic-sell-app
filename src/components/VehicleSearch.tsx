import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Car } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getCarBrands, getModels, getYears, findCompatibleCodes } from "@/lib/fitments";
import { toast } from "@/hooks/use-toast";

export default function VehicleSearch() {
  const navigate = useNavigate();
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");

  const carBrands = useMemo(() => getCarBrands(), []);
  const models = useMemo(() => getModels(brand), [brand]);
  const years = useMemo(() => getYears(brand, model), [brand, model]);

  const onSearch = () => {
    if (!brand || !model || !year) {
      toast({
        title: "Selecione veículo, modelo e ano",
        description: "Precisamos dessas informações para encontrar a bateria certa.",
      });
      return;
    }
    const codes = findCompatibleCodes(brand, model, year);
    if (codes.length === 0) {
      toast({
        title: "Nenhuma bateria encontrada",
        description: `Não temos aplicação cadastrada para ${brand} ${model} ${year}.`,
      });
      return;
    }
    const vehicle = `${brand} ${model} ${year}`;
    toast({ title: "Buscando baterias compatíveis", description: vehicle });
    navigate(`/?codes=${encodeURIComponent(codes.join(","))}&v=${encodeURIComponent(vehicle)}#catalogo`);
    setTimeout(() => document.getElementById("catalogo")?.scrollIntoView({ behavior: "smooth" }), 50);
  };

  return (
    <section id="busca" className="py-12 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto rounded-2xl bg-card border border-border shadow-lg p-6 md:p-8">
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 bg-primary/10 rounded-full px-4 py-1.5 mb-3">
              <Car className="h-4 w-4 text-primary" />
              <span className="text-primary font-semibold text-sm">Busca por Veículo</span>
            </div>
            <h2 className="font-display text-2xl md:text-3xl font-extrabold text-foreground">
              Encontre a bateria do seu carro
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Selecione marca, modelo e ano do veículo.
            </p>
          </div>

          <div className="grid gap-3 md:grid-cols-4 md:items-end">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-muted-foreground">Marca</label>
              <Select
                value={brand}
                onValueChange={(v) => {
                  setBrand(v);
                  setModel("");
                  setYear("");
                }}
              >
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent className="max-h-72">
                  {carBrands.map((b) => (
                    <SelectItem key={b} value={b}>{b}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-muted-foreground">Modelo</label>
              <Select
                value={model}
                onValueChange={(v) => { setModel(v); setYear(""); }}
                disabled={!brand}
              >
                <SelectTrigger className="h-11">
                  <SelectValue placeholder={brand ? "Selecione" : "Marca primeiro"} />
                </SelectTrigger>
                <SelectContent className="max-h-72">
                  {models.map((m) => (
                    <SelectItem key={m} value={m}>{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-muted-foreground">Ano</label>
              <Select value={year} onValueChange={setYear} disabled={!model}>
                <SelectTrigger className="h-11">
                  <SelectValue placeholder={model ? "Selecione" : "Modelo primeiro"} />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {years.map((y) => (
                    <SelectItem key={y} value={y}>{y}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              size="lg"
              onClick={onSearch}
              className="h-11 w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Search className="h-4 w-4" />
              Buscar
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
