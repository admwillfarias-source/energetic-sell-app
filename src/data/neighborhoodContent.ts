// Bairros como landing pages SEO multi-cidade.
// Cada bairro vira /baterias/{citySlug}/{slug} com JSON-LD próprio.

export interface NeighborhoodPageData {
  slug: string;
  name: string;
  citySlug: string;
  city: string;
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
  /** Coordenadas aproximadas para JSON-LD. */
  geo: { lat: number; lng: number };
}

const RS = "RS";

function makeIntro(name: string, city: string, landmarks: string): string {
  return `A AWR Baterias entrega e instala baterias automotivas em ${name}, ${city}, com técnicos próprios e baterias Moura, Heliar, Zetta e Excell. Atendemos a região de ${landmarks} com garantia de fábrica, nota fiscal e retirada da bateria antiga inclusa no preço.`;
}

type Seed = Omit<NeighborhoodPageData, "intro" | "city" | "cityState" | "citySlug"> & {
  landmarks: string;
};

function build(citySlug: string, city: string, seeds: Seed[]): NeighborhoodPageData[] {
  return seeds.map((s) => ({
    slug: s.slug,
    name: s.name,
    citySlug,
    city,
    cityState: RS,
    zone: s.zone,
    deliveryTime: s.deliveryTime,
    deliveryMinutes: s.deliveryMinutes,
    intro: makeIntro(s.name, city, s.landmarks),
    references: s.references,
    geo: s.geo,
  }));
}

