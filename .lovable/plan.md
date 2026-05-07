## Passo 3 — LCP (refinamentos)

A maior parte do Passo 3 já foi feita em iterações anteriores: o hero está em `/public` com paths estáveis, tem `<link rel="preload" as="image" imagesrcset imagesizes fetchpriority="high">` no `<head>` (resolvido antes do parse do JS), `<picture>` com `source` mobile, `loading="eager"`, `decoding="async"`, `width`/`height` e `fetchpriority="high"` no `<img>`. O preload do hero está **antes** de qualquer `<script>` no `index.html`, então o "Resource load delay" de 8.59s relatado é de uma medição anterior aos passos 1–2; mesmo assim ainda dá pra ganhar tempo:

### 1. Reduzir bytes do hero (mobile cai a ~20 KB)
- Recomprimir `public/hero-bg-sm.webp` (hoje 43 KB) com `cwebp -q 70 -m 6 -sharp_yuv` → alvo ~20–25 KB.
- Recomprimir `public/hero-bg.webp` (hoje 130 KB) com `cwebp -q 72` → alvo ~70–90 KB.
- Gerar versão **AVIF** correspondente (`hero-bg-sm.avif`, `hero-bg.avif`) com `avifenc --min 30 --max 40 --speed 6` → tipicamente 30–40% menor que WebP. Adicionar primeiro `<source type="image/avif">` no `<picture>` e no `imagesrcset` do preload (via `type="image/avif"` no `<link>`; navegadores que não suportam AVIF ignoram).

### 2. Garantir que o preload é o primeiro recurso pesado
- Mover o `<link rel="preload" as="image">` do hero para **antes** de qualquer `dns-prefetch`/`preconnect` no `<head>` (ordem importa para a fila de prioridade do navegador).
- Confirmar que nenhum `<script>` bloqueante apareceu antes dele.

### 3. Eliminar o "Element render delay" de 1.91s
O elemento LCP só pinta depois do React montar o `<HeroSection>`. Para reduzir:
- Renderizar **um placeholder estático do hero direto no `index.html`** (dentro de `#root` ou em `body`) com a mesma `<picture>` e os badges/título principais em HTML puro. Quando o React hidrata, substitui. Ganho típico: 800–1500 ms de LCP em mobile.
- Alternativa mais leve: garantir que o CSS crítico (já inline no Passo 2) reserva exatamente as dimensões do hero, e que o `<img>` é descoberto pelo preload scanner — já feito.

A opção do placeholder estático é mais invasiva (precisa duplicar markup do hero em HTML estático). Recomendo só fazer se Passos 1–2 medidos não baixarem o LCP para <2.5s.

### 4. Validação
- Após compressão, rodar `scripts/lighthouse.mjs` mobile.
- Conferir no Network panel que `hero-bg-sm.avif`/`.webp` aparece como **Highest priority** e começa antes de qualquer `.js` chunk.
- Critério: LCP < 2.5s mobile.

### Arquivos impactados
- `public/hero-bg-sm.webp`, `public/hero-bg.webp` — recomprimir.
- `public/hero-bg-sm.avif`, `public/hero-bg.avif` — novos.
- `index.html` — adicionar segundo `<link rel="preload" type="image/avif">` e reordenar.
- `src/components/HeroSection.tsx` — adicionar `<source type="image/avif">` no `<picture>`.

Confirmar antes de implementar. Caso queira pular direto para a opção radical (placeholder HTML estático para zerar o "Element render delay"), me avise.
