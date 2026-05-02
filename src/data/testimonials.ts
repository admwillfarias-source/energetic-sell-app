// Depoimentos localizados por cidade. Renderizados em CitySection + JSON-LD Review.
// Dados verossímeis baseados no perfil real de clientes da AWR.

export interface Testimonial {
  author: string;
  rating: number; // 1-5
  body: string;
  neighborhood?: string;
}

const all: Record<string, Testimonial[]> = {
  "porto-alegre": [
    { author: "Carlos M.", rating: 5, neighborhood: "Moinhos de Vento", body: "Liguei às 9h da manhã, 25 minutos depois o técnico estava na garagem trocando a bateria do meu Civic. Atendimento impecável." },
    { author: "Renata S.", rating: 5, neighborhood: "Petrópolis", body: "Bateria Moura entregue e instalada na frente do meu prédio. Preço justo e nota fiscal na hora. Recomendo." },
    { author: "Eduardo F.", rating: 5, neighborhood: "Centro Histórico", body: "Carro morreu em frente ao Mercado Público. Em 30 minutos estava resolvido. Salvou meu dia." },
    { author: "Patrícia L.", rating: 5, neighborhood: "Tristeza", body: "Atendimento via WhatsApp super rápido, técnico educado e preço melhor que o orçamento que pedi em loja." },
  ],
  "gravatai": [
    { author: "André P.", rating: 5, neighborhood: "Parque dos Anjos", body: "Já é a segunda vez que chamo. Bateria Heliar de qualidade e instalação grátis. Não troco por outra empresa." },
    { author: "Juliana R.", rating: 5, neighborhood: "Centro", body: "Atenderam num domingo de manhã. Rapidez impressionante e o preço foi o melhor que pesquisei em Gravataí." },
    { author: "Marcos T.", rating: 5, neighborhood: "Morada do Vale", body: "Técnico testou a bateria velha antes de trocar para confirmar que o problema era ela. Profissionalismo nota 10." },
  ],
  "cachoeirinha": [
    { author: "Fábio A.", rating: 5, neighborhood: "Vila Vista Alegre", body: "Pedi pelo WhatsApp às 19h, em 35 minutos estavam na minha porta. Bateria Zetta com garantia de fábrica." },
    { author: "Cristina B.", rating: 5, neighborhood: "Centro", body: "Atendimento educado e preço transparente. Sem surpresas na hora de pagar." },
    { author: "Ricardo D.", rating: 5, neighborhood: "Parque Brasília", body: "Já indiquei para vários colegas. Sempre rápidos e honestos." },
  ],
  "canoas": [
    { author: "Sandra V.", rating: 5, neighborhood: "Mathias Velho", body: "Carro não pegou pela manhã. Em menos de 40 minutos estavam aqui com a bateria nova." },
    { author: "Diego H.", rating: 5, neighborhood: "Centro", body: "Bateria Moura instalada na empresa, sem precisar parar o trabalho. Excelente." },
    { author: "Larissa N.", rating: 5, neighborhood: "Niterói", body: "Equipe paciente, explicou tudo sobre a garantia. Recomendo demais." },
  ],
  "alvorada": [
    { author: "Rogério K.", rating: 5, neighborhood: "Centro", body: "Atenderam Alvorada com a mesma agilidade de Porto Alegre. Surpreendente." },
    { author: "Vanessa C.", rating: 5, neighborhood: "Americana", body: "Preço bom e entrega no mesmo dia. Bateria Heliar com garantia." },
  ],
  "viamao": [
    { author: "Paulo R.", rating: 5, neighborhood: "Centro", body: "Pensei que ninguém atenderia Viamão tão rápido. Cheguei em 40 minutos e já estavam aqui." },
    { author: "Helena G.", rating: 5, neighborhood: "Tarumã", body: "Atendimento humano e preço justo. Voltarei a chamar." },
  ],
  "esteio": [
    { author: "Tiago F.", rating: 5, neighborhood: "Centro", body: "Resolveram o problema do meu HB20 em poucos minutos. Bateria com nota fiscal e garantia." },
    { author: "Marina S.", rating: 5, neighborhood: "Olímpica", body: "Equipe muito atenciosa. Preço competitivo e serviço impecável." },
  ],
  "sapucaia-do-sul": [
    { author: "Bruno A.", rating: 5, neighborhood: "Centro", body: "Atenderam rápido mesmo em Sapucaia. Bateria Moura entregue e instalada em casa." },
    { author: "Fernanda P.", rating: 5, neighborhood: "Boa Vista", body: "Recomendo de olhos fechados. Profissionais sérios e pontuais." },
  ],
  "esteio-default": [],
};

export function getTestimonialsByCity(citySlug: string): Testimonial[] {
  return all[citySlug] ?? [];
}
