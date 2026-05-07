// Top 12 carros mais vendidos no Brasil nos últimos 10 anos
// Usado nos atalhos do SearchOverlay para acelerar a escolha do cliente.
//
// IMPORTANTE: este arquivo NÃO altera a tabela de aplicação (fitments).
// Define apenas, por veículo, os SKUs corretos para versão padrão e versão
// Start/Stop, e a partir de que ano o modelo passou a ter Start/Stop, para
// que o cliente escolha a bateria certa direto no atalho.

export type TopVehicle = {
  brand: string;
  model: string;
  /** Query enviada ao searchVehicles (marca + modelo). */
  query: string;
  /** Rótulo curto para o card. */
  label: string;
  /** SKUs (Moura, Zetta, Heliar, Excell) da versão SEM Start/Stop. */
  standardSkus: string[];
  /** SKUs EFB/AGM para versão COM Start/Stop. Vazio = modelo não tem S/S. */
  startStopSkus?: string[];
  /** Ano (inclusive) a partir do qual existe versão Start/Stop. */
  startStopFromYear?: number;
};

export const TOP_VEHICLES: TopVehicle[] = [
  {
    brand: "Chevrolet",
    model: "Onix",
    query: "Chevrolet Onix",
    label: "Onix",
    standardSkus: ["M60GD", "Z60D", "H60DD", "EXF60DPD"],
    startStopSkus: ["EFB60HD", "HEFB60HD", "MF60AD", "EXF60DPD"],
    startStopFromYear: 2020,
  },
  {
    brand: "Hyundai",
    model: "HB20",
    query: "Hyundai HB20",
    label: "HB20",
    standardSkus: ["M60AD", "Z60D", "HE60HD", "EXF60DPD"],
    startStopSkus: ["MA60AD", "HAGM60HD"],
    startStopFromYear: 2020,
  },
  {
    brand: "Fiat",
    model: "Strada",
    query: "Fiat Strada",
    label: "Strada",
    standardSkus: ["M60AD", "Z60D", "HE60HD", "EXF60DPD"],
    startStopSkus: ["MF60AD", "HEFB60HD"],
    startStopFromYear: 2021,
  },
  {
    brand: "Volkswagen",
    model: "Polo",
    query: "Volkswagen Polo",
    label: "Polo",
    standardSkus: ["M50ED", "Z50ED", "HE50GD"],
    startStopSkus: ["MF60AD", "HEFB60HD"],
    startStopFromYear: 2020,
  },
  {
    brand: "Fiat",
    model: "Argo",
    query: "Fiat Argo",
    label: "Argo",
    standardSkus: ["M50ED", "Z50ED", "HE50GD"],
    startStopSkus: ["MF60AD", "HEFB60HD"],
    startStopFromYear: 2017,
  },
  {
    brand: "Fiat",
    model: "Mobi",
    query: "Fiat Mobi",
    label: "Mobi",
    standardSkus: ["M50ED", "Z50ED", "HE50GD"],
  },
  {
    brand: "Renault",
    model: "Kwid",
    query: "Renault Kwid",
    label: "Kwid",
    standardSkus: ["M40SD", "Z45D", "H40JD", "EXF40JD"],
  },
  {
    brand: "Toyota",
    model: "Corolla",
    query: "Toyota Corolla",
    label: "Corolla",
    standardSkus: ["M50ED", "Z50ED", "HE50GD"],
  },
  {
    brand: "Volkswagen",
    model: "T-Cross",
    query: "Volkswagen T-Cross",
    label: "T-Cross",
    standardSkus: ["M60AD", "Z60D", "HE60HD", "EXF60DPD"],
    startStopSkus: ["MF60AD", "HEFB60HD"],
    startStopFromYear: 2018,
  },
  {
    brand: "Chevrolet",
    model: "Tracker",
    query: "Chevrolet Tracker",
    label: "Tracker",
    standardSkus: ["M60AD", "Z60D", "HE60HD", "EXF60DPD"],
    startStopSkus: ["MF60AD", "HEFB60HD"],
    startStopFromYear: 2020,
  },
  {
    brand: "Jeep",
    model: "Compass",
    query: "Jeep Compass",
    label: "Compass",
    standardSkus: ["M75LD", "Z70D", "H75PD", "EXF75ND"],
    startStopSkus: ["MF72LD", "HEFB72PD"],
    startStopFromYear: 2016,
  },
  {
    brand: "Toyota",
    model: "Hilux",
    query: "Toyota Hilux",
    label: "Hilux",
    standardSkus: ["M75LD", "Z70D", "H75PD", "EXF75ND"],
  },
];