// ===== PORTO ALEGRE =====
const portoAlegre = build("porto-alegre", "Porto Alegre", [
  { slug: "sarandi", name: "Sarandi", zone: "Norte", deliveryTime: "até 35 minutos", deliveryMinutes: 35, landmarks: "Av. Assis Brasil, BR-290 e Conjunto Esmeralda", references: ["Av. Assis Brasil", "BR-290", "Esmeralda", "Parque Humaitá"], geo: { lat: -29.9876, lng: -51.1265 } },
  { slug: "rubem-berta", name: "Rubem Berta", zone: "Norte", deliveryTime: "até 40 minutos", deliveryMinutes: 40, landmarks: "Av. Baltazar de Oliveira Garcia e Conjunto Rubem Berta", references: ["Av. Baltazar de Oliveira Garcia", "Estrada do Forte", "Conjunto Rubem Berta"], geo: { lat: -29.9714, lng: -51.1612 } },
  { slug: "humaita", name: "Humaitá", zone: "Norte", deliveryTime: "até 30 minutos", deliveryMinutes: 30, landmarks: "Av. das Indústrias, Anchieta e Arena do Grêmio", references: ["Av. das Indústrias", "Arena do Grêmio", "Anchieta"], geo: { lat: -30.0003, lng: -51.1923 } },
  { slug: "navegantes", name: "Navegantes", zone: "Norte", deliveryTime: "até 25 minutos", deliveryMinutes: 25, landmarks: "Av. A. J. Renner, Av. Voluntários da Pátria e DC Shopping", references: ["Av. A. J. Renner", "Av. Voluntários da Pátria", "DC Shopping", "Estação Trensurb"], geo: { lat: -29.9985, lng: -51.2025 } },
  { slug: "sao-geraldo", name: "São Geraldo", zone: "Norte", deliveryTime: "até 25 minutos", deliveryMinutes: 25, landmarks: "Av. Brasil, Av. Cristóvão Colombo e Cais Mauá", references: ["Av. Brasil", "Av. Cristóvão Colombo", "Cais Mauá"], geo: { lat: -30.0123, lng: -51.2174 } },
  { slug: "anchieta", name: "Anchieta", zone: "Norte", deliveryTime: "até 30 minutos", deliveryMinutes: 30, landmarks: "Aeroporto Salgado Filho, Av. Sertório e Polo Industrial", references: ["Aeroporto Salgado Filho", "Av. Sertório", "Polo Industrial"], geo: { lat: -29.9844, lng: -51.1815 } },
  { slug: "passo-d-areia", name: "Passo d'Areia", zone: "Norte", deliveryTime: "até 30 minutos", deliveryMinutes: 30, landmarks: "Av. Plínio Brasil Milano, Parque Alim Pedro e Av. Assis Brasil", references: ["Av. Plínio Brasil Milano", "Parque Alim Pedro", "Av. Assis Brasil"], geo: { lat: -30.0024, lng: -51.1742 } },
  { slug: "cristo-redentor", name: "Cristo Redentor", zone: "Norte", deliveryTime: "até 30 minutos", deliveryMinutes: 30, landmarks: "Av. Assis Brasil, Av. Plínio Brasil Milano e Bourbon Shopping", references: ["Av. Assis Brasil", "Bourbon Wallig", "Av. Plínio Brasil Milano"], geo: { lat: -29.9947, lng: -51.1668 } },
  { slug: "jardim-lindoia", name: "Jardim Lindóia", zone: "Norte", deliveryTime: "até 35 minutos", deliveryMinutes: 35, landmarks: "Av. Assis Brasil, Parque Estadual e Av. Sertório", references: ["Av. Assis Brasil", "Av. Sertório", "Parque Estadual"], geo: { lat: -29.9828, lng: -51.1714 } },
  { slug: "sao-joao", name: "São João", zone: "Norte", deliveryTime: "até 25 minutos", deliveryMinutes: 25, landmarks: "Av. Farrapos, Av. Brasil e Trensurb São Pedro", references: ["Av. Farrapos", "Av. Brasil", "Trensurb São Pedro"], geo: { lat: -30.0016, lng: -51.1925 } },
  { slug: "vila-ipiranga", name: "Vila Ipiranga", zone: "Norte", deliveryTime: "até 30 minutos", deliveryMinutes: 30, landmarks: "Av. Assis Brasil, Av. Bahia e Parque Mascarenhas", references: ["Av. Assis Brasil", "Av. Bahia", "Parque Mascarenhas"], geo: { lat: -29.9967, lng: -51.1593 } },
  { slug: "higienopolis", name: "Higienópolis", zone: "Norte", deliveryTime: "até 25 minutos", deliveryMinutes: 25, landmarks: "Av. Cristóvão Colombo, Hospital Conceição e Hospital Cristo Redentor", references: ["Av. Cristóvão Colombo", "Hospital Conceição", "Hospital Cristo Redentor"], geo: { lat: -30.0094, lng: -51.2025 } },
  { slug: "boa-vista", name: "Boa Vista", zone: "Norte", deliveryTime: "até 25 minutos", deliveryMinutes: 25, landmarks: "Av. Carlos Gomes, Iguatemi e Hospital Mãe de Deus Center", references: ["Av. Carlos Gomes", "Iguatemi", "Hospital Mãe de Deus"], geo: { lat: -30.0182, lng: -51.1846 } },
  { slug: "centro-historico", name: "Centro Histórico", zone: "Centro", deliveryTime: "até 25 minutos", deliveryMinutes: 25, landmarks: "Mercado Público, Praça da Alfândega e Usina do Gasômetro", references: ["Mercado Público", "Praça da Alfândega", "Usina do Gasômetro"], geo: { lat: -30.0298, lng: -51.2284 } },
  { slug: "moinhos-de-vento", name: "Moinhos de Vento", zone: "Centro", deliveryTime: "até 20 minutos", deliveryMinutes: 20, landmarks: "Rua Padre Chagas, Hospital Moinhos e Parque Moinhos", references: ["Rua Padre Chagas", "Hospital Moinhos", "Parque Moinhos"], geo: { lat: -30.0237, lng: -51.2074 } },
  { slug: "auxiliadora", name: "Auxiliadora", zone: "Centro", deliveryTime: "até 20 minutos", deliveryMinutes: 20, landmarks: "Av. Carlos Gomes, Av. Independência e Bourbon Country", references: ["Av. Carlos Gomes", "Av. Independência", "Bourbon Country"], geo: { lat: -30.0218, lng: -51.2003 } },
  { slug: "petropolis", name: "Petrópolis", zone: "Leste", deliveryTime: "até 25 minutos", deliveryMinutes: 25, landmarks: "Av. Protásio Alves, Hospital Mãe de Deus e PUCRS", references: ["Av. Protásio Alves", "Hospital Mãe de Deus", "PUCRS"], geo: { lat: -30.0394, lng: -51.1782 } },
  { slug: "bela-vista", name: "Bela Vista", zone: "Centro", deliveryTime: "até 25 minutos", deliveryMinutes: 25, landmarks: "Praça Carlos Simão Arnt, Goethe e Iguatemi", references: ["Praça da Encol", "Av. Goethe", "Iguatemi"], geo: { lat: -30.0258, lng: -51.1953 } },
  { slug: "tristeza", name: "Tristeza", zone: "Sul", deliveryTime: "até 35 minutos", deliveryMinutes: 35, landmarks: "Av. Wenceslau Escobar, Praia de Belas e Barra Shopping Sul", references: ["Av. Wenceslau Escobar", "Av. Diário de Notícias", "Barra Shopping Sul"], geo: { lat: -30.1142, lng: -51.2358 } },
  { slug: "ipanema", name: "Ipanema", zone: "Sul", deliveryTime: "até 35 minutos", deliveryMinutes: 35, landmarks: "Av. Guaíba, Praia de Ipanema e Wenceslau Escobar", references: ["Av. Guaíba", "Av. Wenceslau Escobar", "Praia de Ipanema"], geo: { lat: -30.1239, lng: -51.2364 } },
  { slug: "cavalhada", name: "Cavalhada", zone: "Sul", deliveryTime: "até 35 minutos", deliveryMinutes: 35, landmarks: "Av. Cavalhada, Av. Eduardo Prado e Mercado Cavalhada", references: ["Av. Cavalhada", "Av. Eduardo Prado", "Mercado Cavalhada"], geo: { lat: -30.0985, lng: -51.2356 } },
  { slug: "menino-deus", name: "Menino Deus", zone: "Sul", deliveryTime: "até 25 minutos", deliveryMinutes: 25, landmarks: "Av. Getúlio Vargas, Praça do Tambor e Beira-Rio", references: ["Av. Getúlio Vargas", "Estádio Beira-Rio", "Parque Marinha"], geo: { lat: -30.0533, lng: -51.2273 } },
]);

