## Objetivo

Deixar o app mais rápido quando carregado dentro do iframe do WordPress (parâmetro `?embed=1`), sem afetar a versão standalone.

## Diagnóstico

Hoje, dentro do iframe, ainda pagamos custos que o tema WP já cobre ou que não fazem sentido no iframe:

1. **Header lazy** — sempre monta após idle, mesmo no iframe (parent já tem header próprio).
2. **MobileActionBar** — sempre renderiza no topo; no iframe duplica a barra de contato do parent e ocupa espaço caro acima da dobra.
3. **Pré-fetch de `HomeBottom`** — agendado em idle mesmo quando o bloco final é menos prioritário no iframe.
4. **Preconnect a `awrbaterias.com.br`** — desperdiçado quando o iframe já está dentro desse domínio (handshake duplicado).
5. **Fontes `@fontsource` (Inter 400/600 + Jakarta 700/800) via CSS `?url`** — `loadFontsDeferred` já pula no iframe ✓, mas o `index.html` ainda preloada Jakarta 800 e Inter 400/600 como `woff2` (3 requisições) que o parent normalmente já tem em cache de outra forma; podemos remover o preload de **Inter 400** no iframe (o fallback metrics-adjusted cobre). Manter Jakarta 800 + Inter 600 (LCP/H1).
6. **CSS bundle** — atualmente o Vite injeta um único CSS para a app. Já é pequeno, manter.
7. **JSON-LD organização** — já pulado no iframe ✓.
8. **GTM/GA4/Ads** — já pulado no iframe ✓.
9. **CartDrawer + portal** — montado sempre via Suspense; necessário (escuta `open-checkout`). Manter.
10. **Hero shell estático no `#root`** — pinta antes do bundle; bom para LCP. Manter.

## Mudanças propostas (apenas no caminho iframe)

### 1. `src/pages/Index.tsx`
- Não montar o `Header` quando `EMBEDDED` (remove o `useEffect` de `showHeader` no caso embed e o bloco JSX).
- Não renderizar o `MobileActionBar` quando `EMBEDDED`.
- Ajustar `pt-[116px] lg:pt-0` do `<main>` para `pt-0` quando `EMBEDDED` (sem header/mobile bar, não há altura fixa para compensar — ganha viewport útil acima da dobra).
- Pré-fetch em idle: no iframe, pré-buscar só `HomeMiddle` (já é o caso para HomeBottom só no iframe? hoje busca os dois — manter HomeBottom também faz sentido pois o footer foi pedido; deixar como está).

### 2. `src/lib/loadTracking.ts`
- Já está ótimo no iframe (early return). Sem mudanças.

### 3. `index.html`
- Adicionar pequeno script inline **no topo do `<head>`** que detecta `?embed=1` e remove os `<link rel="preload">` de:
  - `awrbaterias.com.br` (preconnect/dns-prefetch)
  - `inter-400.woff2` (não usado em hero crítico do iframe)
- Manter preloads do hero AVIF/WebP, Jakarta 800 e Inter 600 (são o LCP).

### 4. `src/components/HeroSection.tsx` (se aplicável)
- Verificar se há animações/efeitos que rodam só no iframe sem necessidade. Se houver `framer-motion` pesado no hero, considerar desabilitar transições no iframe para reduzir TBT (ajustar somente após confirmar pelo arquivo).

### 5. `src/lib/iframeAutoResize.ts`
- Substituir o envio bruto de `scrollHeight` em cada `ResizeObserver` por **debounce de 80ms** + comparação de altura, evitando rajadas de `postMessage` enquanto imagens carregam (reduz reflow no parent).

## Não-objetivos

- Não mexer em design, copy, layout ou comportamento da versão standalone.
- Não trocar libs nem alterar build/Vite.
- Não tocar em backend, edge functions ou banco.

## Validação

- Abrir preview com `?embed=1` no preview URL e medir Lighthouse mobile (TBT, LCP) antes/depois.
- Confirmar que header/mobile bar somem no iframe e seguem aparecendo no standalone.
- Confirmar que o auto-resize continua reportando altura correta ao parent.