# Limpeza + carregamento em cascata da home

Objetivo: reduzir bytes JS no bundle inicial, eliminar trabalho fora do caminho crítico e fazer o restante da página entrar de forma escalonada (cascata) só depois que o herói estiver pintado.

## 1. Remover código morto não utilizado

Arquivos sem nenhum import ativo na app principal:

- `src/components/WhyChoose.tsx` — só referencia a si mesmo
- `src/components/Services.tsx` — não importado em lugar nenhum
- `src/components/VehicleSearch.tsx` — só referencia a si mesmo (substituído por `VehicleAutocomplete` + `SearchOverlay`)
- `src/components/PerfReport.tsx` — usado apenas em DEV em `Index.tsx`
- `src/components/MobileDebugOverlay.tsx` — usado apenas em DEV em `Index.tsx`
- `src/lib/perfMetrics.ts` — em produção é totalmente no-op; só serve aos componentes DEV acima

Ações:
- Apagar os 6 arquivos acima.
- Em `src/pages/Index.tsx`: remover blocos `PerfReport` e `MobileDebugOverlay` e o import de `cityPages` que só serve ao JSON-LD (manter JSON-LD enxuto sem o array de cidades — economiza ~3KB e evita carregar `cityContent`).
- Em `src/components/HeroSection.tsx` e `src/main.tsx`: remover imports/chamadas de `markEvent` e `startLcpTracking`.

## 2. Carregamento em cascata (waterfall controlado)

Hoje o `Header`, `CartProvider`, ícones do Lucide e o JS do `HeroSection` entram todos no bundle inicial. Vamos escalonar:

```text
[0ms]   index.html: shell estático (já existe) → FCP
[bundle] React monta:
        └── HeroSection (real, substitui shell) ──► LCP
[idle 1] Header + CartProvider montam
[idle 2] Pré-fetch de HomeMiddle (módulo, não renderiza)
[scroll] LazySection monta HomeMiddle
[scroll] LazySection monta HomeBottom (Footer/Cart/MobileBar/FloatingWA)
[idle 3] DeferredToaster (já existe)
```

Mudanças concretas em `src/pages/Index.tsx`:
- Tornar `Header` e `CartProvider` lazy: renderizar só depois de um `useEffect` + `requestIdleCallback`. Antes disso, o shell estático do `index.html` cobre o topo.
- Adicionar pré-fetch idle dos chunks `HomeMiddle`/`HomeBottom` (`import("@/components/home/HomeMiddle")`) para que, quando o `IntersectionObserver` disparar, o módulo já esteja em cache — sem flash branco.
- Reduzir `minHeight` placeholders dos `LazySection` (1980/1120 px exagerados) para valores realistas (800/600), evitando reservar tela demais e atrasar o "scroll-into-view" do bloco seguinte.

Mudanças em `src/components/HeroSection.tsx`:
- Remover o `useEffect` que faz `import("@/components/SearchOverlay")` em idle (já é lazy on-demand; o pré-load duplica trabalho durante o LCP).
- Remover o `IntersectionObserver` do `HeroWhatsButton` e usar a mesma abordagem `requestIdleCallback` (mais leve e sem custo de observer).
- Substituir `getLiveDeliveries()` chamada 2x no render por `useMemo`.

## 3. Reduzir o bundle inicial

- Em `src/App.tsx`: o import direto de `Index` e `NotFound` é correto, mas `TooltipProvider` puxa Radix Tooltip no inicial. Mover `TooltipProvider` para dentro de `Index` (ou só nas rotas que usam tooltip) — economia ~6KB gz.
- Em `vite.config.ts`: adicionar chunk próprio para `@fontsource/*` (já é CSS, mas o `?url` ainda gera entradas). Garantir que `lucide-react` esteja no chunk `icons` para não vazar no inicial.
- Manter `HelmetProvider` em `main.tsx` (Blog/SEO usam), mas confirmar que `Index` não importa `SEO` (já não importa).

## 4. Resultado esperado

| Métrica | Antes | Alvo |
|---|---|---|
| FCP | 3.6s | ~0.8s (shell já pinta) |
| LCP | 8.4s | ~2.5s |
| TBT | 470ms | ~150ms |
| JS inicial | — | −15 a −25KB gz |

## Arquivos tocados

**Apagados (6):** `WhyChoose.tsx`, `Services.tsx`, `VehicleSearch.tsx`, `PerfReport.tsx`, `MobileDebugOverlay.tsx`, `lib/perfMetrics.ts`.

**Editados:** `src/pages/Index.tsx`, `src/components/HeroSection.tsx`, `src/main.tsx`, `src/App.tsx`, `vite.config.ts`.

Sem mudança visual — apenas ordem de carregamento e remoção de código não usado.
