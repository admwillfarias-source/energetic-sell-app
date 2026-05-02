// Bairros de Porto Alegre detalhados como landing pages SEO.
// Foco inicial: zona norte (expandida) + zona central/sul mais relevantes.
// Cada bairro vira /baterias/porto-alegre/:slug com JSON-LD próprio.

export interface NeighborhoodPageData {
  slug: string;
  name: string;
  city: string; // sempre "Porto Alegre" por enquanto
  cityState: string;
  zone: "Norte" | "Sul" | "Leste" | "Centro" | "Oeste";
  /** Tempo médio de entrega exibido. */
  deliveryTime: string;
  /** Minutos numéricos (para ordenação). */
  deliveryMinutes: number;
  /** Pequena introdução com landmarks para diferenciar do conteúdo da cidade. */
  intro: string;
  /** Vias e referências do bairro (chips). */
  references: string[];
  /** CEP/zona aproximada para JSON-LD. */
  geo: { lat: number; lng: number };
}

const POA_STATE = "RS";

function makeIntro(name: string, landmarks: string): string {
  return `A AWR Baterias entrega e instala baterias automotivas em ${name}, Porto Alegre, com técnicos próprios e baterias Moura, Heliar, Zetta e Excell. Atendemos a região de ${landmarks} com garantia de fábrica, nota fiscal e retirada da bateria antiga inclusa no preço.`;
}

