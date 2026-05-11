import { describe, it, expect } from "vitest";
import { parseCodesParam } from "./parseCodesParam";

describe("parseCodesParam", () => {
  it("retorna lista vazia para entradas vazias", () => {
    expect(parseCodesParam("")).toEqual([]);
    expect(parseCodesParam(null)).toEqual([]);
    expect(parseCodesParam(undefined)).toEqual([]);
  });

  it("aceita vírgula simples", () => {
    expect(parseCodesParam("A,B,C")).toEqual(["A", "B", "C"]);
  });

  it("aceita barra como separador", () => {
    expect(parseCodesParam("A/B/C")).toEqual(["A", "B", "C"]);
  });

  it("aceita mistura de separadores (vírgula, barra, espaço, pipe, ponto-e-vírgula)", () => {
    expect(parseCodesParam("A, B/C;D|E F")).toEqual(["A", "B", "C", "D", "E", "F"]);
  });

  it("remove duplicados case-insensitive preservando ordem", () => {
    expect(parseCodesParam("a,A,b,B,c")).toEqual(["A", "B", "C"]);
  });

  it("ignora apenas-separadores", () => {
    expect(parseCodesParam(",,,")).toEqual([]);
    expect(parseCodesParam(" / / ")).toEqual([]);
    expect(parseCodesParam("  ")).toEqual([]);
  });

  it("não perde códigos quando há separadores adjacentes", () => {
    expect(parseCodesParam("MF60AD//ECON60EFB,,HEFB60HD")).toEqual([
      "MF60AD",
      "ECON60EFB",
      "HEFB60HD",
    ]);
  });

  it("preserva a ordem da primeira ocorrência", () => {
    expect(parseCodesParam("Z,A,Z,B,A")).toEqual(["Z", "A", "B"]);
  });
});
