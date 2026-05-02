// Conteúdo SEO por marca de bateria.
// Usado em /baterias/marca/:slug e nos links do rodapé.

export interface BrandPageData {
  slug: string;
  name: string;
  /** Tagline curta. */
  tagline: string;
  /** Descrição rica (300-500 chars) para SEO. */
  description: string;
  /** Linhas de produto da marca. */
  lines: { name: string; description: string }[];
  /** Faixa de preço textual. */
  priceRange: string;
  /** Garantia padrão. */
  warranty: string;
  /** Origem/fabricante. */
  origin: string;
  /** FAQ específico da marca. */
  faq: { q: string; a: string }[];
}

export const brandPages: BrandPageData[] = [
  {
    slug: "moura",
    name: "Moura",
    tagline: "Líder nacional em baterias automotivas, com tecnologia EFB e AGM para start-stop.",
    description:
      "A Moura é referência absoluta em baterias automotivas no Brasil. Com fábrica em Belo Jardim (PE) e mais de 65 anos de história, oferece linhas para carros populares, premium, start-stop, caminhões, motos e nobreak. A AWR Baterias é revendedora autorizada Moura, com entrega e instalação grátis em Porto Alegre, Gravataí, Cachoeirinha, Canoas e região.",
    lines: [
      { name: "Moura Eficiência", description: "Linha clássica para uso comum, 12-24 meses de garantia." },
      { name: "Moura EFB", description: "Para carros com sistema start-stop básico, maior ciclagem." },
      { name: "Moura AGM", description: "Para carros premium com start-stop avançado, freios regenerativos." },
    ],
    priceRange: "R$ 380 - R$ 1.800",
    warranty: "12 a 24 meses",
    origin: "Brasil (Belo Jardim - PE)",
    faq: [
      { q: "Quanto custa uma bateria Moura 60Ah?", a: "Em Gravataí e região, a Moura 60Ah varia entre R$ 380 e R$ 480, com instalação grátis e nota fiscal." },
      { q: "Quanto tempo dura uma bateria Moura?", a: "A vida útil média é de 2 a 4 anos, dependendo do uso, da tecnologia (comum, EFB ou AGM) e das condições do veículo." },
      { q: "A bateria Moura tem garantia?", a: "Sim, todas as Moura têm garantia de fábrica de 12 a 24 meses, conforme a linha." },
    ],
  },
  {
    slug: "heliar",
    name: "Heliar",
    tagline: "Tradição alemã da Clarios — equipamento original de várias montadoras.",
    description:
      "A Heliar pertence ao grupo Clarios e é equipamento original de fábrica em montadoras como Volkswagen, Ford e GM. Tem fábricas em Sorocaba (SP) e oferece linhas para carros populares, EFB, AGM e baterias para caminhão. A AWR entrega Heliar em toda a região metropolitana de Porto Alegre com instalação no local.",
    lines: [
      { name: "Heliar Original", description: "Linha primária para carros leves, 12-18 meses de garantia." },
      { name: "Heliar Free Service", description: "Sem manutenção, ideal para carros modernos." },
      { name: "Heliar AGM", description: "Para start-stop premium e veículos com alta demanda elétrica." },
    ],
    priceRange: "R$ 400 - R$ 2.000",
    warranty: "12 a 24 meses",
    origin: "Brasil (Sorocaba - SP / Clarios)",
    faq: [
      { q: "Heliar é melhor que Moura?", a: "Ambas são marcas premium e equipam carros zero km. A escolha depende da homologação do seu veículo e do orçamento." },
      { q: "Bateria Heliar 60Ah preço?", a: "A Heliar 60Ah em Gravataí parte de R$ 400, com instalação grátis e garantia de fábrica." },
    ],
  },
  {
    slug: "zetta",
    name: "Zetta",
    tagline: "Custo-benefício do grupo Moura — qualidade Moura por menos.",
    description:
      "A Zetta é fabricada pelo Grupo Moura em Belo Jardim (PE) e oferece o melhor custo-benefício do mercado. Com a mesma tecnologia da Moura básica, é a opção mais econômica para quem quer marca confiável sem pagar mais. Garantia de 12 meses e entrega grátis em Gravataí, Cachoeirinha e Porto Alegre.",
    lines: [
      { name: "Zetta", description: "Linha única, foco em custo-benefício, 12 meses de garantia." },
    ],
    priceRange: "R$ 350 - R$ 700",
    warranty: "12 meses",
    origin: "Brasil (Grupo Moura)",
    faq: [
      { q: "Zetta é boa?", a: "Sim, é fabricada pelo Grupo Moura na mesma planta. Diferença está na garantia (12 meses) e no preço." },
      { q: "Zetta 60Ah preço?", a: "A Zetta 60Ah em Gravataí parte de R$ 350, instalação grátis." },
    ],
  },
  {
    slug: "freedom",
    name: "Freedom",
    tagline: "Linha estacionária para nobreak, sistemas solares e tração.",
    description:
      "Freedom é a linha estacionária da Heliar/Clarios, ideal para nobreaks, energia solar fotovoltaica e equipamentos de tração. Possui ciclo profundo e maior durabilidade em descargas constantes. Disponível em diversas amperagens com entrega na grande Porto Alegre.",
    lines: [
      { name: "Freedom DF", description: "Estacionária para nobreak e sistemas solares off-grid." },
    ],
    priceRange: "R$ 600 - R$ 2.500",
    warranty: "12 meses",
    origin: "Brasil (Clarios)",
    faq: [
      { q: "Freedom serve para carro?", a: "Não. Freedom é estacionária, indicada para nobreak, solar e tração — não para partida de motor." },
    ],
  },
  {
    slug: "excell",
    name: "Excell",
    tagline: "Tradição gaúcha em baterias automotivas com bom custo-benefício.",
    description:
      "A Excell é uma das marcas tradicionais do Sul do Brasil, com produção e logística próximas. Oferece linhas para carros leves, utilitários e caminhões, com garantia de 12 a 18 meses. A AWR é revendedora oficial Excell em Porto Alegre, Gravataí e região.",
    lines: [
      { name: "Excell Premium", description: "Linha automotiva selada, 12-18 meses de garantia." },
    ],
    priceRange: "R$ 360 - R$ 900",
    warranty: "12 a 18 meses",
    origin: "Brasil",
    faq: [
      { q: "Excell é confiável?", a: "Sim, é uma marca tradicional do Sul com boa aceitação em frotas e veículos populares." },
    ],
  },
  {
    slug: "eletran",
    name: "Eletran",
    tagline: "Linha econômica para uso comum, com garantia de fábrica.",
    description:
      "Eletran oferece baterias automotivas com bom custo-benefício para carros populares e utilitários. Garantia de fábrica e entrega em toda a região metropolitana de Porto Alegre.",
    lines: [{ name: "Eletran", description: "Linha automotiva, 12 meses de garantia." }],
    priceRange: "R$ 340 - R$ 650",
    warranty: "12 meses",
    origin: "Brasil",
    faq: [
      { q: "Eletran tem garantia?", a: "Sim, 12 meses de garantia de fábrica contra defeitos de fabricação." },
    ],
  },
  {
    slug: "global",
    name: "Global",
    tagline: "Bateria importada com tecnologia AGM/EFB para start-stop.",
    description:
      "Global é uma marca importada que oferece linhas EFB e AGM para start-stop a preços competitivos. Indicada para carros premium e SUVs modernos. Disponível para entrega em Porto Alegre, Gravataí e Canoas.",
    lines: [
      { name: "Global EFB", description: "Para start-stop básico." },
      { name: "Global AGM", description: "Para start-stop avançado e SUVs premium." },
    ],
    priceRange: "R$ 700 - R$ 2.200",
    warranty: "12 a 18 meses",
    origin: "Importada",
    faq: [
      { q: "Global serve no meu carro?", a: "Sim, desde que respeite a amperagem e polaridade homologada. Consulte pelo WhatsApp." },
    ],
  },
];

export function getBrandBySlug(slug: string): BrandPageData | undefined {
  return brandPages.find((b) => b.slug === slug);
}
