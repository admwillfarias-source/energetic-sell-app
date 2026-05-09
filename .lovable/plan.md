## Diagnóstico (mobile, 440px)

A inspeção da rede e do código mostrou três gargalos reais (não é a imagem do hero — ela já está em 41 KB AVIF):

1. **Duas requisições concorrentes para `wc-products`**: `per_page=60` e `per_page=30` saem ao mesmo tempo. Causa: `useIsMobile()` começa retornando `false` (estado `undefined → !!undefined = false`) e depois muda para `true`. Como a `queryKey` do React Query inclui `isMobile ? "m" : "d"`, dispara duas fetchs. No mobile a primeira (60 produtos, ~250 KB) é puro desperdício.
2. **Payload do edge function ainda gordo**: `slim()` mantém `description` e `short_description` completos. Os cards (`BatteryMouraCard`) só usam `name`, `sku`, `price`, `image`, `slug`. As descrições não são usadas em lista — somam ~70% do JSON.
3. **Seções lazy disparam cedo demais no mobile**: `HomeMiddle` usa `rootMargin: 200px` e `HomeBottom` `100px`. Em uma viewport de 718 px isso significa que ambas montam quase imediatamente, baixando os chunks e disparando o fetch dos produtos antes do usuário rolar.

Há também um warning React (`fetchPriority`/`fetchpriority`) em `BatteryImage` que vaza para o console em produção e adiciona ruído, mas não impacta performance.

## Plano (escopo: só performance mobile, sem mudar layout)

### 1. Corrigir o fetch duplicado em `BestSellers`
- Aguardar `useIsMobile()` definir um valor antes de habilitar a query (`enabled: isMobile !== undefined`) e estabilizar a `queryKey` para não disparar duas chamadas.
- Resultado direto: −1 request HTTP, −~250 KB transferidos, −~600 ms na 4G simulada.

### 2. Enxugar o `wc-products` edge function
- Remover `description` do payload (não é usado em lista). Reter apenas a primeira frase de `short_description` (até ~140 chars) caso algum lugar use.
- Bumping de `Cache-Control` `s-maxage` para 1800 s (30 min) — dados de catálogo não mudam de minuto em minuto.
- Resultado: payload de ~250 KB → ~30–50 KB.

### 3. Atrasar seções abaixo da dobra no mobile
- `HomeMiddle`: `rootMargin` de 200 px → 50 px.
- `HomeBottom`: `rootMargin` de 100 px → 0 px.
- Mantém o pré-fetch dos chunks em idle (já existe no `Index.tsx`), então o clique/scroll continua instantâneo, mas o fetch de produtos só ocorre quando o usuário realmente se aproxima.

### 4. Limpar warning `fetchPriority` no `BatteryImage`
- Trocar para o atributo correto (lowercase via `// @ts-expect-error` ou usar `fetchpriority` direto). Remove erro recorrente do console que polui DevTools e custa CPU em dev/preview.

### 5. Validação
- Recarregar a preview no viewport 440×718, conferir em DevTools/Network:
  - apenas 1 chamada para `wc-products`
  - tamanho da resposta < 60 KB
  - chunks `home-middle` e `home-bottom` não baixam até o scroll começar
- Conferir LCP no `perfMetrics` e console limpo.

## Arquivos a editar

- `src/components/BestSellers.tsx` — corrigir `enabled`/`queryKey`.
- `supabase/functions/wc-products/index.ts` — enxugar `slim()` e ajustar cache.
- `src/pages/Index.tsx` — reduzir `rootMargin` das duas `LazySection`.
- `src/components/BatteryImage.tsx` — corrigir prop `fetchPriority`.

## O que NÃO será alterado

- Layout, cores, copy, estrutura de componentes.
- Hero (já otimizado: AVIF 41 KB + preload).
- Bundle splitting do Vite (já razoável).
- Fluxo de busca/checkout.

## Ganho esperado

- Transferência inicial mobile: ~−250 a −300 KB.
- Tempo até "best_sellers_ready" em 4G: ~−1 a 2 s.
- LCP mantido (já < 2.5 s); TTI/TBT melhoram pelo fetch único + JSON menor.
