

## Objetivo
Importar as 66 linhas da planilha enviada para a tabela `equivalents`, consolidando por código Moura (várias linhas com mesmo Moura viram um único grupo com todos os Tudors agregados).

## Análise dos dados
- Planilha tem 5 colunas: Tudor, Moura, Heliar, Excell, Zetta
- ~66 linhas, mas com Mouras repetidos. Exemplo: `M48FD` aparece 5x (TFS45PVD, TFS36PVD, TFS40PVD, TFS45PVD, etc) → vira 1 grupo com 5 Tudors
- Banco já tem 1 grupo (`M50ED/M50EX` ↔ `H50GD` ↔ `Z50ED`) — a planilha confirma e adiciona o Tudor `TFS50PHP, TFS50PVD`
- Coluna `tudor` já existe na tabela (vista no Admin.tsx)

## Estratégia de consolidação
Agrupar por **código Moura único**. Para cada grupo:
- `moura`: [código único]
- `heliar`, `excell`, `zetta`, `tudor`: união (set) de todos os valores das linhas com aquele Moura, removendo vazios e duplicatas

Resultado estimado: ~25-30 grupos únicos a partir das 66 linhas.

## Conflito a resolver
O grupo existente no banco tem `moura: [M50ED, M50EX]`. A planilha só tem `M50ED`. Vou **manter o grupo existente** e apenas **adicionar os Tudors** (`TFS50PHP, TFS50PVD`) via UPDATE, sem duplicar.

## Implementação
1. **Script de consolidação** (Python local, em /tmp): lê as linhas, agrupa por Moura, gera SQL de INSERT/UPDATE
2. **Migration SQL**: 
   - UPDATE no grupo existente (M50ED) adicionando os Tudors
   - INSERT dos demais ~25-30 grupos novos
3. **Invalidar cache** automaticamente — já acontece pois `Admin.tsx` chama `invalidateCatalogCache()` após edições, e o front recarrega via `ensureCatalogLoaded()`

## Mudanças de código
Nenhuma. Apenas migration SQL com os dados. O Admin.tsx já mostra/edita a coluna `tudor` e `equivalents.ts` já consome via `getEquivalents()`.

## Após importar
Você poderá:
- Abrir `/admin` → aba "Equivalências" e ver/editar todos os grupos
- O motor de busca por veículo passará a sugerir Tudor também (precisa que `equivalents.ts` inclua `tudor` no retorno — atualmente só retorna heliar/zetta/excell). **Adicionarei `...group.tudor` no retorno de `getEquivalentsForMouraCode`** para que Tudors equivalentes sejam considerados ao buscar produtos no WooCommerce.

## Arquivos
- Nova migration SQL (gerada do script)
- `src/lib/equivalents.ts` — incluir `tudor` no spread de retorno

