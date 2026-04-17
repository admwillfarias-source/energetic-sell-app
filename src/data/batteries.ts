export type Battery = {
  id: string;
  name: string;
  brand: "Moura" | "Heliar" | "Bosch" | "Acdelco";
  amperage: number; // Ah
  warranty: number; // months
  price: number;
  oldPrice?: number;
  image: string;
  description: string;
  compatibility: string[];
  features: string[];
  permalink?: string;
};

export const batteries: Battery[] = [
  {
    id: "moura-60ah",
    name: "Moura M60GD",
    brand: "Moura",
    amperage: 60,
    warranty: 18,
    price: 459.9,
    oldPrice: 519.9,
    image: "/placeholder.svg",
    description: "Bateria selada livre de manutenção, ideal para carros populares 1.0 a 1.6.",
    compatibility: ["Gol", "Onix", "HB20", "Palio", "Fiesta"],
    features: ["Selada", "Livre de manutenção", "Polo positivo direito"],
  },
  {
    id: "moura-70ah",
    name: "Moura M70KE",
    brand: "Moura",
    amperage: 70,
    warranty: 24,
    price: 579.9,
    image: "/placeholder.svg",
    description: "Alta performance para carros 1.8 a 2.0 com muitos acessórios elétricos.",
    compatibility: ["Civic", "Corolla", "Cruze", "Jetta"],
    features: ["Selada", "Alta CCA", "Polo positivo direito"],
  },
  {
    id: "heliar-60ah",
    name: "Heliar Free 60Ah",
    brand: "Heliar",
    amperage: 60,
    warranty: 18,
    price: 449.0,
    image: "/placeholder.svg",
    description: "Bateria Heliar Free, sem manutenção, com tecnologia Cálcio-Cálcio.",
    compatibility: ["Gol", "Uno", "Sandero", "Ka"],
    features: ["Cálcio-Cálcio", "Selada", "Indicador de carga"],
  },
  {
    id: "heliar-75ah",
    name: "Heliar Superfree 75Ah",
    brand: "Heliar",
    amperage: 75,
    warranty: 24,
    price: 689.0,
    image: "/placeholder.svg",
    description: "Para SUVs e picapes médias com alto consumo elétrico.",
    compatibility: ["Hilux", "S10", "Compass", "Tracker"],
    features: ["Alta durabilidade", "Selada", "Polo positivo direito"],
  },
  {
    id: "bosch-60ah",
    name: "Bosch S4 60Ah",
    brand: "Bosch",
    amperage: 60,
    warranty: 24,
    price: 539.9,
    image: "/placeholder.svg",
    description: "Tecnologia alemã com excelente partida a frio.",
    compatibility: ["Polo", "Virtus", "T-Cross", "Nivus"],
    features: ["Alta CCA", "Selada", "Premium"],
  },
  {
    id: "bosch-70ah",
    name: "Bosch S5 70Ah",
    brand: "Bosch",
    amperage: 70,
    warranty: 30,
    price: 749.0,
    image: "/placeholder.svg",
    description: "Linha premium para veículos com sistema start-stop básico.",
    compatibility: ["Golf", "Tiguan", "Audi A3", "BMW 320i"],
    features: ["Premium", "Longa vida útil", "Selada"],
  },
  {
    id: "acdelco-50ah",
    name: "ACDelco Gold 50Ah",
    brand: "Acdelco",
    amperage: 50,
    warranty: 18,
    price: 399.0,
    image: "/placeholder.svg",
    description: "Solução econômica e confiável para carros compactos.",
    compatibility: ["Celta", "Mobi", "Up!", "Kwid"],
    features: ["Selada", "Custo-benefício"],
  },
  {
    id: "moura-100ah",
    name: "Moura M100LE",
    brand: "Moura",
    amperage: 100,
    warranty: 24,
    price: 1149.0,
    image: "/placeholder.svg",
    description: "Bateria robusta para caminhonetes a diesel e veículos comerciais.",
    compatibility: ["Hilux Diesel", "Ranger", "S10 Diesel", "Amarok"],
    features: ["Alta CCA", "Diesel", "Heavy duty"],
  },
  {
    id: "heliar-45ah",
    name: "Heliar Original 45Ah",
    brand: "Heliar",
    amperage: 45,
    warranty: 12,
    price: 339.0,
    image: "/placeholder.svg",
    description: "Para motos de alta cilindrada e carros pequenos.",
    compatibility: ["Fiat 147", "Fusca", "Motos 600cc+"],
    features: ["Compacta", "Selada"],
  },
  {
    id: "bosch-90ah",
    name: "Bosch S5 AGM 90Ah",
    brand: "Bosch",
    amperage: 90,
    warranty: 36,
    price: 1499.0,
    image: "/placeholder.svg",
    description: "Tecnologia AGM para veículos com start-stop avançado.",
    compatibility: ["BMW Série 5", "Mercedes Classe C", "Audi Q5"],
    features: ["AGM", "Start-Stop", "Premium"],
  },
];

export const brands = ["Moura", "Heliar", "Bosch", "Acdelco"] as const;

export const carBrands = [
  { name: "Volkswagen", models: ["Gol", "Polo", "Virtus", "T-Cross", "Nivus", "Jetta", "Golf"] },
  { name: "Chevrolet", models: ["Onix", "Cruze", "S10", "Tracker", "Celta"] },
  { name: "Fiat", models: ["Palio", "Uno", "Mobi", "Argo", "Strada"] },
  { name: "Ford", models: ["Ka", "Fiesta", "Ranger"] },
  { name: "Toyota", models: ["Corolla", "Hilux", "Yaris"] },
  { name: "Honda", models: ["Civic", "Fit", "HR-V"] },
  { name: "Hyundai", models: ["HB20", "Creta"] },
  { name: "Renault", models: ["Sandero", "Kwid", "Duster"] },
];

export const years = Array.from({ length: 20 }, (_, i) => String(2025 - i));
