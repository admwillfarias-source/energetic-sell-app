## Objetivo
Eliminar sugestões pouco relacionadas que aparecem quando o cliente digita o modelo do carro no Hero. Hoje o autocomplete mostra também resultados muito tolerantes (fuzzy/fonético), o que polui as 3 opções exibidas.

## Diagnóstico
Em `src/lib/fitments.ts → searchVehicles / matchToken`:

- A função aceita match fonético e Levenshtein com até **4 erros** em palavras longas — isso traz "primos distantes" (ex.: digitar "ONIX" pode trazer modelos não relacionados que casam no fonético).
- Aceita também substring solta (ex.: token "GO" casa com "TIGGO", "JOGO", "ARGO", etc.).
- Não há limiar mínimo de score nem comparação relativa: se o melhor resultado é 20 e o terceiro é 6, os três são exibidos.

## Mudanças (apenas em `src/lib/fitments.ts`)

### 1. Reduzir tolerância do fuzzy
Em `maxEditsFor`:
```ts
if (token.length <= 3) return 0; // antes 1
if (token.length <= 5) return 1; // antes 2
if (token.length <= 8) return 2; // antes 3
return 2;                        // antes 4
```

### 2. Substring exigir token longo
Em `matchToken`, só aceitar `includes` quando o token tem ≥ 4 caracteres (evita "GO", "S10" casando em qualquer lugar). Mantém prefixo e exato como hoje.

### 3. Match fonético só quando não houver match literal
Aplicar fonético apenas se nenhum candidato literal (igual/prefixo/substring/levenshtein) foi encontrado para aquele token. Evita inflar score com "parecidos no som".

### 4. Filtro relativo de score
Após `scored.sort(...)`, antes de montar `out`:
- Pegar `topScore = scored[0].score`.
- Descartar resultados com `score < max(topScore * 0.6, topScore - 6)`.
- Também descartar qualquer resultado cujo score venha apenas de fuzzy/fonético quando existir pelo menos um resultado com match exato/prefixo (marcar isso adicionando flag `hadStrongMatch` em `matchToken` retornando via objeto, ou usando threshold absoluto: `score >= 8 * tokens.length` quando `topScore` for forte).

Implementação simples: somar `strongHits` (quantos tokens tiveram match exato/prefixo). Se `topRow.strongHits === tokens.length`, exigir o mesmo dos demais antes de incluir.

### 5. Manter limite de 3 (já está) e o modo "list" com 30.

## Resultado esperado
- "ONIX 2018" → só Onix e variantes diretas, sem modelos foneticamente parecidos.
- "PALIO" → só Palio (não Pálio + Stilo + Strada por substring/fuzzy).
- Quando o cliente digita algo realmente ambíguo (ex.: "HB"), o fallback fuzzy ainda funciona porque não há match forte concorrente.

## Sem alterações em
- UI (`VehicleAutocomplete.tsx` permanece intocado).
- Modo `"list"` usado em "mais buscados".
- Lógica de busca por SKU de bateria.
