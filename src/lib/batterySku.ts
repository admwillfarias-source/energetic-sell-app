/**
 * Detecção confiável de SKU/modelo de bateria.
 *
 * SKUs típicos das marcas vendidas: Moura, Heliar, Zetta, Excell, Freedom,
 * Motobatt, Eletran. Exemplos reais:
 *   - Moura:    M60GD, M70KE, MF60LD, M100QD, M150TD
 *   - Heliar:   HG60DD, HG70DT, HFB72PD, HEFB72PD
 *   - Zetta:    Z60D, Z70D, ZF60LD
 *   - Excell:   EX60D, EX70D
 *   - Freedom:  DF1000, DF2000, DF3000
 *   - Motobatt: MTX9, MTX12U
 *
 * Regras gerais (todas devem ser satisfeitas para considerar SKU):
 *  1) Comprimento entre 4 e 14 (após remover espaços/hífens).
 *  2) Tem pelo menos uma letra E pelo menos um dígito.
 *  3) Começa com letra (SKUs de bateria sempre começam com prefixo alfabético).
 *  4) Composto SOMENTE por A-Z e 0-9.
 *  5) Casa com pelo menos um padrão conhecido das marcas listadas.
 *
 * Filtros anti-falso-positivo (rejeita strings que parecem nome de carro
 * com motor/ano):
 *  - "L 200", "L200" sozinho? "L200" tem 4 chars mas falha no padrão (sem
 *    prefixo conhecido + sem letra final). Cobertura via lista de padrões.
 *  - "Onix 2018", "Gol 1.0" — contém espaço/ponto, é eliminado por (4).
 *  - "Polo", "Argo" — sem dígito, eliminado por (2).
 */

export function normalizeSku(input: string): string {
  return input.trim().toUpperCase().replace(/[\s-]+/g, "");
}

// Padrões conhecidos de SKU. Ordem irrelevante — basta um casar.
const SKU_PATTERNS: RegExp[] = [
  // Moura: M + (opcional letra) + 2-3 dígitos + 1-3 letras finais
  // Ex.: M60GD, MF60LD, M100QD, M150TD
  /^M[A-Z]?\d{2,3}[A-Z]{1,3}$/,
  // Heliar: HG/HF/HEFB/HFB + 2-3 dígitos + 1-3 letras finais
  // Ex.: HG60DD, HFB72PD, HEFB72PD
  /^H(?:G|F|EFB|FB|EF)\d{2,3}[A-Z]{1,3}$/,
  // Zetta: Z + (opcional letra) + 2-3 dígitos + 1-2 letras finais
  // Ex.: Z60D, ZF60LD
  /^Z[A-Z]?\d{2,3}[A-Z]{1,2}$/,
  // Excell: EX + 2-3 dígitos + 1-2 letras finais
  /^EX\d{2,3}[A-Z]{1,2}$/,
  // Freedom: DF + 3-4 dígitos
  /^DF\d{3,4}$/,
  // Motobatt: MTX + dígitos + opcional letra
  /^MTX\d{1,3}[A-Z]?$/,
  // Eletran: ETN/EL + 2-3 dígitos + opcional 1-2 letras
  /^(?:ETN|EL)\d{2,3}[A-Z]{0,2}$/,
];

/**
 * Retorna true se a string parece ser um SKU/modelo de bateria.
 * Conservador por padrão para evitar falsos positivos com nomes de carros.
 */
export function looksLikeBatterySku(input: string): boolean {
  if (!input) return false;
  const s = normalizeSku(input);
  if (s.length < 4 || s.length > 14) return false;
  if (!/^[A-Z]/.test(s)) return false;
  if (!/^[A-Z0-9]+$/.test(s)) return false;
  if (!/[A-Z]/.test(s) || !/\d/.test(s)) return false;
  return SKU_PATTERNS.some((re) => re.test(s));
}
