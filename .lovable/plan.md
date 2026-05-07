## Objetivo
Subir o Performance Score mobile de 31 para >70, reduzir LCP (5.9s → <2.5s) e FCP (4.1s → <1.8s) atacando os gargalos do PageSpeed: scripts de terceiros, JS não usado, CSS render-blocking e entrega do LCP.

## Passo 1 — Scripts de terceiros (GTM, GA4, Google Ads)

Hoje em `index.html` os scripts de GTM e gtag carregam **síncronos no `<head>`**, contribuindo direto pros 8s de main-thread.

Mudanças em `index.html`:
- Remover o IIFE inline do GTM e o bloco `gtag` do `<head>`.
- Manter apenas a inicialização mínima: `window.dataLayer = []` e o stub `gtag()`.
- Criar `src/lib/loadTracking.ts` que injeta GTM + gtag (`AW-994517528`, `G-FJ1MK5SLS5`) e dispara `gtag_report_conversion` apenas após:
  - primeira interação (`scroll`, `touchstart`, `mousemove`, `keydown`), ou
  - `requestIdleCallback` com timeout de 4s, ou
  - evento `load` + 2s.
- Importar `loadTracking` no fim de `src/main.tsx` após o render.
- Manter o `<noscript>` do GTM no `<body>` (já está correto).

Ganho esperado: -2 a -3s de TBT/main-thread no mobile.

## Passo 2 — CSS render-blocking + fontes

- **Fontes**: hoje `main.tsx` importa 4 CSS de `@fontsource` que entram no bundle CSS crítico. Trocar por `@fontsource/.../400.css` carregado via dynamic `import()` em `requestIdleCallback`, e adicionar fallback `font-family` em `index.css` com `font-display: swap` (o `@fontsource` já usa swap, mas mover pra fora do critical reduz bytes do CSS bloqueante).
- Alternativa mais segura: manter os imports síncronos mas reduzir para apenas `inter/400` + `plus-jakarta-sans/700` (remover 600 e 800; usar `font-synthesis` quando faltar).
- Adicionar `<link rel="preload" as="style" ... onload="this.rel='stylesheet'">` para o CSS principal no `index.html` (Vite já gera com hash; usar pequeno script inline que troca o `<link rel="stylesheet">` por preload+swap).
- Inlinar no `<head>` do `index.html` o CSS crítico mínimo (reset + tokens HSL + classes do hero acima da dobra). Manter <2KB.

## Passo 3 — LCP (hero + imagens de marca)

`HeroSection.tsx` já tem `fetchpriority="high"`, `loading="eager"` e preload em `main.tsx`. O delay de 8.5s vem porque o preload acontece **depois** do parse do JS bundle. Ajustes:
- Mover o `<link rel="preload" as="image" imagesrcset="..." imagesizes="100vw" fetchpriority="high">` direto pro `<head>` do `index.html` apontando pros assets em `/assets/...` (resolver via script que lê `import.meta.glob` no build) **OU** mais simples: copiar `hero-bg-sm.webp` e `hero-bg.webp` para `public/` e referenciar por path estável `/hero-bg-sm.webp` no preload do HTML e no `<picture>`.
- Remover do `main.tsx` o `preloadHero()` (substituído pelo preload no HTML).
- Adicionar `width`/`height` explícitos nas imagens `heliar-efb.png`, `heliar-1.png`, `exf70.png` em `BatteryCard`/`BatteryGrid` e converter para `.webp` (script de build ou substituir assets manualmente).

## Passo 4 — Cache, CLS, reflow

- `public/_headers` já cobre `/assets/*` com 1 ano immutable. Adicionar regras para `.avif` e revisar TTL de `.webp` de 30 dias para 1 ano com `immutable` em `/assets/*` (já ok). Adicionar `Cache-Control` no `<meta http-equiv>` não — manter só headers.
- Auditar uso de `offsetWidth`/`getBoundingClientRect` em loops nos componentes do hero (`VehicleAutocomplete`, `SearchOverlay`) pra eliminar forced reflows; mover medições para `useLayoutEffect` único.
- Garantir `aspect-ratio` ou `width/height` em `BatteryImage`, `ManufacturerLogos` e cards de `BestSellers` para CLS=0.
- Reduzir DOM: `BestSellers` já está lazy + `perPage` reduzido no mobile; aplicar mesmo padrão em `Testimonials` e `FaqHome` (lazy via `LazySection`).

## Validação
Após cada passo, rodar `scripts/lighthouse.mjs` (mobile) e reportar deltas de LCP, FCP, TBT, Performance Score. Critério de aceite: Score mobile ≥ 70, LCP < 2.5s, TBT < 300ms.

## Arquivos impactados
- `index.html` (remover scripts síncronos, adicionar preload de imagem e CSS)
- `src/main.tsx` (remover preloadHero, importar loadTracking)
- `src/lib/loadTracking.ts` (novo)
- `src/components/HeroSection.tsx` (referenciar `/hero-bg-sm.webp` se mover para public)
- `src/components/BatteryImage.tsx`, `BatteryGrid.tsx`, `ManufacturerLogos.tsx` (dimensões)
- `src/pages/Index.tsx` (lazy em Testimonials/FaqHome)
- `public/_headers` (ajustes finos)

Confirmar antes de iniciar Passo 1.
