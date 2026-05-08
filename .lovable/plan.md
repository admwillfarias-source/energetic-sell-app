# Otimizar carregamento em iFrame

Dois eixos: (a) garantir que todo `<iframe>` que o app renderiza só carregue quando visível; (b) deixar o próprio app mais leve quando ele é embedado dentro de um iframe (caso do tema WordPress `awr-baterias-fast`, que injeta o app via iframe).

## 1. Iframes renderizados pelo app

**`src/components/CityMap.tsx`** — iframe do Google Maps já tem `loading="lazy"`. Falta:
- adicionar `width`/`height` explícitos (evita CLS quando o iframe entra na viewport);
- adicionar `fetchpriority="low"` e `decoding="async"` (atributos válidos para iframes em browsers Chromium);
- trocar de "carregar quando entra na viewport" (lazy nativo, ~2.500 px) para um carregamento ainda mais tardio via `IntersectionObserver` com `rootMargin="200px"` apenas no primeiro mapa da página de City (mais agressivo que o lazy nativo, evita baixar o embed do Maps quando o usuário sai antes da seção).

**`src/pages/CheckoutTest.tsx`** — página interna de QA. Adicionar `loading="lazy"` nos iframes da grade só por consistência (impacto baixo, mas evita disparar 6 iframes em paralelo ao abrir a página).

## 2. App rodando dentro de iframe

Detectar `window.self !== window.top` em um helper novo `src/lib/isEmbedded.ts` e usar para:

**`src/components/SplashScreen.tsx`** — pular o splash quando embedado. O parent (WP) já mostrou seu próprio chrome; mostrar o splash branco em cima causa flash duplo e atrasa o LCP do iframe. Ganho estimado: −380 ms no LCP do iframe.

**`src/lib/loadTracking.ts`** — quando dentro de iframe, NÃO injetar GTM/GA4/Ads. O parent (`wp-theme/awr-baterias/index.php`) já carrega GTM-5JTRM2L e GA4 G-FJ1MK5SLS5 — duplicar gera double-counting de pageviews + ~80 KB de JS extra desnecessário no iframe. Em vez disso, expor `window.gtag_report_conversion` que faz `window.parent.postMessage({type:'awr_conversion'}, '*')` e o parent dispara a conversion no contexto certo. Adicionar listener no header do tema WP para receber.

**`src/main.tsx`** — quando embedado, adiar `loadFontsDeferred()` mais agressivamente (idle 4 s ou primeira interação) — fontes do hero já estão preloaded em `index.html` e cobrem o above-the-fold.

**`index.html`** — quando o documento for carregado em iframe, o preload do hero (`hero-bg-sm.avif/webp`) só faz sentido se o iframe for visível imediatamente. Como o tema WP usa `loading="lazy"` no iframe (`wp-theme/awr-baterias-fast/inc/perf-iframe.php`), o preload só dispara quando o iframe entra em viewport — comportamento correto, manter como está. Adicionar apenas `<meta name="referrer" content="strict-origin-when-cross-origin">` para reduzir overhead de headers em requests cross-origin do iframe.

## 3. Tema WordPress (parent)

`wp-theme/awr-baterias-fast/inc/perf-iframe.php` já injeta `loading="lazy"`, `decoding="async"`, `fetchpriority="low"`, `width/height` em todos os iframes do conteúdo. Adicionar:
- listener `window.addEventListener('message', ...)` em `wp-theme/awr-baterias-fast/assets/theme.js` para receber `awr_conversion` do iframe e disparar `gtag('event','conversion', …)` no contexto top.

## Detalhes técnicos

```text
src/lib/isEmbedded.ts        (novo)   helper window.self !== window.top
src/components/CityMap.tsx   (edit)   width/height/fetchpriority/decoding
src/pages/CheckoutTest.tsx   (edit)   loading="lazy" nos iframes
src/components/SplashScreen.tsx (edit) early-return se embedado
src/lib/loadTracking.ts      (edit)   skip GTM/GA se embedado, postMessage para conversion
src/main.tsx                 (edit)   loadFontsDeferred com timeout maior se embedado
index.html                   (edit)   <meta name="referrer">
wp-theme/awr-baterias-fast/assets/theme.js (edit) listener postMessage para conversion
```

Sem mudanças de banco, sem mudanças em edge functions.

## Ganho esperado no iframe
- LCP: −300 a −400 ms (sem splash duplicado).
- TBT: −150 ms (sem GTM/GA4 duplicado).
- Bytes: −80 KB de JS de tracking + ~20 KB de fontes não usadas no acima-da-dobra.
- CLS do CityMap: ~0 (com width/height).