export const neighborhoodPages: NeighborhoodPageData[] = [
  // ===== ZONA NORTE (expandida) =====
  {
    slug: "sarandi",
    name: "Sarandi",
    city: "Porto Alegre",
    cityState: POA_STATE,
    zone: "Norte",
    deliveryTime: "até 35 minutos",
    deliveryMinutes: 35,
    intro: makeIntro("Sarandi", "Av. Assis Brasil, BR-290 e Conjunto Esmeralda"),
    references: ["Av. Assis Brasil", "BR-290", "Esmeralda", "Parque Humaitá"],
    geo: { lat: -29.9876, lng: -51.1265 },
  },
  {
    slug: "rubem-berta",
    name: "Rubem Berta",
    city: "Porto Alegre",
    cityState: POA_STATE,
    zone: "Norte",
    deliveryTime: "até 40 minutos",
    deliveryMinutes: 40,
    intro: makeIntro("Rubem Berta", "Av. Baltazar de Oliveira Garcia e Conjunto Rubem Berta"),
    references: ["Av. Baltazar de Oliveira Garcia", "Estrada do Forte", "Conjunto Rubem Berta"],
    geo: { lat: -29.9714, lng: -51.1612 },
  },
  {
    slug: "humaita",
    name: "Humaitá",
    city: "Porto Alegre",
    cityState: POA_STATE,
    zone: "Norte",
    deliveryTime: "até 30 minutos",
    deliveryMinutes: 30,
    intro: makeIntro("Humaitá", "Av. das Indústrias, Anchieta e Arena do Grêmio"),
    references: ["Av. das Indústrias", "Arena do Grêmio", "Anchieta"],
    geo: { lat: -30.0003, lng: -51.1923 },
  },
  {
    slug: "navegantes",
    name: "Navegantes",
    city: "Porto Alegre",
    cityState: POA_STATE,
    zone: "Norte",
    deliveryTime: "até 25 minutos",
    deliveryMinutes: 25,
    intro: makeIntro("Navegantes", "Av. A. J. Renner, Av. Voluntários da Pátria e DC Shopping"),
    references: ["Av. A. J. Renner", "Av. Voluntários da Pátria", "DC Shopping", "Estação Trensurb"],
    geo: { lat: -29.9985, lng: -51.2025 },
  },
  {
    slug: "sao-geraldo",
    name: "São Geraldo",
    city: "Porto Alegre",
    cityState: POA_STATE,
    zone: "Norte",
    deliveryTime: "até 25 minutos",
    deliveryMinutes: 25,
    intro: makeIntro("São Geraldo", "Av. Brasil, Av. Cristóvão Colombo e Cais Mauá"),
    references: ["Av. Brasil", "Av. Cristóvão Colombo", "Cais Mauá"],
    geo: { lat: -30.0123, lng: -51.2174 },
  },
  {
    slug: "anchieta",
    name: "Anchieta",
    city: "Porto Alegre",
    cityState: POA_STATE,
    zone: "Norte",
    deliveryTime: "até 30 minutos",
    deliveryMinutes: 30,
    intro: makeIntro("Anchieta", "Aeroporto Salgado Filho, Av. Sertório e Polo Industrial"),
    references: ["Aeroporto Salgado Filho", "Av. Sertório", "Polo Industrial"],
    geo: { lat: -29.9844, lng: -51.1815 },
  },
  {
    slug: "passo-d-areia",
    name: "Passo d'Areia",
    city: "Porto Alegre",
    cityState: POA_STATE,
    zone: "Norte",
    deliveryTime: "até 30 minutos",
    deliveryMinutes: 30,
    intro: makeIntro("Passo d'Areia", "Av. Plínio Brasil Milano, Parque Alim Pedro e Av. Assis Brasil"),
    references: ["Av. Plínio Brasil Milano", "Parque Alim Pedro", "Av. Assis Brasil"],
    geo: { lat: -30.0024, lng: -51.1742 },
  },
  {
    slug: "cristo-redentor",
    name: "Cristo Redentor",
    city: "Porto Alegre",
    cityState: POA_STATE,
    zone: "Norte",
    deliveryTime: "até 30 minutos",
    deliveryMinutes: 30,
    intro: makeIntro("Cristo Redentor", "Av. Assis Brasil, Av. Plínio Brasil Milano e Bourbon Shopping"),
    references: ["Av. Assis Brasil", "Bourbon Wallig", "Av. Plínio Brasil Milano"],
    geo: { lat: -29.9947, lng: -51.1668 },
  },
  {
    slug: "jardim-lindoia",
    name: "Jardim Lindóia",
    city: "Porto Alegre",
    cityState: POA_STATE,
    zone: "Norte",
    deliveryTime: "até 35 minutos",
    deliveryMinutes: 35,
    intro: makeIntro("Jardim Lindóia", "Av. Assis Brasil, Parque Estadual e Av. Sertório"),
    references: ["Av. Assis Brasil", "Av. Sertório", "Parque Estadual"],
    geo: { lat: -29.9828, lng: -51.1714 },
  },
  {
    slug: "sao-joao",
    name: "São João",
    city: "Porto Alegre",
    cityState: POA_STATE,
    zone: "Norte",
    deliveryTime: "até 25 minutos",
    deliveryMinutes: 25,
    intro: makeIntro("São João", "Av. Farrapos, Av. Brasil e Trensurb São Pedro"),
    references: ["Av. Farrapos", "Av. Brasil", "Trensurb São Pedro"],
    geo: { lat: -30.0016, lng: -51.1925 },
  },
  {
    slug: "vila-ipiranga",
    name: "Vila Ipiranga",
    city: "Porto Alegre",
    cityState: POA_STATE,
    zone: "Norte",
    deliveryTime: "até 30 minutos",
    deliveryMinutes: 30,
    intro: makeIntro("Vila Ipiranga", "Av. Assis Brasil, Av. Bahia e Parque Mascarenhas"),
    references: ["Av. Assis Brasil", "Av. Bahia", "Parque Mascarenhas"],
    geo: { lat: -29.9967, lng: -51.1593 },
  },
  {
    slug: "higienopolis",
    name: "Higienópolis",
    city: "Porto Alegre",
    cityState: POA_STATE,
    zone: "Norte",
    deliveryTime: "até 25 minutos",
    deliveryMinutes: 25,
    intro: makeIntro("Higienópolis", "Av. Cristóvão Colombo, Hospital Conceição e Hospital Cristo Redentor"),
    references: ["Av. Cristóvão Colombo", "Hospital Conceição", "Hospital Cristo Redentor"],
    geo: { lat: -30.0094, lng: -51.2025 },
  },
  {
    slug: "boa-vista",
    name: "Boa Vista",
    city: "Porto Alegre",
    cityState: POA_STATE,
    zone: "Norte",
    deliveryTime: "até 25 minutos",
    deliveryMinutes: 25,
    intro: makeIntro("Boa Vista", "Av. Carlos Gomes, Iguatemi e Hospital Mãe de Deus Center"),
    references: ["Av. Carlos Gomes", "Iguatemi", "Hospital Mãe de Deus"],
    geo: { lat: -30.0182, lng: -51.1846 },
  },

  // ===== CENTRO =====
  {
    slug: "centro-historico",
    name: "Centro Histórico",
    city: "Porto Alegre",
    cityState: POA_STATE,
    zone: "Centro",
    deliveryTime: "até 25 minutos",
    deliveryMinutes: 25,
    intro: makeIntro("Centro Histórico", "Mercado Público, Praça da Alfândega e Usina do Gasômetro"),
    references: ["Mercado Público", "Praça da Alfândega", "Usina do Gasômetro"],
    geo: { lat: -30.0298, lng: -51.2284 },
  },
  {
    slug: "moinhos-de-vento",
    name: "Moinhos de Vento",
    city: "Porto Alegre",
    cityState: POA_STATE,
    zone: "Centro",
    deliveryTime: "até 20 minutos",
    deliveryMinutes: 20,
    intro: makeIntro("Moinhos de Vento", "Rua Padre Chagas, Hospital Moinhos e Parque Moinhos"),
    references: ["Rua Padre Chagas", "Hospital Moinhos", "Parque Moinhos"],
    geo: { lat: -30.0237, lng: -51.2074 },
  },
  {
    slug: "auxiliadora",
    name: "Auxiliadora",
    city: "Porto Alegre",
    cityState: POA_STATE,
    zone: "Centro",
    deliveryTime: "até 20 minutos",
    deliveryMinutes: 20,
    intro: makeIntro("Auxiliadora", "Av. Carlos Gomes, Av. Independência e Bourbon Country"),
    references: ["Av. Carlos Gomes", "Av. Independência", "Bourbon Country"],
    geo: { lat: -30.0218, lng: -51.2003 },
  },
  {
    slug: "petropolis",
    name: "Petrópolis",
    city: "Porto Alegre",
    cityState: POA_STATE,
    zone: "Leste",
    deliveryTime: "até 25 minutos",
    deliveryMinutes: 25,
    intro: makeIntro("Petrópolis", "Av. Protásio Alves, Hospital Mãe de Deus e PUCRS"),
    references: ["Av. Protásio Alves", "Hospital Mãe de Deus", "PUCRS"],
    geo: { lat: -30.0394, lng: -51.1782 },
  },
  {
    slug: "bela-vista",
    name: "Bela Vista",
    city: "Porto Alegre",
    cityState: POA_STATE,
    zone: "Centro",
    deliveryTime: "até 25 minutos",
    deliveryMinutes: 25,
    intro: makeIntro("Bela Vista", "Praça Carlos Simão Arnt, Goethe e Iguatemi"),
    references: ["Praça da Encol", "Av. Goethe", "Iguatemi"],
    geo: { lat: -30.0258, lng: -51.1953 },
  },
  // ===== SUL =====
  {
    slug: "tristeza",
    name: "Tristeza",
    city: "Porto Alegre",
    cityState: POA_STATE,
    zone: "Sul",
    deliveryTime: "até 35 minutos",
    deliveryMinutes: 35,
    intro: makeIntro("Tristeza", "Av. Wenceslau Escobar, Praia de Belas e Barra Shopping Sul"),
    references: ["Av. Wenceslau Escobar", "Av. Diário de Notícias", "Barra Shopping Sul"],
    geo: { lat: -30.1142, lng: -51.2358 },
  },
  {
    slug: "ipanema",
    name: "Ipanema",
    city: "Porto Alegre",
    cityState: POA_STATE,
    zone: "Sul",
    deliveryTime: "até 35 minutos",
    deliveryMinutes: 35,
    intro: makeIntro("Ipanema", "Av. Guaíba, Praia de Ipanema e Wenceslau Escobar"),
    references: ["Av. Guaíba", "Av. Wenceslau Escobar", "Praia de Ipanema"],
    geo: { lat: -30.1239, lng: -51.2364 },
  },
  {
    slug: "cavalhada",
    name: "Cavalhada",
    city: "Porto Alegre",
    cityState: POA_STATE,
    zone: "Sul",
    deliveryTime: "até 35 minutos",
    deliveryMinutes: 35,
    intro: makeIntro("Cavalhada", "Av. Cavalhada, Av. Eduardo Prado e Mercado Cavalhada"),
    references: ["Av. Cavalhada", "Av. Eduardo Prado", "Mercado Cavalhada"],
    geo: { lat: -30.0985, lng: -51.2356 },
  },
  {
    slug: "menino-deus",
    name: "Menino Deus",
    city: "Porto Alegre",
    cityState: POA_STATE,
    zone: "Sul",
    deliveryTime: "até 25 minutos",
    deliveryMinutes: 25,
    intro: makeIntro("Menino Deus", "Av. Getúlio Vargas, Praça do Tambor e Beira-Rio"),
    references: ["Av. Getúlio Vargas", "Estádio Beira-Rio", "Parque Marinha"],
    geo: { lat: -30.0533, lng: -51.2273 },
  },
];

export function getNeighborhoodBySlug(slug: string): NeighborhoodPageData | undefined {
  return neighborhoodPages.find((n) => n.slug === slug);
}

export function getNeighborhoodsByCity(citySlug: string): NeighborhoodPageData[] {
  // Por enquanto só Porto Alegre tem páginas de bairro; mas o helper já fica genérico.
  if (citySlug === "porto-alegre") {
    return [...neighborhoodPages].sort((a, b) => a.deliveryMinutes - b.deliveryMinutes);
  }
  return [];
}