// ===== GRAVATAÍ =====
const gravatai = build("gravatai", "Gravataí", [
  { slug: "centro", name: "Centro", zone: "Centro", deliveryTime: "até 25 minutos", deliveryMinutes: 25, landmarks: "Av. Dorival Cândido Luz de Oliveira, Catedral e Praça Tamandaré", references: ["Av. Dorival Cândido", "Catedral", "Praça Tamandaré"], geo: { lat: -29.9447, lng: -50.9919 } },
  { slug: "parque-dos-anjos", name: "Parque dos Anjos", zone: "Norte", deliveryTime: "até 30 minutos", deliveryMinutes: 30, landmarks: "Av. Eurico Salles, Parque dos Anjos e Igreja Matriz", references: ["Av. Eurico Salles", "Parque dos Anjos", "Av. Acácio"], geo: { lat: -29.9582, lng: -50.9847 } },
  { slug: "morada-do-vale-i", name: "Morada do Vale I", zone: "Sul", deliveryTime: "até 30 minutos", deliveryMinutes: 30, landmarks: "Av. Getúlio Vargas, Loteamento Morada do Vale e BR-290", references: ["Av. Getúlio Vargas", "BR-290", "Morada do Vale"], geo: { lat: -29.9123, lng: -51.0274 } },
  { slug: "morada-do-vale-iii", name: "Morada do Vale III", zone: "Sul", deliveryTime: "até 35 minutos", deliveryMinutes: 35, landmarks: "Estrada do Conde, Morada do Vale III e Polo Automotivo", references: ["Estrada do Conde", "Polo Automotivo GM", "BR-290"], geo: { lat: -29.9054, lng: -51.0312 } },
  { slug: "neopolis", name: "Neópolis", zone: "Norte", deliveryTime: "até 30 minutos", deliveryMinutes: 30, landmarks: "Av. Vereador Mário Sant'ana e Loteamento Neópolis", references: ["Av. Mário Sant'ana", "Loteamento Neópolis"], geo: { lat: -29.9354, lng: -50.9758 } },
  { slug: "salgado-filho", name: "Salgado Filho", zone: "Centro", deliveryTime: "até 25 minutos", deliveryMinutes: 25, landmarks: "Av. Salgado Filho, Hospital Dom João Becker e Centro", references: ["Av. Salgado Filho", "Hospital Dom João Becker"], geo: { lat: -29.9417, lng: -50.9956 } },
  { slug: "barnabe", name: "Barnabé", zone: "Sul", deliveryTime: "até 30 minutos", deliveryMinutes: 30, landmarks: "Av. Barnabé, Loteamento Barnabé e proximidades da Free Way", references: ["Av. Barnabé", "Free Way BR-290"], geo: { lat: -29.9648, lng: -51.0142 } },
  { slug: "bom-sucesso", name: "Bom Sucesso", zone: "Norte", deliveryTime: "até 35 minutos", deliveryMinutes: 35, landmarks: "Estrada Bom Sucesso e zona rural norte", references: ["Estrada Bom Sucesso", "Zona Norte"], geo: { lat: -29.9215, lng: -50.9684 } },
  { slug: "sao-geraldo-gravatai", name: "São Geraldo", zone: "Centro", deliveryTime: "até 30 minutos", deliveryMinutes: 30, landmarks: "Av. São Geraldo e proximidades do Centro", references: ["Av. São Geraldo", "Centro"], geo: { lat: -29.9498, lng: -50.9882 } },
]);

