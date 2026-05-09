# Medir o tempo de abertura do SearchOverlay

Objetivo: registrar quanto tempo passa entre a intenção do usuário (clique/foco no campo de busca) e o momento em que o `SearchOverlay` está renderizado e interativo. Permite comparar antes/depois do pré-fetch via IntersectionObserver.

## Métricas a coletar

Três marcadores via `performance.mark` + dois `measure`:

| Mark | Quando |
|---|---|
| `overlay_intent` | usuário clica/foca no input ou botão de busca (antes do `setOverlayOpen(true)`) |
| `overlay_chunk_loaded` | `import("@/components/SearchOverlay")` resolve (módulo em memória) |
| `overlay_mounted` | primeiro `useEffect` do `SearchOverlay` roda (componente já no DOM) |

Measures derivados:
- `overlay_open_total` = `overlay_intent` → `overlay_mounted` (latência percebida real)
- `overlay_chunk_fetch` = `overlay_intent` → `overlay_chunk_loaded` (custo de rede do chunk; ~0 se já pré-carregado)

Tudo gravado via `markEvent` / `measureBetween` do `perfMetrics`, e logado no `console` em DEV (ou quando `?perf=1`).

## Mudanças

### 1. `src/lib/perfMetrics.ts`
Hoje é stub no-op. Reativar o mínimo necessário para este caso:
- `markEvent(name)` chama `performance.mark` e armazena timestamp em `Map`.
- `measureBetween(name, start, end)` chama `performance.measure` e faz `console.info("[perf]", name, durationMs)`.
- Manter no-op se `performance` indisponível.
- Sem `PerformanceObserver` (não voltar com Web Vitals que removemos).

### 2. `src/components/HeroSection.tsx`
- Importar `markEvent`.
- No handler do `SearchPlaceholder` (atualmente `onActivate={() => setOverlayOpen(true)}`), envolver com `markEvent("overlay_intent")` antes do `setOverlayOpen(true)`. Guard com `useRef` para marcar só na primeira abertura por sessão.
- No `useEffect` do IntersectionObserver, após `import("@/components/SearchOverlay").then(...)`, chamar `markEvent("overlay_chunk_loaded")`. Isso captura o caso "pré-carregado".

### 3. `src/components/SearchOverlay.tsx`
- No primeiro `useEffect` (mount, `[]`), chamar:
  - `markEvent("overlay_mounted")`
  - `measureBetween("overlay_open_total", "overlay_intent", "overlay_mounted")`
  - `measureBetween("overlay_chunk_fetch", "overlay_intent", "overlay_chunk_loaded")` (silenciosamente ignora se mark não existir)

### 4. Logs

`measureBetween` imprime no console:

```
[perf] overlay_chunk_fetch  3.2ms
[perf] overlay_open_total   42.1ms
```

E `window.__perfReport()` continua acessível para inspeção manual.

## Como verificar o ganho

1. Carregar a home, abrir DevTools → Console.
2. Esperar ~1s (IntersectionObserver dispara → chunk pré-carregado).
3. Clicar no campo de busca.
4. Ler `[perf] overlay_chunk_fetch` (deve ser ~0–5 ms) e `overlay_open_total` (deve ser <60 ms).
5. Comparar com cenário sem pré-fetch: temporariamente comentar o `import()` no IntersectionObserver e recarregar.

## Arquivos tocados

- `src/lib/perfMetrics.ts` — reativar `markEvent`/`measureBetween` com log no console.
- `src/components/HeroSection.tsx` — marcar `overlay_intent` e `overlay_chunk_loaded`.
- `src/components/SearchOverlay.tsx` — marcar `overlay_mounted` e medir intervalos.

Sem mudança visual.
