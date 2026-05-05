
# Plano: Otimização de Performance (Mobile-first)

O site já tem boa base (lazy routes, Suspense, hero WebP responsivo). As maiores oportunidades restantes são: imagens pesadas, carregamento de fontes, animações pesadas e simplificação de componentes acima da dobra.

## 1. Imagens (maior ganho)

- `src/assets/mascot-popup.png` (439 KB) → converter para WebP (~50–80 KB) e servir só quando o popup abrir.
- `src/assets/battery-product.png` (207 KB) → WebP + tamanhos `sm/md` via `imageSrcset`.
- `src/assets/hero-battery.jpg` (116 KB) → remover (não usado pelo Hero atual) ou converter.
- Adicionar `loading="lazy"` e `decoding="async"` em todas as `<img>` fora da dobra (Benefits, HowItWorks, Testimonials, ManufacturerLogos, BatteryCard).
- Garantir `width`/`height` explícitos para evitar CLS.

## 2. Fontes

- Hoje carregam **2 famílias × 7 pesos** do Google Fonts → substituir por **Inter 400/600** + **Plus Jakarta 700** apenas (3 pesos no total).
- Remover o `<noscript>` duplicado do CSS de fontes (o `media=print/onload` já cobre).
- Usar `font-display: swap` (já vem do Google) e `&text=` para subset se possível.

## 3. CSS / Animações

- Remover keyframes não usados em `src/index.css` (`fadeInUp`, `pulseGlow` não referenciados).
- Reduzir uso de `backdrop-blur` (caro em mobile) no Hero e CartDrawer → trocar por `bg-card/95` sólido.
- Manter apenas transições simples (opacity/transform). Remover hover-scale em listas longas.

## 4. Lazy loading de componentes

- `BatteryGrid` é eager no `Index.tsx` → manter eager (acima da dobra) mas garantir que `BatteryDetailDialog` e `CheckoutDialog` sejam `lazy()` (verificar e ajustar).
- `EngagementPopup` e `MobileDebugOverlay` → garantir `lazy` + carregar somente após interação/idle.
- `HeroSection` importa estaticamente `ManufacturerLogos` e `HeroWhatsButton`/`VehicleAutocomplete` (já lazy) — revisar import não usado de `ManufacturerLogos` no Hero.

## 5. Bibliotecas de terceiros

- Auditar `package.json` para libs pesadas não usadas (ex.: recharts, embla, vaul) — remover do bundle inicial via dynamic import onde aplicável.
- `react-helmet-async` → manter (leve), mas garantir SEO só no Index/páginas SEO.

## 6. Cache / Headers

- `public/_headers` já cobre estáticos; adicionar `Cache-Control: immutable` para `.webp` com hash do Vite.

## 7. Mobile

- Reduzir `min-h-[90vh]` do Hero para `min-h-[80vh]` (menos repaint).
- Garantir `MobileActionBar` com `content-visibility: auto` em seções fora da viewport (`LazySection` já faz parecido).
- Revisar `MobileActionBar` para evitar listeners de scroll caros.

## 8. Métricas-alvo

- LCP < 2.5s em 4G mobile
- CLS < 0.05
- JS inicial < 180 KB gzip
- PageSpeed mobile ≥ 90

## Arquivos a alterar (estimativa)

- `index.html` (fontes, preloads)
- `src/index.css` (remover keyframes)
- `src/assets/*` (substituir PNGs por WebP otimizados)
- `src/components/EngagementPopup.tsx`, `HeroSection.tsx`, `BatteryCard.tsx`, `Benefits.tsx`, `Testimonials.tsx`, `ManufacturerLogos.tsx`, `HowItWorks.tsx`, `MobileActionBar.tsx`
- `src/pages/Index.tsx` (revisar Suspense boundaries)
- `package.json` (remover libs não usadas, se houver)

## Fora de escopo

- Reescrever o roteamento (já está bom).
- Migrar para SSR/SSG.

Aprove para eu aplicar as mudanças. Posso começar pelas imagens + fontes (maior impacto) e seguir incrementalmente.