// ===== CACHOEIRINHA =====
const cachoeirinha = build("cachoeirinha", "Cachoeirinha", [
  { slug: "centro", name: "Centro", zone: "Centro", deliveryTime: "até 25 minutos", deliveryMinutes: 25, landmarks: "Av. Flores da Cunha, Big Shopping e Prefeitura", references: ["Av. Flores da Cunha", "Big Shopping", "Prefeitura"], geo: { lat: -29.9492, lng: -51.0937 } },
  { slug: "vila-vista-alegre", name: "Vila Vista Alegre", zone: "Norte", deliveryTime: "até 30 minutos", deliveryMinutes: 30, landmarks: "Av. Flores da Cunha, Vila Vista Alegre e BR-290", references: ["Av. Flores da Cunha", "BR-290"], geo: { lat: -29.9381, lng: -51.0823 } },
  { slug: "vila-cachoeirinha", name: "Vila Cachoeirinha", zone: "Centro", deliveryTime: "até 25 minutos", deliveryMinutes: 25, landmarks: "Av. das Indústrias e Centro Histórico", references: ["Av. das Indústrias", "Centro"], geo: { lat: -29.9525, lng: -51.0948 } },
  { slug: "parque-marechal-rondon", name: "Parque Marechal Rondon", zone: "Sul", deliveryTime: "até 30 minutos", deliveryMinutes: 30, landmarks: "Loteamento Marechal Rondon e Av. General Osório", references: ["Av. General Osório", "Marechal Rondon"], geo: { lat: -29.9572, lng: -51.1058 } },
  { slug: "granja-esperanca", name: "Granja Esperança", zone: "Norte", deliveryTime: "até 35 minutos", deliveryMinutes: 35, landmarks: "Estrada Antiga, Granja Esperança e zona rural", references: ["Estrada Antiga", "Granja Esperança"], geo: { lat: -29.9258, lng: -51.0712 } },
  { slug: "parque-brasilia", name: "Parque Brasília", zone: "Sul", deliveryTime: "até 30 minutos", deliveryMinutes: 30, landmarks: "Av. Brasília, Parque Brasília e Br-290", references: ["Av. Brasília", "BR-290"], geo: { lat: -29.9608, lng: -51.1014 } },
]);

// ===== CANOAS =====
const canoas = build("canoas", "Canoas", [
  { slug: "centro", name: "Centro", zone: "Centro", deliveryTime: "até 25 minutos", deliveryMinutes: 25, landmarks: "Av. Guilherme Schell, Canoas Shopping e ULBRA", references: ["Av. Guilherme Schell", "Canoas Shopping", "ULBRA"], geo: { lat: -29.9177, lng: -51.1844 } },
  { slug: "mathias-velho", name: "Mathias Velho", zone: "Sul", deliveryTime: "até 30 minutos", deliveryMinutes: 30, landmarks: "Av. Boqueirão, Mathias Velho e Trensurb", references: ["Av. Boqueirão", "Trensurb", "Mathias Velho"], geo: { lat: -29.9408, lng: -51.1758 } },
  { slug: "niteroi", name: "Niterói", zone: "Sul", deliveryTime: "até 30 minutos", deliveryMinutes: 30, landmarks: "Av. Inconfidência e Niterói", references: ["Av. Inconfidência", "Trensurb Niterói"], geo: { lat: -29.9304, lng: -51.1872 } },
  { slug: "igara", name: "Igara", zone: "Centro", deliveryTime: "até 25 minutos", deliveryMinutes: 25, landmarks: "Av. Victor Barreto e Igara", references: ["Av. Victor Barreto", "Trensurb Igara"], geo: { lat: -29.9081, lng: -51.1832 } },
  { slug: "marechal-rondon", name: "Marechal Rondon", zone: "Norte", deliveryTime: "até 30 minutos", deliveryMinutes: 30, landmarks: "Av. Maria Zélia Carneiro e Marechal Rondon", references: ["Av. Maria Zélia", "Marechal Rondon"], geo: { lat: -29.8965, lng: -51.1638 } },
  { slug: "sao-jose", name: "São José", zone: "Centro", deliveryTime: "até 30 minutos", deliveryMinutes: 30, landmarks: "Av. Brasil e bairro São José", references: ["Av. Brasil", "São José"], geo: { lat: -29.9223, lng: -51.1695 } },
  { slug: "guajuviras", name: "Guajuviras", zone: "Norte", deliveryTime: "até 35 minutos", deliveryMinutes: 35, landmarks: "Av. Diário de Notícias, Guajuviras e BR-448", references: ["Av. Diário de Notícias", "BR-448", "Guajuviras"], geo: { lat: -29.8796, lng: -51.1542 } },
]);

