import { Shield, Award, Users, CreditCard, Calendar } from "lucide-react";

const items = [
  { icon: Shield, title: "Instalação Gratuita", desc: "Técnicos vão até você e instalam sem custo" },
  { icon: Award, title: "Garantia até 2 Anos", desc: "Baterias com garantia de fábrica" },
  { icon: Users, title: "Técnicos Especializados", desc: "+15 anos de experiência no mercado" },
  { icon: CreditCard, title: "10x Sem Juros", desc: "Parcelamento facilitado no cartão" },
  { icon: Calendar, title: "+15 Anos de Experiência", desc: "Tradição e confiança no RS" },
];

export default function WhyChoose() {
  return (
    <section className="py-16 md:py-24 bg-secondary text-secondary-foreground">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl md:text-4xl font-extrabold mb-3">
            Por Que Escolher a AWR Baterias
          </h2>
          <p className="text-secondary-foreground/80 text-lg">
            Referência em baterias automotivas no Rio Grande do Sul
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-6 max-w-6xl mx-auto">
          {items.map((item, i) => (
            <div key={i} className="text-center group">
              <div className="w-16 h-16 rounded-2xl bg-primary/20 group-hover:bg-primary/30 transition-colors flex items-center justify-center mx-auto mb-4">
                <item.icon className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-bold mb-1">{item.title}</h3>
              <p className="text-secondary-foreground/80 text-sm">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
