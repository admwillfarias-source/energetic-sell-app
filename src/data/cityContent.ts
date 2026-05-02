// Conteúdo SEO por cidade. Usado nas landing pages /baterias/{slug}
// e na seção QuickNavigation da home.

export interface CityPageData {
  slug: string;
  name: string;
  state: string;
  /** Texto curto para hero. */
  tagline: string;
  /** Parágrafo introdutório (300-500 chars) único da cidade. */
  intro: string;
  /** Bairros atendidos — exibidos como chips. */
  neighborhoods: string[];
  /** Tempo médio de entrega exibido na página. */
  deliveryTime: string;
  /** FAQ específico da cidade. */
  faq: { q: string; a: string }[];
  /** Coordenadas para JSON-LD LocalBusiness (aproximadas, centro da cidade). */
  geo: { lat: number; lng: number };
}

const PHONE = "(51) 99319-9486";

function makeFaq(name: string, deliveryTime: string): { q: string; a: string }[] {
  return [
    {
      q: `Qual o tempo de entrega de bateria em ${name}?`,
      a: `Em ${name} a entrega é em ${deliveryTime}, com agendamento flexível. Trabalhamos das 8h às 22h, todos os dias.`,
    },
    {
      q: `A instalação da bateria está incluída em ${name}?`,
      a: `Sim. Em ${name} a instalação é gratuita e feita por técnicos especializados no local — residência, trabalho ou na rua.`,
    },
    {
      q: `Quais marcas de bateria vocês entregam em ${name}?`,
      a: `Trabalhamos com Moura, Heliar, Zetta e Excell — todas com nota fiscal e garantia de fábrica de até 24 meses.`,
    },
    {
      q: `Aceitam a bateria velha como parte do pagamento?`,
      a: `Sim, em ${name} retiramos sua bateria antiga e o desconto da sucata já está incluso no preço anunciado.`,
    },
    {
      q: `Qual o telefone para emergência em ${name}?`,
      a: `Atendimento 24h via WhatsApp ${PHONE}. Em casos de emergência, despachamos a equipe imediatamente.`,
    },
  ];
}

