## Objetivo

Reduzir tarefas longas na main thread e o tamanho do JS no caminho crítico, focando na página `/resultado` e no boot global.

## Mudanças

### 1. Code-split do Supabase client
Hoje `src/integrations/supabase/client.ts` é importado eagerly por vários módulos, puxando 128 KB de JS no boot.

- Auditar todos os arquivos que importam `@/integrations/supabase/client` no caminho crítico (Index, Resultado, Header).
- Onde o uso é só dentro de `useEffect` / handlers, trocar por `const { supabase } = await import("@/integrations/supabase/client")` dentro da função.
- Onde o uso é em provider global (auth), manter — mas garantir que o provider em si seja lazy se possível.

### 2. Lazy-load das seções abaixo da dobra em `Resultado.tsx`
Arquivo tem 466 linhas e renderiza tudo na primeira pintura.

- Extrair em componentes separados:
  - `ResultadoFAQ.tsx` (bloco FAQ)
  - `ResultadoCidades.tsx` (featured cities)
  - `ResultadoJsonLd.tsx` (geração + injeção de JSON-LD)
- Carregar via `React.lazy` + `<Suspense fallback={null}>` dentro de `Resultado.tsx`.
- O JSON-LD não bloqueia render — pode ser montado em `requestIdleCallback`.

### 3. Diferir construção do JSON-LD pesado
O `useMemo` de `jsonLd` (breadcrumb + itemList + faqPage + localBusiness + organization) roda no render inicial.

- Mover para `useEffect` + `requestIdleCallback`, guardando em state. Não afeta SEO porque o crawler do Google espera scripts injetados após load.

### 4. Instrumentação de medição
- Adicionar `markEvent("resultado_mounted")` no topo do `useEffect` inicial de `Resultado.tsx`.
- Adicionar `measureBetween("boot_to_resultado", "app_boot", "resultado_mounted")` logo após.
- Resultado fica visível em `window.__perfReport()` no console.

## Fora do escopo agora

- **lucide-react**: o pacote já é tree-shakable nativamente quando se usa `import { X } from "lucide-react"` (que é o padrão do projeto). O bundle de 157 KB visto no profile é o **dev server do Vite** servindo o módulo inteiro — em produção o tree-shake elimina ícones não usados. Não precisa mexer.
- **Reescrever a página inteira** — mantemos a estrutura atual, só extraímos seções.

## Validação

1. Rodar Lighthouse mobile na URL publicada (`energetic-sell-app.lovable.app/resultado?...`) — não no preview dev.
2. Comparar antes/depois nos diagnósticos:
   - "Avoid long main-thread tasks" — número de long tasks deve cair.
   - "Reduce unused JavaScript" — bytes do supabase saem do initial load.
3. No console: `window.__perfReport()` mostra o measure `boot_to_resultado`.

## Impacto esperado

- TBT: -200 a -400 ms.
- LCP em `/resultado`: -300 a -800 ms.
- Performance Score mobile: +5 a +10 pontos.
