

## Objetivo
Garantir que **toda busca por veículo retorne 4 baterias** (uma de cada marca: Moura, Heliar, Excell, Zetta) sempre que a planilha de equivalências tiver os códigos cadastrados, buscando os produtos reais no WooCommerce.

## Diagnóstico atual

1. **Busca já usa WooCommerce** via edge function `wc-products` → `awrbaterias.com.br/wp-json/wc/store/products`. ✅
2. **Problema 1 — Equivalentes incompletos**: a planilha `HELIAR_Tabelas_Aplicacoes_2025.xlsx` enviada precisa ser importada na tabela `public.equivalents` para complementar/atualizar os 27 grupos atuais (em especial linhas Heliar que ainda não estão mapeadas).
3. **Problema 2 — Garantia de 4 marcas no resultado**: hoje em `BatteryGrid.tsx`, quando há veículo selecionado, o código pega "1 melhor de cada marca preferred". Se o WooCommerce não devolveu produto de alguma marca (porque a busca foi feita só pelo SKU técnico que ele não indexa), aquela marca fica faltando, mesmo a planilha tendo o código.
4. **Problema 3 — Fallback por nome**: já injetamos "Heliar 60Ah", "Excell 60Ah" etc., mas se o WooCommerce devolver um produto que o `detectBrand` classifica errado (ex.: classifica Excell como Moura), o slot da marca correta fica vazio.

## Mudanças propostas

### 1. Importar a planilha Heliar 2025 na tabela `equivalents`
- Em modo default, fazer parse do `HELIAR_Tabelas_Aplicacoes_2025.xlsx` (openpyxl/pandas).
- Para cada linha da planilha, fazer **merge** no grupo Moura correspondente (chave = primeiro código Moura). Se o grupo não existir, inserir novo.
- Adicionar/completar os arrays `heliar`, `excell`, `zetta` sem apagar dados já existentes.
- Gerar migration de UPDATE/INSERT controlada (não usar dados.json local — só banco).

### 2. Garantir busca por marca explícita (`src/lib/api/batteries.ts`)
Adicionar uma nova função `fetchBatteriesByVehicle(codes, brandsWanted)` que:
- Para **cada marca alvo** (Moura, Heliar, Excell, Zetta), faz uma busca paralela no `wc-products` usando os códigos+nomes daquela marca extraídos do grupo de equivalência.
- Retorna no máximo **1 produto por marca**, escolhendo o de maior preço (premium primeiro).
- Se a marca não tiver código cadastrado na planilha, faz fallback para `"<Marca> <Ah>Ah"` (ex.: `Heliar 60Ah`).
- Garante classificação correta da marca pelo nome do produto (não pela inferência do `detectBrand` atual).

### 3. Refatorar `BatteryGrid.tsx`
- Quando `?v=` (veículo) estiver presente: chamar `fetchBatteriesByVehicle` em vez do fluxo genérico `fetchBatteries`.
- Resultado já vem com 1 por marca, ordenado do mais caro para o mais barato.
- Mostrar até **4 cards** (Moura, Heliar, Excell, Zetta) quando todos disponíveis.
- Se uma marca não retornar produto, mostrar 3 (não exibir slot vazio).

### 4. Edge function `wc-products` — sem alteração
Já aceita `?codes=a,b,c` e faz fan-out paralelo. Vamos reutilizar passando os termos por marca (ex.: chamar 4× a função, uma por marca).

## Arquivos afetados
- `supabase/migrations/<novo>.sql` — merge da planilha Heliar em `equivalents`.
- `src/lib/api/batteries.ts` — nova função `fetchBatteriesByVehicle`.
- `src/components/BatteryGrid.tsx` — usar a nova função quando há veículo.
- `src/lib/equivalents.ts` — expor helper `getGroupForMouraCode` (retorna o grupo completo por marca).

## Resultado esperado
Buscar "Onix 2018", "Polo 2020" ou "Hilux 2019" retorna sempre **4 cards** — um Moura, um Heliar, um Excell e um Zetta — com preços reais do WooCommerce, ordenados do mais caro para o mais barato.

