export interface Store {
  id: number;
  name: string;
  city: string;
  address: string;
  phone: string;
  whatsapp: string;
  hours: string;
  mapsUrl: string;
}

export const stores: Store[] = [
  {
    id: 1,
    name: "AWR Baterias Moura e Heliar Porto Alegre - Medianeira",
    city: "Porto Alegre",
    address: "Av. Dr. Carlos Barbosa, 1452 - Medianeira, Porto Alegre - RS, 90880-001",
    phone: "tel:5135165472",
    whatsapp: "5551993199486",
    hours: "Seg-Sex: 8h-19h | Sáb: 8h-13h",
    mapsUrl:
      "https://www.google.com/maps/search/AWR+Baterias+Moura+e+Heliar+Porto+Alegre+Av+Dr+Carlos+Barbosa+1452+Medianeira",
  },
  {
    id: 2,
    name: "AWR Baterias Moura e Heliar Porto Alegre - Petrópolis",
    city: "Porto Alegre",
    address: "Av. Protásio Alves, 4189 - Petrópolis, Porto Alegre - RS, 90410-006",
    phone: "tel:51357-49267",
    whatsapp: "5551993199486",
    hours: "Seg-Sex: 8h-19h | Sáb: 8h-13h",
    mapsUrl:
      "https://www.google.com/maps/search/AWR+Baterias+Moura+e+Heliar+Porto+Alegre+Av+Protasio+Alves+4189+Petropolis",
  },
  {
    id: 3,
    name: "AWR Baterias Canoas - Moura Heliar",
    city: "Canoas",
    address: "Av. Guilherme Schell, 3266 - Fátima, Canoas - RS, 92200-714",
    phone: "tel:5135165472",
    whatsapp: "5551993199486",
    hours: "Seg-Sex: 8h-19h | Sáb: 8h-18h",
    mapsUrl:
      "https://www.google.com/maps/search/AWR+Baterias+Canoas+Av+Guilherme+Schell+3266+Fatima",
  },
  {
    id: 4,
    name: "AWR Baterias Moura e Heliar Gravataí",
    city: "Gravataí",
    address:
      "Av. Dorival Cândido Luz de Oliveira, 6625 - Bom Princípio, Gravataí - RS, 94070-001",
    phone: "tel:5135165472",
    whatsapp: "5551993199486",
    hours: "Seg-Sex: 8h-19h | Sáb: 8h-16h",
    mapsUrl:
      "https://www.google.com/maps/search/AWR+Baterias+Moura+e+Heliar+Gravatai+Av+Dorival+Candido+Luz+de+Oliveira+6625",
  },
  {
    id: 5,
    name: "AWR Baterias Moura e Heliar Novo Hamburgo",
    city: "Novo Hamburgo",
    address:
      "Av. Victor Hugo Kunz, 961 - Hamburgo Velho, Novo Hamburgo - RS, 93510-150",
    phone: "tel:5135165472",
    whatsapp: "5551993199486",
    hours: "Seg-Sex: 8h-19h | Sáb: 8h-14h",
    mapsUrl:
      "https://www.google.com/maps/search/AWR+Baterias+Moura+e+Heliar+Novo+Hamburgo+Av+Victor+Hugo+Kunz+961",
  },
  {
    id: 6,
    name: "AWR Baterias São Leopoldo",
    city: "São Leopoldo",
    address: "Av. Feitoria, 917 - São José, São Leopoldo - RS, 93040-193",
    phone: "tel:5135165472",
    whatsapp: "5551993199486",
    hours: "Seg-Sex: 8h-19h | Sáb: 8h-16h",
    mapsUrl:
      "https://www.google.com/maps/search/AWR+Baterias+Sao+Leopoldo+Av+Feitoria+917+Sao+Jose",
  },
];

export const expressCities = [
  "Porto Alegre", "Canoas", "Gravataí", "Alvorada", "São Leopoldo",
  "Cachoeirinha", "Novo Hamburgo", "Campo Bom", "Nova Santa Rita",
  "Esteio", "Sapucaia do Sul", "Viamão", "Eldorado do Sul",
];

export const scheduledCities = [
  "Guaíba", "Sapiranga", "Ivoti", "Caxias do Sul", "Pelotas",
  "Santa Maria", "Passo Fundo", "Rio Grande", "Santa Cruz do Sul",
  "Bento Gonçalves", "Bagé", "Uruguaiana", "Erechim", "Lajeado",
];

export const citiesServed = [...expressCities, ...scheduledCities];

export function getStoresForCity(city: string): Store[] {
  const direct = stores.filter((s) => s.city === city);
  if (direct.length > 0) return direct;
  const cityStoreMap: Record<string, number[]> = {
    Esteio: [3], "Sapucaia do Sul": [6], Cachoeirinha: [4], Alvorada: [2],
    Viamão: [1], Guaíba: [1], "Eldorado do Sul": [1], Sapiranga: [5],
    "Campo Bom": [5], Ivoti: [5], "Nova Santa Rita": [3],
  };
  const ids = cityStoreMap[city];
  if (ids) return stores.filter((s) => ids.includes(s.id));
  return [stores[0]];
}
