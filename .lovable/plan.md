## Passo 2 (revisado) — CSS crítico inline + defer do bundle CSS + fontes

O Passo 2 anterior já cuidou das fontes (carregamento via `requestIdleCallback` + fallback `system-ui`). Falta agora o que mais pesa no FCP: o **CSS bundle do Vite (`/assets/index-*.css`) é render-blocking**. Esse passo ataca isso.

### 1. Inline de CSS crítico no `<head>` do `index.html`
Adicionar um `<style>` inline (~1.5 KB) com o mínimo para pintar o hero acima da dobra no mobile:
- Reset básico (`*,*::before,*::after { box-sizing:border-box }`, `body { margin:0 }`).
- Tokens HSL essenciais (`--background`, `--foreground`, `--primary`, `--primary-foreground`, `--secondary`, `--secondary-foreground`, `--accent`, `--accent-foreground`, `--card`, `--muted-foreground`, `--border`, `--ring`, `--radius`).
- `body { background: hsl(var(--background)); color: hsl(var(--foreground)); font-family: Inter, system-ui, -apple-system, sans-serif; -webkit-font-smoothing: antialiased; }`.
- Estilos da seção hero: `section#inicio` ocupando `min-height:80vh` com `padding-top:64px` + container central, h1 grande com `font-family: "Plus Jakarta Sans", Inter, system-ui` e `min-height` reservado (evita CLS quando a fonte web entra).
- Caixa de busca (`.rounded-2xl bg-card p-4 shadow-lg`) em altura fixa para não shiftar.
- `#root { min-height: 100vh }` para não pintar branco.

Tudo escrito em CSS puro (sem dependência do Tailwind), apenas para a primeira pintura. O Tailwind/CSS principal continua governando o resto da página assim que carrega.

### 2. Defer do bundle CSS principal
Hoje o Vite injeta `<link rel="stylesheet" href="/assets/index-XXXX.css">` automaticamente — render-blocking. Como o nome tem hash e é inserido pelo bundler, não dá para editar à mão no `index.html`. A solução é um pequeno **plugin Vite** dentro de `vite.config.ts` que, no hook `transformIndexHtml`, reescreve a tag emitida para:

```html
<link rel="preload" as="style" href="...css" onload="this.rel='stylesheet'">
<noscript><link rel="stylesheet" href="...css"></noscript>
```

Isso libera o FCP enquanto o CSS completo baixa em paralelo. Alternativa mais simples (sem plugin): usar `media="print" onload="this.media='all'"`. Mesma ideia, mais compatível.

### 3. Ajustes finos nas fontes (já parcialmente feitos)
- Confirmar que `@fontsource` (já carregado em `requestIdleCallback`) usa `font-display: swap` por padrão — sim, é o default do pacote, nada a fazer.
- Adicionar `font-size-adjust` ou ajustar `letter-spacing` no fallback `system-ui` se o CLS de fonte continuar visível depois (mensurar antes).
- Reduzir variantes? Já estamos em 4 (Inter 400/600 + Plus Jakarta 700/800). Manter — todas são usadas.

### 4. Validação
- Verificar visualmente no preview mobile que o hero pinta sem flash de não-estilizado.
- Conferir no DevTools Network que o CSS principal carrega como `preload` → `stylesheet` (não-blocking).
- Rodar `scripts/lighthouse.mjs` mobile e comparar FCP/LCP.

### Arquivos impactados
- `index.html` — inserir `<style>` crítico no `<head>`.
- `vite.config.ts` — adicionar plugin que reescreve a tag `<link rel="stylesheet">` do bundle para preload+swap.
- (Sem mudanças em componentes React.)

### Detalhes técnicos
O plugin Vite (em `transformIndexHtml`, fase `post`) procura `<link rel="stylesheet" crossorigin href="/assets/index-...css">` no HTML emitido pelo build e o substitui por `<link rel="preload" as="style" .../><noscript>...</noscript>` mais um pequeno `onload` inline. Em dev (sem hash), o plugin não faz nada — o Vite serve CSS via HMR e é instantâneo.

Confirmar antes de implementar.
