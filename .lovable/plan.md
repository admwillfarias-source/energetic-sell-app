# Plano de otimização de performance

Baseado no relatório do PageSpeed: LCP atrasado em ~3,4s, 124 KiB de JS não usado, hero-image maior que necessário, fontes bloqueando render, e componentes de debug carregando em produção.

## 1. Remover componentes de debug do bundle de produção

`PerfReport` e `MobileDebugOverlay` estão sendo importados sempre em `Index.tsx` (mesmo lazy, geram chunks e fetch). Em produção eles não devem nem aparecer no grafo.

- Em `src/pages/Index.tsx`: envolver os imports/uso de `PerfReport` e `MobileDebugOverlay` em `import.meta.env.DEV` para que o tree-shaking do Vite os remova do build de produção.

## 2. Otimizar a imagem LCP (hero)

`hero-bg-sm.webp` está em 800x600 com 70 KiB. O viewport mobile real renderiza menor, e o relatório indica ~38 KiB de economia.

- Recomprimir `hero-bg-sm.webp` com qualidade ~70 (cwebp -q 70) e ajustar para 720x540 — alvo ~30–35 KiB.
- Recomprimir `hero-bg.webp` (1200x900) com qualidade 72 — alvo ~70 KiB.
- Adicionar `<link rel="preload" as="image" href="..." fetchpriority="high">` no `index.html` para o hero-bg-sm (mobile) e hero-bg (desktop) usando `imagesrcset`/`media`, antecipando o download do LCP.

## 3. Reduzir CLS de fontes (Google Fonts)

A página carrega Google Fonts via CSS dinâmico (importado pelos componentes), o que atrasa render e causa CLS de 0,010.

- Adicionar `<link rel="preload" href="https://fonts.googleapis.com/css2?family=...&display=swap" as="style">` + `<link rel="stylesheet" ...>` no `index.html` para iniciar o download da folha de estilo de fontes em paralelo ao HTML.
- Garantir `display=swap` na URL.
- Adicionar `<link rel="dns-prefetch" href="https://mkkehvaclefoxkdlcmqm.supabase.co">` para encurtar a cadeia das chamadas de catálogo.

## 4. Reduzir JS não usado (123 KiB no index.js)

Chunks principais que estão no entry mesmo sem precisarem no carregamento inicial:

- `Toaster` (radix-toast) e `Sonner` em `App.tsx` — usados raramente. Converter para `lazy` + `Suspense` no `App.tsx`.
- `TooltipProvider` — manter (leve).
- Auditar `src/components/Header.tsx` para usar ícones individuais do lucide e adiar dropdown/menus.

## 5. Adiar carga do catálogo de fitments

Hoje `BatteryGrid` chama `ensureCatalogLoaded()` no mount, baixando ~70 KiB de fitments mesmo sem o usuário ter buscado um veículo.

- Em `BatteryGrid.tsx`: só chamar `ensureCatalogLoaded()` quando `isVehicleSearch` for true (já há `enabled: !isVehicleSearch || catalogReady`, então a chamada antecipada é desnecessária).
- Isto remove 2 fetches `/fitments?select=...` da cadeia crítica inicial.

## 6. Acessibilidade rápida (botões sem nome)

Lighthouse aponta um botão sem nome acessível em `div.mb-6 > div.relative > div.flex > button.inline-flex` (botão "Buscar" do `SearchPlaceholder` no mobile, onde o texto está em `hidden sm:inline`).

- Em `HeroSection.tsx` `SearchPlaceholder`: adicionar `aria-label="Buscar"` no `<button>`.

## Resumo técnico de arquivos a editar

- `index.html` — preload da imagem LCP, preload do CSS de Google Fonts, dns-prefetch do Supabase.
- `src/pages/Index.tsx` — guardar `PerfReport` e `MobileDebugOverlay` em `import.meta.env.DEV`.
- `src/App.tsx` — `lazy()` para `Toaster` e `Sonner`.
- `src/components/HeroSection.tsx` — `aria-label` no botão Buscar.
- `src/components/BatteryGrid.tsx` — só chamar `ensureCatalogLoaded` quando há busca por veículo.
- `src/assets/hero-bg-sm.webp` e `hero-bg.webp` — recompressão.

## Ganhos esperados

- LCP: −800ms a −1.500ms (preload + imagem menor + fontes paralelas).
- JS transferido: −60 a −90 KiB (debug fora do prod, toaster lazy).
- Network requests críticas: −2 chamadas de fitments no carregamento da home.
- Acessibilidade: corrige falha do botão sem nome.
