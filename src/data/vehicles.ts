// Lista mínima de veículos populares para a navegação rápida.

export interface VehiclePageData {
  slug: string;
  make: string;
  model: string;
}

export const vehiclePages: VehiclePageData[] = [
  { slug: "fiat-strada", make: "Fiat", model: "Strada" },
  { slug: "fiat-uno", make: "Fiat", model: "Uno" },
  { slug: "fiat-toro", make: "Fiat", model: "Toro" },
  { slug: "fiat-palio", make: "Fiat", model: "Palio" },
  { slug: "volkswagen-gol", make: "Volkswagen", model: "Gol" },
  { slug: "volkswagen-polo", make: "Volkswagen", model: "Polo" },
  { slug: "volkswagen-saveiro", make: "Volkswagen", model: "Saveiro" },
  { slug: "volkswagen-amarok", make: "Volkswagen", model: "Amarok" },
  { slug: "chevrolet-onix", make: "Chevrolet", model: "Onix" },
  { slug: "chevrolet-s10", make: "Chevrolet", model: "S10" },
  { slug: "hyundai-hb20", make: "Hyundai", model: "HB20" },
  { slug: "hyundai-creta", make: "Hyundai", model: "Creta" },
  { slug: "toyota-corolla", make: "Toyota", model: "Corolla" },
  { slug: "toyota-hilux", make: "Toyota", model: "Hilux" },
  { slug: "honda-civic", make: "Honda", model: "Civic" },
  { slug: "renault-logan", make: "Renault", model: "Logan" },
  { slug: "renault-sandero", make: "Renault", model: "Sandero" },
  { slug: "jeep-renegade", make: "Jeep", model: "Renegade" },
  { slug: "jeep-compass", make: "Jeep", model: "Compass" },
  { slug: "ford-ranger", make: "Ford", model: "Ranger" },
];
