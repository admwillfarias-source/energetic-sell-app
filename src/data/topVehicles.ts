// Top 12 carros mais vendidos no Brasil nos últimos 10 anos
// Usado nos atalhos do SearchOverlay para acelerar a escolha do cliente.

export type TopVehicle = {
  brand: string;
  model: string;
  /** Query enviada ao searchVehicles (marca + modelo). */
  query: string;
  /** Rótulo curto para o card. */
  label: string;
};

export const TOP_VEHICLES: TopVehicle[] = [
  { brand: "Chevrolet", model: "Onix", query: "Chevrolet Onix", label: "Onix" },
  { brand: "Hyundai", model: "HB20", query: "Hyundai HB20", label: "HB20" },
  { brand: "Fiat", model: "Strada", query: "Fiat Strada", label: "Strada" },
  { brand: "Volkswagen", model: "Polo", query: "Volkswagen Polo", label: "Polo" },
  { brand: "Fiat", model: "Argo", query: "Fiat Argo", label: "Argo" },
  { brand: "Fiat", model: "Mobi", query: "Fiat Mobi", label: "Mobi" },
  { brand: "Renault", model: "Kwid", query: "Renault Kwid", label: "Kwid" },
  { brand: "Toyota", model: "Corolla", query: "Toyota Corolla", label: "Corolla" },
  { brand: "Volkswagen", model: "T-Cross", query: "Volkswagen T-Cross", label: "T-Cross" },
  { brand: "Chevrolet", model: "Tracker", query: "Chevrolet Tracker", label: "Tracker" },
  { brand: "Jeep", model: "Compass", query: "Jeep Compass", label: "Compass" },
  { brand: "Toyota", model: "Hilux", query: "Toyota Hilux", label: "Hilux" },
];
