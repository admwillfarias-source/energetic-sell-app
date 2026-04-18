// Versão simplificada do cityContent. Mantém slug + nome + lista de bairros para a navegação rápida.

export interface CityPageData {
  slug: string;
  name: string;
  neighborhoods: string[];
}

export const cityPages: CityPageData[] = [
  {
    slug: "porto-alegre",
    name: "Porto Alegre",
    neighborhoods: [
      "Medianeira", "Petrópolis", "Centro Histórico", "Menino Deus", "Bom Fim",
      "Moinhos de Vento", "Cidade Baixa", "Partenon", "Cristal", "Azenha",
      "Santana", "Rio Branco", "Floresta", "Independência", "Mont'Serrat",
      "Auxiliadora", "Bela Vista", "Três Figueiras", "Higienópolis", "Navegantes",
      "São Geraldo", "Farroupilha", "Praia de Belas", "Camaquã", "Cavalhada",
      "Tristeza", "Ipanema", "Hípica", "Sarandi", "Rubem Berta",
    ],
  },
  { slug: "canoas", name: "Canoas", neighborhoods: ["Fátima", "Centro", "Niterói", "Igara"] },
  { slug: "gravatai", name: "Gravataí", neighborhoods: ["Bom Princípio", "Centro", "Morada do Vale"] },
  { slug: "sao-leopoldo", name: "São Leopoldo", neighborhoods: ["São José", "Feitoria", "Centro"] },
  { slug: "novo-hamburgo", name: "Novo Hamburgo", neighborhoods: ["Hamburgo Velho", "Centro"] },
  { slug: "alvorada", name: "Alvorada", neighborhoods: ["Centro", "Americana"] },
  { slug: "cachoeirinha", name: "Cachoeirinha", neighborhoods: ["Centro", "Vila Ponta Porã"] },
  { slug: "viamao", name: "Viamão", neighborhoods: ["Centro", "Santa Isabel"] },
  { slug: "esteio", name: "Esteio", neighborhoods: ["Centro", "Jardim Planalto"] },
  { slug: "sapucaia-do-sul", name: "Sapucaia do Sul", neighborhoods: ["Centro", "Camboim"] },
];