// ===== ALVORADA =====
const alvorada = build("alvorada", "Alvorada", [
  { slug: "centro", name: "Centro", zone: "Centro", deliveryTime: "até 35 minutos", deliveryMinutes: 35, landmarks: "Av. Presidente Getúlio Vargas e Centro de Alvorada", references: ["Av. Getúlio Vargas", "Centro"], geo: { lat: -29.9914, lng: -51.0809 } },
  { slug: "americana", name: "Americana", zone: "Norte", deliveryTime: "até 40 minutos", deliveryMinutes: 40, landmarks: "Estrada da Americana e bairro Americana", references: ["Estrada da Americana"], geo: { lat: -29.9758, lng: -51.0654 } },
  { slug: "sumare", name: "Sumaré", zone: "Sul", deliveryTime: "até 40 minutos", deliveryMinutes: 40, landmarks: "Av. Sumaré e proximidades da BR-290", references: ["Av. Sumaré", "BR-290"], geo: { lat: -30.0024, lng: -51.0742 } },
  { slug: "jardim-algarve", name: "Jardim Algarve", zone: "Centro", deliveryTime: "até 35 minutos", deliveryMinutes: 35, landmarks: "Loteamento Jardim Algarve e Av. Brasil", references: ["Av. Brasil", "Jardim Algarve"], geo: { lat: -29.9847, lng: -51.0758 } },
  { slug: "bom-principio", name: "Bom Princípio", zone: "Norte", deliveryTime: "até 40 minutos", deliveryMinutes: 40, landmarks: "Bom Princípio e proximidades da divisa com Viamão", references: ["Bom Princípio"], geo: { lat: -29.9682, lng: -51.0558 } },
]);

// ===== VIAMÃO =====
const viamao = build("viamao", "Viamão", [
  { slug: "centro", name: "Centro", zone: "Centro", deliveryTime: "até 40 minutos", deliveryMinutes: 40, landmarks: "Av. Senador Salgado Filho e Centro de Viamão", references: ["Av. Salgado Filho", "Centro"], geo: { lat: -30.0807, lng: -51.0234 } },
  { slug: "taruma", name: "Tarumã", zone: "Norte", deliveryTime: "até 40 minutos", deliveryMinutes: 40, landmarks: "Av. Tarumã e divisa com Porto Alegre", references: ["Av. Tarumã"], geo: { lat: -30.0568, lng: -51.0784 } },
  { slug: "vila-augusta", name: "Vila Augusta", zone: "Centro", deliveryTime: "até 40 minutos", deliveryMinutes: 40, landmarks: "Vila Augusta e Av. Senador Salgado Filho", references: ["Vila Augusta", "Av. Salgado Filho"], geo: { lat: -30.0712, lng: -51.0312 } },
  { slug: "santa-isabel", name: "Santa Isabel", zone: "Sul", deliveryTime: "até 45 minutos", deliveryMinutes: 45, landmarks: "Distrito de Santa Isabel e zona rural", references: ["Santa Isabel"], geo: { lat: -30.1224, lng: -50.9854 } },
  { slug: "jardim-krahe", name: "Jardim Krahe", zone: "Norte", deliveryTime: "até 40 minutos", deliveryMinutes: 40, landmarks: "Jardim Krahe e proximidades da Av. Tarumã", references: ["Jardim Krahe"], geo: { lat: -30.0625, lng: -51.0524 } },
]);

