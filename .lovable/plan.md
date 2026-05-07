## Diagnóstico

Os CSS bloqueantes que o PageSpeed lista — `400-*.css`, `600-*.css`, `700-*.css`, `800-*.css` (e `index-*.css`) — vêm de:

- **`index-*.css`**: bundle Tailwind. Já é tratado pelo plugin `deferMainCss()` em `vite.config.ts` (vira `rel="preload" as="style" onload=...`). OK.
- **`400/600/700/800-*.css`**: vêm dos `import("@fontsource/...")` em `src/main.tsx`. Mesmo sendo `import()` dinâmico dentro de `requestIdleCallback`, o runtime do Vite injeta cada CSS no `<head>` como `<link rel="stylesheet">` *e espera o load* antes de resolver a Promise. Em redes mobile lentas, esses 4 links entram no `<head>` durante a janela de carregamento e bloqueiam o paint — exatamente o que o Lighthouse mostra (500 ms × 4).

O plugin `deferMainCss()` não reescreve esses links porque ele roda em `transformIndexHtml` (build-time), e os links de fontsource são inseridos em runtime pelo loader do Vite.

## Plano

Trocar a estratégia de carregamento das fontes em `src/main.tsx`: parar de usar `import("@fontsource/.../400.css")` (que injeta `<link rel="stylesheet">` bloqueante) e passar a injetar manualmente cada CSS de fonte como `<link rel="preload" as="style">` que só vira `stylesheet` no `onload`.

### Alterações

**`src/main.tsx`** — substituir `loadFontsDeferred()`:

1. Remover os 4 `import("@fontsource/...")` dinâmicos.
2. Criar um helper `injectFontCssNonBlocking(href)` que:
   - Cria `<link rel="preload" as="style" href={href}>`.
   - No `onload`, troca para `rel="stylesheet"`.
   - Anexa em `document.head`.
3. Usar `import.meta.glob` com `query: '?url', import: 'default', eager: true` para obter as URLs hashadas dos 4 arquivos `@fontsource/inter/{400,600}.css` e `@fontsource/plus-jakarta-sans/{700,800}.css` no build, sem injetar CSS.
4. Disparar `injectFontCssNonBlocking()` para os 4 dentro de `requestIdleCallback` (timeout 2 s) — igual ao padrão atual, mas agora sem bloqueio.

Isso garante:
- O Vite ainda gera os arquivos CSS hashados (`400-*.css`, etc.) e o bundle os referencia, então o cache busting continua funcionando.
- Os CSS entram no `<head>` como `preload`, nunca como `stylesheet` síncrono — o navegador não os trata como render-blocking.
- Fallback `<noscript>` não é necessário porque as fontes são puramente decorativas (já há fallback metrics-adjusted em `src/index.css`).

### Não muda

- `index.html` (CSS crítico inline + preload do hero seguem iguais).
- `vite.config.ts` / `deferMainCss()` (continua tratando o `index-*.css` principal).
- `src/index.css` (fallbacks de fonte permanecem).
- Tracking, LCP gate e qualquer outro passo anterior.

### Resultado esperado

Os 4 CSS de fontsource somem da lista de "render-blocking resources" no Lighthouse. FCP cai porque o `<head>` deixa de receber 4 `<link rel="stylesheet">` extras durante a janela inicial. CLS continua controlado pelos fallbacks `Inter Fallback` / `Plus Jakarta Sans Fallback` já existentes.
