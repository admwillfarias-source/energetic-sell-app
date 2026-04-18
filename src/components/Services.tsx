import { Truck, Battery, TestTube, Clock, Wrench, Store } from "lucide-react";

const services = [
  {
    icon: Truck,
    title: "Entrega em 35 min",
    desc: "Entrega rápida em Porto Alegre e 10 cidades da região metropolitana",
  },
  { icon: Battery, title: "Carga de Bateria", desc: "Serviço de carga e recuperação de baterias" },
  {
    icon: TestTube,
    title: "Scanner Automotivo",
    desc: "Diagnóstico com scanner para apresentação da bateria nova e limpeza de DTCs",
  },
  {
    icon: Clock,
    title: "Plantão até 22h",
    desc: "Porto Alegre 6h-22h | Demais cidades 8:30-18h",
  },
  { icon: Wrench, title: "Instalação Grátis", desc: "Instalação profissional sem custo adicional" },
  { icon: Store, title: "6 Lojas", desc: "Pontos de atendimento na região metropolitana" },
];

export default function Services() {
  return (
    <section id="servicos" className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl md:text-4xl font-extrabold text-foreground mb-3">
            Serviços de Bateria Automotiva
          </h2>
          <p className="text-muted-foreground text-lg">
            Entrega, instalação e socorro com baterias Moura, Heliar, Freedom e Global
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {services.map((s, i) => (
            <div
              key={i}
              className="group bg-card rounded-lg shadow-md hover:shadow-lg transition-all hover:-translate-y-1 p-6 text-center"
            >
              <div className="w-14 h-14 rounded-2xl bg-primary/10 group-hover:bg-primary/20 transition-colors flex items-center justify-center mx-auto mb-4">
                <s.icon className="h-7 w-7 text-primary" />
              </div>
              <h3 className="font-bold text-foreground mb-2">{s.title}</h3>
              <p className="text-muted-foreground text-sm">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