export const cityPages: CityPageData[] = [
  {
    slug: "porto-alegre",
    name: "Porto Alegre",
    state: "RS",
    tagline: "Bateria automotiva entregue e instalada em Porto Alegre em até 35 minutos.",
    intro:
      "A AWR Baterias é referência em entrega e instalação de baterias automotivas em Porto Alegre. Atendemos toda a capital — da Zona Sul ao Centro Histórico, passando por Moinhos de Vento, Petrópolis e Bela Vista — com técnicos próprios, baterias Moura, Heliar, Zetta e Excell, garantia de fábrica e retirada da sua bateria antiga sem custo extra.",
    deliveryTime: "até 35 minutos",
    geo: { lat: -30.0346, lng: -51.2177 },
    neighborhoods: [
      "Centro Histórico", "Moinhos de Vento", "Petrópolis", "Bela Vista", "Menino Deus",
      "Bom Fim", "Cidade Baixa", "Auxiliadora", "Mont'Serrat", "Higienópolis",
      "Independência", "Floresta", "Navegantes", "São Geraldo", "Praia de Belas",
      "Santana", "Azenha", "Partenon", "Cristal", "Camaquã",
      "Cavalhada", "Tristeza", "Ipanema", "Hípica", "Sarandi", "Rubem Berta",
      "Três Figueiras", "Jardim Botânico", "Medianeira", "Restinga",
      "Humaitá", "Anchieta", "Farrapos", "São João", "Passo d'Areia",
      "Cristo Redentor", "Vila Ipiranga", "Jardim Lindóia", "Jardim Itu", "Boa Vista",
      "Chácara das Pedras", "Vila Assunção", "Pedra Redonda", "Espírito Santo", "Guarujá",
      "Serraria", "Belém Novo", "Lami", "Lomba do Pinheiro", "Agronomia",
      "Glória", "Teresópolis", "Vila Nova", "Nonoai", "Vila João Pessoa",
      "São Sebastião", "Jardim Carvalho", "Vila Jardim", "Bom Jesus", "Mário Quintana",
      "Costa e Silva", "Jardim Floresta", "Passo das Pedras", "Aberta dos Morros", "Ponta Grossa",
      "Rio Branco", "Santa Cecília", "Santa Tereza", "Santo Antônio", "Vila Conceição",
    ],
    faq: makeFaq("Porto Alegre", "até 35 minutos"),
  },
  {
    slug: "canoas",
    name: "Canoas",
    state: "RS",
    tagline: "Entrega de bateria automotiva em Canoas com instalação grátis.",
    intro:
      "Em Canoas, a AWR Baterias entrega e instala baterias automotivas no mesmo dia, com técnicos a postos nas regiões do Centro, Niterói, Igara, Marechal Rondon e Mathias Velho. Trabalhamos com as principais marcas do mercado e oferecemos garantia de fábrica, nota fiscal e retirada da bateria antiga.",
    deliveryTime: "até 45 minutos",
    geo: { lat: -29.9177, lng: -51.1844 },
    neighborhoods: [
      "Centro", "Niterói", "Igara", "Fátima", "Marechal Rondon",
      "Mathias Velho", "Estância Velha", "São José", "Harmonia", "Guajuviras",
      "Olaria", "Rio Branco", "Mato Grande", "Nossa Senhora das Graças", "Mistral",
      "Brigadeira", "Centro Industrial", "Esplanada", "São Luís", "Continental",
      "Sete de Setembro", "Igara III", "Igara II", "Marechal Rondon",
      "Pedras Brancas", "Guajuviras", "Estância Velha", "Triângulo", "Liberdade",
      "Rio Branco", "Caça e Pesca", "Cinco Colônias", "Boa Saúde",
    ],
    faq: makeFaq("Canoas", "até 45 minutos"),
  },
  {
    slug: "gravatai",
    name: "Gravataí",
    state: "RS",
    tagline: "Bateria com entrega rápida e instalação em Gravataí.",
    intro:
      "Cobrimos toda Gravataí com entrega no mesmo dia: do Centro ao Morada do Vale, passando por Bom Sucesso, Parque dos Anjos e Bom Princípio. Baterias Moura, Heliar, Zetta e Excell com garantia de fábrica e instalação por técnico especializado, sem custo adicional.",
    deliveryTime: "até 50 minutos",
    geo: { lat: -29.9438, lng: -50.9921 },
    neighborhoods: [
      "Centro", "Bom Princípio", "Morada do Vale I", "Morada do Vale II", "Morada do Vale III",
      "Bom Sucesso", "Parque dos Anjos", "Salgado Filho", "São Vicente", "Recanto Corcunda",
      "Neópolis", "Barnabé", "São Geraldo", "Vera Cruz", "Santa Cruz",
      "Loteamento Verona", "Parque Florido", "Itacolomi", "Águas Claras", "Costa do Ipiranga",
      "Jansen", "Passo das Pedras", "Vila Branca", "Loteamento dos Açores", "São Judas Tadeu",
      "Dom Feliciano", "Loteamento Eldorado", "Várzea Grande",
    ],
    faq: makeFaq("Gravataí", "até 50 minutos"),
  },
  {
    slug: "cachoeirinha",
    name: "Cachoeirinha",
    state: "RS",
    tagline: "Bateria automotiva entregue e instalada em Cachoeirinha.",
    intro:
      "Em Cachoeirinha, a AWR Baterias entrega no mesmo dia com instalação inclusa em bairros como Centro, Vila Ponta Porã, Vista Alegre e Parque da Matriz. Pagamento facilitado em até 10x sem juros e atendimento 24h via WhatsApp.",
    deliveryTime: "até 50 minutos",
    geo: { lat: -29.9514, lng: -51.0945 },
    neighborhoods: [
      "Centro", "Vila Ponta Porã", "Vista Alegre", "Parque da Matriz",
      "Granja Esperança", "Vila Princesa", "Imbuhy", "Vila Cachoeirinha",
      "Parque Marechal Rondon", "Parque Brasília", "Vila Bom Princípio", "Vila Veneza",
      "Vila Pôr do Sol", "Anair", "Distrito Industrial", "Vila Bom Fim",
      "Eunice", "Imbiruçu", "Vila Olinda", "Bom Princípio",
    ],
    faq: makeFaq("Cachoeirinha", "até 50 minutos"),
  },
  {
    slug: "esteio",
    name: "Esteio",
    state: "RS",
    tagline: "Entrega expressa de baterias em Esteio com instalação grátis.",
    intro:
      "Atendemos Esteio inteira — Centro, Jardim Planalto, Olímpica, Tamandaré e Pedreira — com baterias novas das melhores marcas, garantia de fábrica e retirada da sua bateria antiga inclusa. Compre online e receba em poucos minutos.",
    deliveryTime: "até 55 minutos",
    geo: { lat: -29.8607, lng: -51.1789 },
    neighborhoods: [
      "Centro", "Jardim Planalto", "Olímpica", "Tamandaré", "Pedreira",
      "Vila Pedreira", "Tronco", "Liberdade", "Primavera", "Três Portos",
      "Novo Esteio", "São Sebastião", "Parque Amador", "Vila Operária",
      "Pastoril", "Aurora", "Cohab", "Centenário", "Novo Esteio",
      "Parque do Sol", "Vila Bonita",
    ],
    faq: makeFaq("Esteio", "até 55 minutos"),
  },
  {
    slug: "novo-hamburgo",
    name: "Novo Hamburgo",
    state: "RS",
    tagline: "Bateria automotiva em Novo Hamburgo com entrega no mesmo dia.",
    intro:
      "Em Novo Hamburgo, a AWR Baterias atende Centro, Hamburgo Velho, Canudos, Rio Branco e Liberdade com entrega rápida, instalação por técnico especializado e garantia de fábrica em todas as marcas. Atendimento todos os dias, das 8h às 22h.",
    deliveryTime: "até 50 minutos",
    geo: { lat: -29.6783, lng: -51.1308 },
    neighborhoods: [
      "Centro", "Hamburgo Velho", "Canudos", "Rio Branco", "Liberdade",
      "Ideal", "Operário", "Vila Nova", "Santo Afonso", "Roselândia",
      "Rondônia", "Industrial", "Boa Saúde", "Diehl", "Lomba Grande",
      "Petrópolis", "Mauá", "São José", "Guarani", "Vila Rosa",
      "Primavera", "Santo Inácio", "Lira", "Santa Maria Goretti", "Kephas",
      "Pátria Nova", "Mundo Novo", "Vila Nova", "Pousada dos Bandeirantes", "Jardim Mauá",
    ],
    faq: makeFaq("Novo Hamburgo", "até 50 minutos"),
  },
  {
    slug: "sao-leopoldo",
    name: "São Leopoldo",
    state: "RS",
    tagline: "Bateria automotiva em São Leopoldo com entrega e instalação no mesmo dia.",
    intro:
      "Em São Leopoldo, a AWR Baterias entrega e instala baterias automotivas no mesmo dia em bairros como Centro, São José, Feitoria, Rio dos Sinos e Scharlau. Trabalhamos com Moura, Heliar, Zetta e Excell, com garantia de fábrica, nota fiscal e retirada da bateria antiga inclusa.",
    deliveryTime: "até 50 minutos",
    geo: { lat: -29.7604, lng: -51.1469 },
    neighborhoods: [
      "Centro", "São José", "Feitoria", "Rio dos Sinos", "Scharlau",
      "Cristo Rei", "Vicentina", "Campina", "Santo André", "Pinheiro",
      "Padre Reus", "Jardim América", "Boa Saúde", "Duque de Caxias", "Morro do Espelho",
      "Arroio da Manteiga", "Santa Teresa", "São Miguel", "Fazenda São Borja", "Jardim Luciana",
      "Centro de Indústria", "Vila Iara", "Vila Brás", "Mauá", "Independência",
      "Fião", "Boa Vista", "Pousada dos Bandeirantes",
    ],
    faq: makeFaq("São Leopoldo", "até 50 minutos"),
  },
  {
    slug: "sapucaia-do-sul",
    name: "Sapucaia do Sul",
    state: "RS",
    tagline: "Entrega de bateria automotiva em Sapucaia do Sul com instalação grátis.",
    intro:
      "Em Sapucaia do Sul, a AWR Baterias atende Centro, Pasqualini, Santa Catarina, COHAB e Vargas com entrega rápida e instalação por técnico especializado, sem custo adicional. Garantia de fábrica em todas as marcas e pagamento facilitado em até 10x sem juros.",
    deliveryTime: "até 50 minutos",
    geo: { lat: -29.8276, lng: -51.1453 },
    neighborhoods: [
      "Centro", "Pasqualini", "Santa Catarina", "COHAB", "Vargas",
      "Camargo", "São Borja", "Piratini", "Boa Vista", "São José",
      "Industrial", "Lomba da Palmeira", "Veneza", "Santa Cruz", "Três Portos",
      "Jardim América", "Vila Pedreira", "Nova Sapucaia", "Vargas", "Pasqualini",
    ],
    faq: makeFaq("Sapucaia do Sul", "até 50 minutos"),
  },
  {
    slug: "ivoti",
    name: "Ivoti",
    state: "RS",
    tagline: "Bateria automotiva entregue e instalada em Ivoti.",
    intro:
      "Em Ivoti, a AWR Baterias entrega no mesmo dia com instalação inclusa, atendendo Centro, Bom Pastor, Concórdia e demais bairros. Baterias Moura, Heliar, Zetta e Excell com garantia de fábrica e retirada da sua bateria antiga sem custo extra.",
    deliveryTime: "até 60 minutos",
    geo: { lat: -29.5917, lng: -51.1656 },
    neighborhoods: [
      "Centro", "Bom Pastor", "Concórdia", "Harmonia", "São José",
      "Cataverde", "Bairro Feitoria", "Vinte e Cinco", "Picada 48", "Bom Jardim",
      "Vinte de Setembro", "Capão Alto", "Schneider", "Floresta",
      "Independência", "Fazenda Padilha", "Jardim Maieron",
    ],
    faq: makeFaq("Ivoti", "até 60 minutos"),
  },
  {
    slug: "campo-bom",
    name: "Campo Bom",
    state: "RS",
    tagline: "Bateria com entrega rápida e instalação em Campo Bom.",
    intro:
      "Atendemos toda Campo Bom com entrega no mesmo dia: Centro, Genuíno Sampaio, 25 de Julho, Cidade Nova e Imigrante. Baterias das melhores marcas com garantia de fábrica, nota fiscal e instalação gratuita por técnico especializado.",
    deliveryTime: "até 50 minutos",
    geo: { lat: -29.6747, lng: -51.0581 },
    neighborhoods: [
      "Centro", "Genuíno Sampaio", "25 de Julho", "Cidade Nova", "Imigrante",
      "São José", "São Jacó", "Quatro Colônias", "Sol Nascente", "São Vicente",
      "Operário", "Industrial", "Bela Vista", "União", "Roselândia",
      "Vila Brasília", "Schmidt", "Diehl", "Faxinal", "Jardim do Sol",
    ],
    faq: makeFaq("Campo Bom", "até 50 minutos"),
  },
  {
    slug: "estancia-velha",
    name: "Estância Velha",
    state: "RS",
    tagline: "Bateria automotiva entregue e instalada em Estância Velha.",
    intro:
      "Em Estância Velha, a AWR Baterias entrega e instala baterias no mesmo dia, atendendo Centro, Rincão dos Ilhéus, Berto Círio e demais bairros. Garantia de fábrica, retirada da bateria antiga e pagamento facilitado em até 10x sem juros.",
    deliveryTime: "até 50 minutos",
    geo: { lat: -29.6492, lng: -51.1789 },
    neighborhoods: [
      "Centro", "Rincão dos Ilhéus", "Berto Círio", "Bom Pastor", "Imigrante",
      "Santa Cristina", "Carazal", "Encosta do Sol", "Mauá", "Veneza",
      "Bela Vista", "Boa Vista", "Liberdade", "Olaria", "São José",
      "Vila Brasília", "Cohab",
    ],
    faq: makeFaq("Estância Velha", "até 50 minutos"),
  },
  {
    slug: "nova-santa-rita",
    name: "Nova Santa Rita",
    state: "RS",
    tagline: "Entrega expressa de baterias em Nova Santa Rita com instalação grátis.",
    intro:
      "Atendemos toda Nova Santa Rita — Centro, Pedreira, Berto Círio, Sander e Califórnia — com baterias novas das melhores marcas, garantia de fábrica e retirada da sua bateria antiga inclusa. Compre online e receba no mesmo dia.",
    deliveryTime: "até 60 minutos",
    geo: { lat: -29.8521, lng: -51.2823 },
    neighborhoods: [
      "Centro", "Pedreira", "Berto Círio", "Sander", "Califórnia",
      "Pólo Petroquímico", "Caju", "Pedras Brancas", "Sítio Gaúcho", "Santa Rita",
      "Morretes", "Costa do Sul", "Olaria", "Águas Claras", "Boa Vista",
      "Vila Esperança", "Loteamento Industrial",
    ],
    faq: makeFaq("Nova Santa Rita", "até 60 minutos"),
  },
  {
    slug: "alvorada",
    name: "Alvorada",
    state: "RS",
    tagline: "Bateria automotiva em Alvorada com entrega no mesmo dia.",
    intro:
      "Em Alvorada, a AWR Baterias entrega e instala baterias automotivas em Centro, Bela Vista, Maringá, Umbu e Sumaré com técnicos próprios e garantia de fábrica. Atendimento todos os dias com pagamento facilitado em até 10x sem juros.",
    deliveryTime: "até 60 minutos",
    geo: { lat: -29.9897, lng: -51.0833 },
    neighborhoods: [
      "Centro", "Bela Vista", "Maringá", "Umbu", "Sumaré",
      "Salgado Filho", "Piratini", "Jardim Algarve", "Americana", "Bom Princípio",
      "Bonsucesso", "Marechal Rondon", "Parque Espírito Santo", "Formoza", "Intersul",
      "Jardim do Cedro", "Nova Alvorada", "Santa Helena", "São José", "Santa Bárbara",
      "Vila Floresta", "Costa do Ipiranga", "Camboim",
    ],
    faq: makeFaq("Alvorada", "até 60 minutos"),
  },
  {
    slug: "viamao",
    name: "Viamão",
    state: "RS",
    tagline: "Bateria automotiva entregue e instalada em Viamão.",
    intro:
      "Em Viamão, a AWR Baterias atende Centro, Tarumã, Santa Isabel, Vila Augusta e Jardim Krahe com entrega no mesmo dia, instalação grátis e garantia de fábrica. Baterias Moura, Heliar, Zetta e Excell com nota fiscal e retirada da bateria antiga.",
    deliveryTime: "até 60 minutos",
    geo: { lat: -30.0811, lng: -51.0233 },
    neighborhoods: [
      "Centro", "Tarumã", "Santa Isabel", "Vila Augusta", "Jardim Krahe",
      "Itapuã", "Águas Claras", "Viamópolis", "Vila Elsa", "Jardim Lessa",
      "Querência", "Estância Grande", "Alphaville", "Capão da Porteira", "Lageado",
      "São Lucas", "Sítio São José", "Passo do Sabão", "Cecília", "Rincão",
      "Bela Vista", "Operário", "Belém Velho", "Lombas",
    ],
    faq: makeFaq("Viamão", "até 60 minutos"),
  },
];

export function getCityBySlug(slug: string): CityPageData | undefined {
  return cityPages.find((c) => c.slug === slug);
}
