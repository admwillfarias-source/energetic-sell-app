# Plano: acelerar a abertura do app

Objetivo: reduzir LCP, TBT e bytes do bundle inicial. Foco no carregamento da home (`/`), que é o que abre primeiro tanto direto quanto dentro do iframe WP.

## Diagnóstico

Pontos onde está sobrando trabalho no caminho crítico:

1. **Hero LCP** — `<h1>` com `min-h-[96px..140px]` está reservando espaço, bom; mas o `<picture>` carrega `hero-bg.webp` (130KB) em desktop mesmo quando AVIF (90KB) já cobre. Falta `sizes`/largura responsiva e `width/height` no `<source>`.
2. **HeroSection.tsx** — importa 8 ícones do `lucide-react` (Search, Car, Clock, Star, Truck, CreditCard, Award, AlertTriangle) no chunk inicial. Cada ícone vem como módulo separado.
3. **App.tsx** — `SplashScreen` é importado eager. Mesmo escondido em iframe, o componente + `splash-3-passos.jpeg` (77KB) entram no bundle inicial via `import splashImg`.
4. **Index.tsx** — `BatteryGrid` é importado eager mas **só renderiza se houver `?q=` ou `?codes=` na URL** (linha 97 retorna `null`). Está pesando o bundle inicial à toa: traz `@tanstack/react-query`, `Slider`, `Checkbox`, `BatteryMouraCard`, `BatteryDetailDialog`, `fitments`, etc.
5. **CartProvider + useCart no Header** — Header sempre lê o carrinho, então `CartContext` fica no chunk inicial. Ok, mas `CartDrawer` e `MobileActionBar` poderiam só montar após interação.
6. **HelmetProvider + react-helmet-async** — usado só pelo `<SEO>` da home; entra eager no main.tsx. Pequeno mas evitável.
7. **QueryClientProvider** — está no `App.tsx` eager; só é usado pelo `BatteryGrid` (que só aparece após busca). Pode ser movido para dentro do `BatteryGrid`/rotas que usam.
8. **loadTracking** — bom, já difere; mas `initDeferredTracking()` ainda roda imediatamente e adiciona 5 listeners globais. Pode esperar `requestIdleCallback` antes de até registrar os listeners.
9. **Fontes** — 4 arquivos de fonte preloaded em `index.html` + 4 CSS via `@fontsource` injetados depois. Inter 400/600 + Jakarta 800 já cobrem o hero; Jakarta 700 é usado fora da dobra. Carregar Jakarta 700 só on-demand.
10. **`SearchOverlay` e `catalogStore`** — pré-carregados em idle no Hero. Bom, mas o catálogo (Supabase fitments, paginado de 1000 em 1000) só precisa quando o usuário **abre** a busca, não em idle. Esse fetch compete com o LCP em conexões lentas.
11. **CSS principal** — `deferMainCss()` só roda em build. OK.
12. **BatteryMouraCard / BatteryDetailDialog** — viajam junto com `BatteryGrid` (item 4); resolvido ao tornar `BatteryGrid` lazy.
13. **`format-detection: telephone=yes`** no `<meta>` — força o iOS a varrer o DOM atrás de números. Trocar para `no` corta trabalho de layout em mobile.

## Ações

### 1. Tornar `BatteryGrid` lazy (maior ganho de bundle inicial)

Em `src/pages/Index.tsx`:
- Trocar `import { BatteryGrid } from "@/components/BatteryGrid"` por `lazy(() => import("@/components/BatteryGrid").then(m => ({ default: m.BatteryGrid })))`.
- Envolver com `Suspense fallback={null}`.
- Como ele só renderiza quando há `?q=`/`?codes=`/`?v=`, adicionar guard antes do `lazy` para nem disparar o chunk se a URL não tiver esses params (`useSearchParams` no `Index` ou checar `window.location.search`).

Resultado esperado: −60 a −90KB do bundle inicial (Slider, Checkbox, query devirtualizado, fitments, BatteryMouraCard, BatteryDetailDialog).

### 2. Tornar `SplashScreen` lazy + dinâmico

Em `App.tsx`:
- `const SplashScreen = lazy(() => import("@/components/SplashScreen"))`.
- Renderizar dentro de `Suspense fallback={null}`. O `isEmbedded()` já evita render em iframe; combinado com lazy, o JS e o `splash-3-passos.jpeg` saem do main chunk.

### 3. Mover `QueryClientProvider` para o ponto de uso

