// Conteúdo SEO por amperagem (Ah).
// /baterias/amperagem/:ah

export interface AmperagePageData {
  /** ex: "60" */
  slug: string;
  /** ex: 60 */
  ah: number;
  tagline: string;
  description: string;
  /** Carros típicos que usam essa amperagem. */
  typicalCars: string[];
  /** Faixa de preço textual. */
  priceRange: string;
  faq: { q: string; a: string }[];
}

export const amperagePages: AmperagePageData[] = [
  {
    slug: "45",
    ah: 45,
    tagline: "Para hatches compactos e carros 1.0 antigos.",
    description:
      "Bateria 45Ah é indicada para carros populares 1.0 mais antigos e motos de grande porte. A AWR entrega e instala 45Ah em Gravataí, Porto Alegre e região com garantia de fábrica.",
    typicalCars: ["Fiat Uno Mille", "VW Gol 1.0 antigo", "Chevrolet Celta 1.0", "Fiat Palio 1.0 antigo"],
    priceRange: "R$ 340 - R$ 420",
    faq: [
      { q: "45Ah serve no meu carro?", a: "Confira o manual do veículo. 45Ah é indicada para carros 1.0 antigos sem muitos acessórios elétricos." },
    ],
  },
  {
    slug: "50",
    ah: 50,
    tagline: "Para hatches e sedãs compactos modernos.",
    description:
      "A bateria 50Ah atende a maior parte dos hatches 1.0 modernos e sedãs compactos. Instalação grátis e entrega em até 35 minutos em Gravataí.",
    typicalCars: ["Onix 1.0", "HB20 1.0", "Mobi", "Kwid", "Renault Logan 1.0"],
    priceRange: "R$ 360 - R$ 480",
    faq: [
      { q: "Diferença entre 50Ah e 60Ah?", a: "60Ah tem mais capacidade e dura mais em carros com vidro elétrico, ar-condicionado e som." },
    ],
  },
  {
    slug: "60",
    ah: 60,
    tagline: "A amperagem mais comum no Brasil — serve na maioria dos carros 1.0 a 1.6.",
    description:
      "A 60Ah é a bateria mais vendida no Brasil. Atende Onix, HB20, Gol, Polo, Fiesta, Strada, Saveiro e a maioria dos carros 1.0 a 1.6. Marcas: Moura, Heliar, Zetta, Excell. Entrega e instalação grátis em Gravataí, Porto Alegre, Canoas e Cachoeirinha.",
    typicalCars: ["Onix 1.0/1.4", "HB20 1.0/1.6", "Gol 1.0/1.6", "Polo 1.0", "Strada", "Saveiro", "Fiat Argo", "Sandero"],
    priceRange: "R$ 380 - R$ 580",
    faq: [
      { q: "Bateria 60Ah Moura preço?", a: "A Moura 60Ah em Gravataí parte de R$ 380, com instalação grátis e nota fiscal." },
      { q: "60Ah serve em SUV?", a: "Em SUVs pequenos sim. Em SUVs maiores ou com start-stop, geralmente é necessário 70Ah ou mais." },
    ],
  },
  {
    slug: "70",
    ah: 70,
    tagline: "Para sedãs médios, SUVs e carros com muitos acessórios.",
    description:
      "A 70Ah é indicada para Corolla, Civic, Cruze, HRV, Compass, Renegade, Toro e a maioria dos SUVs e sedãs médios. A AWR entrega 70Ah Moura, Heliar e Zetta com instalação grátis em Gravataí e região.",
    typicalCars: ["Corolla", "Civic", "Cruze", "HRV", "Compass", "Renegade", "Toro", "Tracker"],
    priceRange: "R$ 480 - R$ 780",
    faq: [
      { q: "70Ah ou 75Ah, qual escolher?", a: "Verifique o manual. 75Ah é comum em start-stop básico (EFB)." },
    ],
  },
  {
    slug: "75",
    ah: 75,
    tagline: "EFB para carros com sistema start-stop básico.",
    description:
      "A 75Ah, geralmente em tecnologia EFB, atende carros com start-stop básico — maior parte da linha VW, Renault e Fiat moderna. Não substitua por bateria comum sob risco de perda da função start-stop.",
    typicalCars: ["VW Polo TSI", "VW Virtus", "T-Cross", "Nivus", "Renault Captur", "Fiat Cronos start-stop"],
    priceRange: "R$ 700 - R$ 1.100",
    faq: [
      { q: "Posso trocar 75Ah EFB por comum?", a: "Não recomendado. EFB é projetada para alta ciclagem do start-stop. Comum vai degradar rápido." },
    ],
  },
  {
    slug: "100",
    ah: 100,
    tagline: "Para utilitários, picapes médias e SUVs grandes.",
    description:
      "A 100Ah atende picapes como S10, Hilux, Ranger, Amarok e SUVs grandes. Também usada em motorhomes e veículos com muitos acessórios elétricos. Entrega na grande POA com instalação grátis.",
    typicalCars: ["S10", "Hilux", "Ranger", "Amarok", "L200 Triton", "Trailblazer", "SW4"],
    priceRange: "R$ 750 - R$ 1.300",
    faq: [
      { q: "100Ah AGM ou comum?", a: "Depende do veículo. Hilux/Ranger modernas pedem AGM por causa do start-stop." },
    ],
  },
  {
    slug: "150",
    ah: 150,
    tagline: "Para caminhões leves e ônibus.",
    description:
      "A 150Ah é indicada para caminhões leves, micro-ônibus e veículos comerciais. Marcas Moura, Heliar e Zetta com garantia de fábrica.",
    typicalCars: ["VW Delivery", "Mercedes Accelo", "Iveco Daily", "Micro-ônibus"],
    priceRange: "R$ 1.100 - R$ 1.700",
    faq: [
      { q: "150Ah dá partida em caminhão grande?", a: "Para caminhões médios sim. Caminhões pesados geralmente usam duas 180Ah em série." },
    ],
  },
  {
    slug: "180",
    ah: 180,
    tagline: "Para caminhões médios e pesados.",
    description:
      "A 180Ah é a bateria padrão para caminhões médios e pesados, ônibus rodoviários e máquinas agrícolas. A AWR atende frotas em Gravataí e região com pronta entrega.",
    typicalCars: ["VW Constellation", "Mercedes Atego", "Scania frontal", "Volvo FH (par)"],
    priceRange: "R$ 1.300 - R$ 2.000",
    faq: [
      { q: "Vendem aos pares para caminhão?", a: "Sim, fornecemos par de baterias 180Ah com instalação inclusa." },
    ],
  },
];

export function getAmperageBySlug(slug: string): AmperagePageData | undefined {
  return amperagePages.find((a) => a.slug === slug);
}
