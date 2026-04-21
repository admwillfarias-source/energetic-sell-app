import { describe, it, expect } from "vitest";
import { looksLikeBatterySku, normalizeSku } from "./batterySku";

describe("normalizeSku", () => {
  it("uppercases and removes spaces/hyphens", () => {
    expect(normalizeSku(" m60-gd ")).toBe("M60GD");
    expect(normalizeSku("hefb 72 pd")).toBe("HEFB72PD");
  });
});

describe("looksLikeBatterySku — positivos (SKUs reais)", () => {
  const valid = [
    "M60GD",
    "M70KE",
    "MF60LD",
    "M100QD",
    "M150TD",
    "HG60DD",
    "HG70DT",
    "HFB72PD",
    "HEFB72PD",
    "Z60D",
    "ZF60LD",
    "EX60D",
    "EX70D",
    "DF1000",
    "DF2000",
    "MTX9",
    "MTX12U",
    "ETN60",
    "EL70D",
    // formatação tolerada
    "m60gd",
    " M60-GD ",
    "hefb 72 pd",
  ];
  for (const sku of valid) {
    it(`aceita "${sku}"`, () => {
      expect(looksLikeBatterySku(sku)).toBe(true);
    });
  }
});

describe("looksLikeBatterySku — negativos (não pode confundir com carro)", () => {
  const invalid = [
    "",
    "Onix",
    "Onix 2018",
    "Gol 1.0",
    "Fiat Uno 2015",
    "Polo",
    "Argo",
    "Civic",
    "Corolla 2020",
    "L200",        // nome de modelo de picape — sem padrão de bateria conhecido
    "L 200",
    "S10",
    "HRV",
    "C3",
    "208",
    "2018",
    "Mercedes Benz",
    "Land Rover",
    "VW Gol",
    "ABC",         // sem dígito
    "12345",       // sem letra
    "AB",          // muito curto
    "ABCDEFGHIJKLMNOP", // muito longo
    "60AH",        // capacidade, não SKU
    "M60",         // sem letras finais
    "60GD",        // não começa com letra
  ];
  for (const s of invalid) {
    it(`rejeita "${s}"`, () => {
      expect(looksLikeBatterySku(s)).toBe(false);
    });
  }
});
