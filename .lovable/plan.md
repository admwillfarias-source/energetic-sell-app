## Passo 4 — CLS, cache, DOM e CSS não usado (final)

Boa parte já foi feita nos passos anteriores (cache 1 ano para assets/webp/avif/woff2; lazy sections em quase tudo abaixo da dobra; dimensões no hero, BatteryImage e ManufacturerLogos). Restam ajustes finos.

### 1. CLS de fontes — ajustar fallback metrics
A causa do "Layout shift culprits" do PageSpeed é a troca `system-ui` → Inter/Plus Jakarta. Adicionar `@font-face` no `index.css` para os fallbacks com `size-adjust`/`ascent-override` casados, técnica recomendada pelo Chrome team:

```css
@font-face {
  font-family: "Inter Fallback";
  src: local("Arial");
  size-adjust: 107%;
  ascent-override: 90%;
  descent-override: 22%;
  line-gap-override: 0%;
}
@font-face {
  font-family: "Plus Jakarta Sans Fallback";
  src: local("Arial");
  size-adjust: 105%;
  ascent-override: 95%;
  descent-override: 25%;
  line-gap-override: 0%;
}
```
E ajustar `tailwind.config.ts` para incluir esses fallbacks nas famílias `sans`/`display` antes de `system-ui`. CLS de fonte → ~0.

### 2. Confirmar dimensões em imagens above-the-fold
- `BatteryImage.tsx`, `ManufacturerLogos.tsx`, `HeroSection.tsx` — já têm `width`/`height` (verificado).
- Imagens em `CartDrawer`, `BatteryDetailDialog`, `CheckoutDialog` — abrem sob demanda, sem impacto no CLS inicial. Não tocar.

### 3. Reflow no `MobileDebugOverlay`
- `MobileDebugOverlay` só roda em DEV (`import.meta.env.DEV`), não vai pra produção. Sem ação.
- Não há `getBoundingClientRect` em hot paths de produção.

### 4. CSS não usado (Tailwind)
- `tailwind.config.ts` já tem `content` correto (`./src/**/*.{ts,tsx}`). Tailwind purga no build.
- O "16 KiB de CSS não utilizado" do Lighthouse vem majoritariamente de utilities Radix/shadcn que são usadas só em rotas internas. Não dá pra reduzir mais sem split de CSS por rota (Vite ainda não suporta nativamente). Aceitar.

### 5. Cache headers
- `public/_headers` já está correto: `/assets/*` e `/*.{webp,avif,woff2}` com `max-age=31536000, immutable`. Nada a fazer.

### 6. DOM size
- `BestSellers`, `FaqHome`, `Testimonials` já estão lazy. `BatteryGrid` continua eager (é parte do produto). Sem ação adicional.

### 7. Validação
- Rodar PageSpeed mobile e conferir queda de CLS para <0.05.
- Confirmar no DevTools que `Inter Fallback` aparece como família ativa antes da fonte web carregar.

### Arquivos impactados
- `src/index.css` — adicionar 2 `@font-face` de fallback com size-adjust.
- `tailwind.config.ts` — incluir `"Inter Fallback"` e `"Plus Jakarta Sans Fallback"` nas famílias `sans`, `display`, `body`.
- (`index.html` CSS crítico inline também atualizado para usar o fallback ajustado em `body`/`h1-h3`.)

Confirmar para implementar.