// ===== ESTEIO =====
const esteio = build("esteio", "Esteio", [
  { slug: "centro", name: "Centro", zone: "Centro", deliveryTime: "até 35 minutos", deliveryMinutes: 35, landmarks: "Av. Presidente Vargas, Parque Assis Brasil e Centro", references: ["Av. Presidente Vargas", "Parque Assis Brasil"], geo: { lat: -29.8612, lng: -51.1789 } },
  { slug: "primavera", name: "Primavera", zone: "Norte", deliveryTime: "até 40 minutos", deliveryMinutes: 40, landmarks: "Bairro Primavera e Av. Sebastião Diniz", references: ["Av. Sebastião Diniz", "Primavera"], geo: { lat: -29.8528, lng: -51.1714 } },
  { slug: "olimpica", name: "Olímpica", zone: "Sul", deliveryTime: "até 35 minutos", deliveryMinutes: 35, landmarks: "Vila Olímpica e proximidades da BR-116", references: ["BR-116", "Vila Olímpica"], geo: { lat: -29.8682, lng: -51.1842 } },
  { slug: "tamandare", name: "Tamandaré", zone: "Centro", deliveryTime: "até 35 minutos", deliveryMinutes: 35, landmarks: "Av. Tamandaré e bairro Tamandaré", references: ["Av. Tamandaré"], geo: { lat: -29.8548, lng: -51.1758 } },
  { slug: "tres-portos", name: "Três Portos", zone: "Sul", deliveryTime: "até 40 minutos", deliveryMinutes: 40, landmarks: "Bairro Três Portos e BR-448", references: ["BR-448", "Três Portos"], geo: { lat: -29.8698, lng: -51.1932 } },
]);

// ===== SAPUCAIA DO SUL =====
const sapucaia = build("sapucaia-do-sul", "Sapucaia do Sul", [
  { slug: "centro", name: "Centro", zone: "Centro", deliveryTime: "até 40 minutos", deliveryMinutes: 40, landmarks: "Av. Assis Brasil, Centro de Sapucaia e Praça da Matriz", references: ["Av. Assis Brasil", "Praça da Matriz"], geo: { lat: -29.8278, lng: -51.1453 } },
  { slug: "boa-vista-sapucaia", name: "Boa Vista", zone: "Norte", deliveryTime: "até 45 minutos", deliveryMinutes: 45, landmarks: "Bairro Boa Vista e Av. das Indústrias", references: ["Av. das Indústrias", "Boa Vista"], geo: { lat: -29.8158, lng: -51.1387 } },
  { slug: "piratini", name: "Piratini", zone: "Centro", deliveryTime: "até 40 minutos", deliveryMinutes: 40, landmarks: "Bairro Piratini e Av. Sapucaia", references: ["Av. Sapucaia", "Piratini"], geo: { lat: -29.8324, lng: -51.1498 } },
  { slug: "vargas", name: "Vargas", zone: "Sul", deliveryTime: "até 40 minutos", deliveryMinutes: 40, landmarks: "Bairro Vargas e proximidades da BR-116", references: ["BR-116", "Vargas"], geo: { lat: -29.8412, lng: -51.1542 } },
  { slug: "sao-jose-sapucaia", name: "São José", zone: "Norte", deliveryTime: "até 45 minutos", deliveryMinutes: 45, landmarks: "Bairro São José e Av. João Pereira Vargas", references: ["São José", "Av. João Pereira Vargas"], geo: { lat: -29.8208, lng: -51.1428 } },
]);

export const neighborhoodPages: NeighborhoodPageData[] = [
  ...portoAlegre,
  ...gravatai,
  ...cachoeirinha,
  ...canoas,
  ...alvorada,
  ...viamao,
  ...esteio,
  ...sapucaia,
];

/** Resolve por citySlug + slug (preferido). Se citySlug não for passado, faz match apenas por slug (compat). */
export function getNeighborhoodBySlug(
  slug: string,
  citySlug?: string,
): NeighborhoodPageData | undefined {
  if (citySlug) {
    return neighborhoodPages.find((n) => n.slug === slug && n.citySlug === citySlug);
  }
  return neighborhoodPages.find((n) => n.slug === slug);
}

export function getNeighborhoodsByCity(citySlug: string): NeighborhoodPageData[] {
  return neighborhoodPages
    .filter((n) => n.citySlug === citySlug)
    .sort((a, b) => a.deliveryMinutes - b.deliveryMinutes);
}