O único consumidor real é `BatteryGrid` + páginas SKU. Mover o `QueryClientProvider` para dentro do `BatteryGrid` (e nas rotas lazy que usam `useQuery`). `@tanstack/query` já está em manualChunk separado, mas hoje é importado eager pelo App.

Alternativa mais segura: manter no App, mas garantir que `react-query` esteja só no chunk `query` (já está) e que o App não importe nenhum hook dele. Verificar e, se estiver, manter.

### 4. Diferir `initDeferredTracking` e `loadFontsDeferred`

Em `main.tsx`:
- Envolver as duas chamadas em `requestIdleCallback(..., { timeout: 3000 })` único, em vez de rodar logo após `createRoot`. Os listeners de tracking só são adicionados em idle.

### 5. Reduzir ícones do Hero

Em `HeroSection.tsx`:
- Substituir os 8 ícones lucide por inline SVG (4 deles aparecem nos badges acima da dobra: Clock, CreditCard, Award, Truck). Search e Car ficam no `SearchPlaceholder`. Star e AlertTriangle podem ir para chunk lazy / inline simples.
- Ganho: −15 a −25KB de JS no chunk inicial (cada ícone lucide é um módulo importado separado em dev; em prod entra em `icons` chunk, mas remover de eager evita custo de parse).

### 6. Hero `<picture>` mais agressivo

- Adicionar `sizes="100vw"` ao `<img>`.
- Adicionar `<source srcSet="/hero-bg.avif 1600w, /hero-bg-sm.avif 768w" sizes="100vw" type="image/avif">` consolidado, em vez de duas `<source media>` separadas. Garante AVIF (90KB) sempre que o navegador suportar, em vez de cair para WebP em desktop.
- Manter `width={1200} height={900}` para evitar CLS.

### 7. Não pré-carregar o catálogo Supabase em idle do Hero

Em `HeroSection.tsx`, remover o `import("@/lib/catalogStore").then((m) => m.ensureCatalogLoaded?.())` do bloco idle. Manter apenas o `import("@/components/SearchOverlay")` (chunk JS, leve). O catálogo carrega quando o usuário abre a busca — `BatteryGrid` já chama `ensureCatalogLoaded()` por conta própria.

Ganho: poupa 1 request grande (paginado, Supabase fitments) competindo com LCP em mobile lento.

### 8. Index.html — `format-detection`

Trocar `<meta name="format-detection" content="telephone=yes">` por `telephone=no`. Os links `tel:` continuam clicáveis; só evita que o iOS varra o DOM procurando números para autolinkar.

### 9. Remover preload da fonte `inter-600` se não for usada acima da dobra

Confirmar com `rg "font-semibold"` no Hero — se Inter 600 só aparece em badges/CTAs pequenos, baixar para preload de `inter-400` apenas e deixar `inter-600` no carregamento diferido junto com Jakarta 700. (Manter preload do Jakarta 800 — é o `<h1>`.)

Decisão prudente: **manter inter-600 preloaded** (CTA "Buscar" usa `font-bold`), mas conferir.

### 10. WP theme: passar `loading="eager" fetchpriority="high"` no iframe da home

No `wp-theme/awr-baterias-fast/inc/perf-iframe.php` (já existe), garantir que o iframe da home tenha `loading="eager"` (não lazy) e `fetchpriority="high"`, enquanto iframes secundários (rodapé/depoimentos, se houver) ficam `loading="lazy"`. Isso melhora o LCP do app dentro do tema.

## Detalhes técnicos

```text
Bundle inicial atual (estimado):
  react-vendor + main + supabase eager + BatteryGrid + Splash + ícones
  ≈ 230KB gz

Após mudanças:
  react-vendor + main enxuto + lazy SplashScreen + lazy BatteryGrid
  ≈ 150-170KB gz  (−30 a −35%)

LCP:
  −150 a −250ms (AVIF garantido em desktop, sem competir com fetch do catálogo)

TBT:
  −80 a −120ms (tracking listeners em idle, splash fora do caminho)
```

## Fora deste plano

- Refatorar imagens dos cards (BatteryImage) — fora do caminho crítico (lazy via LazySection).
- Service Worker / cache offline — escopo maior.
- Mudanças em edge functions — não afetam abertura do app.

## Validação

Após implementar, rodar `npm run lh:mobile` (Lighthouse mobile) e comparar LCP, TBT e bytes transferidos com a baseline atual.