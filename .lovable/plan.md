# Plano — Otimizar LCP do hero (escopo reduzido)

Foco exclusivo: reduzir o tempo do LCP da seção hero, mantendo o layout 100% intacto.

## O que será feito

### 1. Comprimir mais a imagem do hero
- `public/hero-bg.webp` está em **74 KB / 800×600**.
- Como o hero fica sob um overlay escuro (gradient `secondary/95 → secondary/40`), há margem para qualidade menor sem perda perceptível.
- Recomprimir com `cwebp -q 40 -m 6 -sharp_yuv` mantendo 800×600 → meta **~35–45 KB** (≈ 50% menor).
- Gerar também `public/hero-bg.avif` em ~25–30 KB com `avifenc --min 35 --max 50 --speed 4`.

### 2. Servir AVIF com fallback WebP
- `index.html` (shell estático acima da dobra) e `src/components/HeroSection.tsx`: usar `<picture>` com `<source type="image/avif">` antes do `<img src="/hero-bg.webp">`.
- Adicionar segundo `<link rel="preload" as="image" type="image/avif" href="/hero-bg.avif" fetchpriority="high">` no `<head>` (mantém o atual de WebP como fallback). Navegadores que não suportam AVIF ignoram o preload tipado.

### 3. Validar
- Medir antes/depois com `scripts/lighthouse.mjs` (já existe no projeto) e registrar LCP no console via `perfMetrics`.

## Não será alterado

- Estrutura visual, classes Tailwind, tamanhos, gradient, h1, busca.
- Outras imagens (produtos, logos, mascote).
- Bundle JS, fontes, GTM, CSS — já otimizados em iterações anteriores.

## Resultado esperado

| Métrica | Atual | Meta |
|---|---|---|
| Hero payload (mobile) | 74 KB WebP | ~25–30 KB AVIF |
| LCP | ~6.5 s | < 2.5 s |
