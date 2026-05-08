## Limpeza de código que pesa na abertura

Auditando os artefatos das otimizações anteriores, identifiquei 4 itens que **estão custando mais do que entregam** na carga inicial. Removê-los reduz JS no bundle, observadores na main thread e atrasos visuais.

### 1. Remover o `SplashScreen` (maior ganho perceptual)

**Problema:** Mostra um overlay branco com imagem por **~380ms** (180ms até iniciar fade + 200ms de fade), cobrindo o hero que já está com preload AVIF/WebP + CSS crítico inline. Ou seja: o hero está pronto, mas o splash o esconde de propósito.

**Ação:**
- Apagar `src/components/SplashScreen.tsx` e `src/components/SplashFallback.tsx`
- Remover do `src/App.tsx` (import lazy + Suspense + render)
- Remover marcador `splash_hidden` (deixa de existir, sem efeito)

**Ganho:** ~380ms no FCP perceptual + 1 chunk lazy a menos + 1 import de imagem (`splash-3-passos.jpeg`) eliminado.

### 2. Tornar `perfMetrics` no-op em produção (a menos que `?perf=1`)

**Problema:** `startLcpTracking()` roda **sempre** em prod e instala 5 `PerformanceObserver` (paint, LCP, CLS, INP, longtask). Isso adiciona trabalho contínuo na main thread sem benefício para o usuário final — só serve para debug.

**Ação:** Em `src/lib/perfMetrics.ts`, fazer `startLcpTracking()` e `markEvent()` virarem no-op cedo se `import.meta.env.PROD && !location.search.includes("perf=1")`. Manter a API exportada para não quebrar os ~8 arquivos que importam.

**Ganho:** Menos trabalho na main thread durante o LCP (especialmente o observer de `event` e `longtask` que disparam a cada interação).

### 3. Remover `PerfReport` do bundle de produção

**Problema:** Mesmo sendo lazy, ele é referenciado em `Index.tsx` com `Suspense` e gera um chunk + Subscription a métricas. Em prod só roda com `?perf=1`, que ninguém usa.

**Ação:** Em `src/pages/Index.tsx`, fazer `PerfReport` apenas existir em DEV (mesmo padrão do `MobileDebugOverlay`):
```ts
const PerfReport = import.meta.env.DEV
  ? lazy(() => import("@/components/PerfReport"))
  : null;
```

**Ganho:** 1 chunk a menos + 1 Suspense a menos no render de `Index`.

### 4. Remover `BatteryGridFallback` (não é usado no caminho rápido)

**Problema:** Só aparece se a URL tiver `?q=`, `?codes=` ou `?v=` — ou seja, **nunca na home pura** que é o que estamos otimizando. Como o `BatteryGrid` é montado condicionalmente (já só carrega se `hasSearch`), o fallback é dead code para 99% dos acessos.

Esse Skeleton é grande (3 cards de 420px) e importa `@/components/ui/skeleton`. Substituir por `null` no Suspense fallback do Index — quem chega via busca já espera latência e a transição é curta.

**Ação:** Apagar `src/components/BatteryGridFallback.tsx` e trocar `<BatteryGridFallback />` por `null` em `Index.tsx`.

**Ganho:** Bundle inicial menor (o Index não importa mais o Skeleton só por causa do fallback).

### O que NÃO mexer

- `LazySection` — está enxuto e é o pilar do lazy por scroll.
- `loadTracking` (GTM/GA4) — já é diferido por idle/interaction, faz sentido.
- `HomeMiddle` / `HomeBottom` — agrupamento em chunks aprovado anteriormente, mantém.
- CSS crítico inline + preload de fontes/hero no `index.html` — está correto.
- `MobileDebugOverlay` — já é DEV-only via `import.meta.env.DEV`.

### Arquivos afetados

Apagados:
- `src/components/SplashScreen.tsx`
- `src/components/SplashFallback.tsx`
- `src/components/BatteryGridFallback.tsx`

Editados:
- `src/App.tsx` (remove splash)
- `src/pages/Index.tsx` (PerfReport DEV-only, sem BatteryGridFallback)
- `src/lib/perfMetrics.ts` (no-op em prod sem `?perf=1`)

### Ganho esperado

- **−380ms** no FCP perceptual (sem splash)
- **−~3KB** gz no bundle inicial (sem splash image, sem fallback skeleton)
- **3 chunks lazy a menos** em prod (SplashScreen, SplashFallback, PerfReport)
- **5 PerformanceObservers a menos** rodando na main thread durante LCP
