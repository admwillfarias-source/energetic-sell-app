## Diagnóstico (score 67)

Após as otimizações anteriores, os ofensores restantes são:

1. **Google Fonts via CDN** — request externo bloqueante (mesmo com `media=print/onload`, ainda gera FOUT + atraso na fonte do LCP). Vale ~10–15 pts.
2. **Hero LCP (`hero-bg.webp` 133KB)** com `decoding="sync"` — força render bloqueante. ~5–10 pts.
3. **`backdrop-blur` no Header fixo** — paint custoso continuamente em scroll mobile. ~3–5 pts.
4. **Toaster + Sonner** carregam no boot mesmo sem toast disparado. ~2 pts.
5. **Sem preload do hero** — Vite hasheia o asset, então não conseguimos preload via HTML estático. Solução: injetar `<link rel="preload">` programaticamente com a URL importada.
6. **Falta `loading="lazy"` / `decoding="async"`** em imagens abaixo da dobra (cards de bateria, logos).
7. **`min-height` do h1 muito grande no mobile** (120px) reserva espaço excessivo, empurrando conteúdo e podendo afetar LCP candidate.

## Mudanças

### 1. Self-host das fontes (`index.html` + `src/index.css`)
- Remover os `<link>` para `fonts.googleapis.com` e `fonts.gstatic.com` do `index.html`.
- Adicionar `@fontsource/plus-jakarta-sans/700.css` + `800.css` e `@fontsource/inter/400.css` + `600.css` via dependências, importados em `src/index.css` ou `main.tsx`.
- Vantagens: zero requests externos, fontes hashed + cache-controlled, `font-display: swap` automático, sem render-blocking.

### 2. Hero LCP otimizado (`src/components/HeroSection.tsx` + `index.html`)
- Trocar `decoding="sync"` → `decoding="async"` no `<img>` do hero (não bloqueia parse, e `fetchpriority="high"` já garante prioridade).
- Adicionar preload programático: em `main.tsx` (antes do render), injetar `<link rel="preload" as="image" href={heroBg} fetchpriority="high">` usando o asset importado (URL hasheada correta).
- Reduzir `min-h` do h1: `min-h-[96px] md:min-h-[120px] lg:min-h-[140px]` (suficiente para 2 linhas, libera viewport).
- Recomprimir `hero-bg.webp` (atualmente 133KB) para ~60–70KB com `cwebp -q 72` e gerar `hero-bg.avif` (~35KB) como `<source type="image/avif">` no `<picture>`.

### 3. Header sem `backdrop-blur` (`src/components/Header.tsx`)
- Trocar `bg-secondary/95 backdrop-blur` por `bg-secondary` opaco (ou `bg-secondary/98` sem blur).
- Elimina composite/paint custoso em cada frame de scroll no mobile.

### 4. Toaster/Sonner sob demanda (`src/App.tsx` + `src/hooks/use-toast.ts`)
- Remover `<Toaster />` e `<Sonner />` do boot.
- Criar wrapper `<LazyToasters />` que monta os toasters apenas quando o primeiro `toast()` é chamado (subscribe no store antes do render). Economiza ~15KB do bundle inicial.

### 5. Imagens lazy / async (`src/components/BatteryCard.tsx`, `BatteryImage.tsx`, `ManufacturerLogos.tsx`)
- Garantir `loading="lazy"` + `decoding="async"` em todas as imagens fora do hero.
- Adicionar `width`/`height` explícitos onde faltarem para evitar CLS residual.

### 6. Limpeza fina
- `src/components/PerfReport` e `MobileDebugOverlay` já são DEV-only (ok).
- Adicionar `<meta name="color-scheme" content="light">` em `index.html` para evitar flash em browsers que tentam tema escuro.
- Verificar `vite.config.ts` para habilitar `build.cssCodeSplit: true` (default já é true) e confirmar que `assetsInlineLimit` está em ~4KB (default).

## Arquivos editados

- `index.html` — remover Google Fonts, adicionar `color-scheme`
- `src/index.css` — importar fontes self-hosted
- `src/main.tsx` — preload programático do hero
- `src/components/HeroSection.tsx` — decoding async, min-h reduzido, source AVIF
- `src/components/Header.tsx` — remover backdrop-blur
- `src/App.tsx` — toasters sob demanda
- `src/components/BatteryCard.tsx`, `BatteryImage.tsx`, `ManufacturerLogos.tsx` — lazy/async/dimensões
- `package.json` — adicionar `@fontsource/inter` + `@fontsource/plus-jakarta-sans`
- `src/assets/hero-bg.webp` — recomprimir + gerar `hero-bg.avif`

## Métricas alvo

- Performance: 95–100
- LCP < 2.0s (hero preload + AVIF + fontes locais)
- CLS < 0.02
- TBT < 100ms (sem backdrop-blur + toasters lazy)
- FCP < 1.5s (sem Google Fonts bloqueante)
