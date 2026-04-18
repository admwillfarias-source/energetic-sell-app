export type Battery = {
  id: string;
  name: string;
  brand: string;
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

export const brands = [
  "Moura",
  "Heliar",
  "Excell",
  "Freedom",
  "Moura Nobreak",
  "Moura Moto",
  "Motobatt",
  "Zetta",
  "Eletran",
] as const;

export const amperageOptions = [
  5, 6, 7, 45, 50, 60, 70, 72, 80, 90, 92, 95, 100, 150, 180,
] as const;
