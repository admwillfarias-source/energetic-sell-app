# Plano: dividir a home em 3 blocos com carregamento sob demanda (sem iframes)

## Por que NÃO usar iframes

Cada iframe baixa um React + bundle CSS + fontes próprios. 3 iframes = ~3× o JS/CSS, perde estado compartilhado (carrinho, busca, scroll), quebra SEO e analytics. O ganho que você quer (carregar partes só quando o usuário rolar até elas) é exatamente o que `IntersectionObserver` + `React.lazy` já fazem — sem nenhuma das desvantagens.

A home já tem um `LazySection` (`src/components/LazySection.tsx`) que monta cada bloco via observer com `rootMargin: 300px`. Vou agrupar a página em **3 blocos lógicos** e endurecer o lazy.

## Os 3 blocos

| Bloco | O que entra | Como carrega |
|---|---|---|
| **1 — Above the fold (eager)** | `Header`, `HeroSection`, `BatteryGrid` (só quando há `?q=/codes/v=`) | Eager, no chunk inicial. É o LCP. |
| **2 — Middle (lazy ao chegar perto)** | `HowToOrder`, `BestSellers`, `Benefits`, `HowItWorks`, `Testimonials` | Um único `LazySection` agrupado, dispara ao usuário se aproximar (rootMargin 200px). Chunk único `home-middle`. |
| **3 — Bottom (lazy só quando próximo)** | `QuickNavigation`, `ManufacturerLogos`, `FaqHome`, `Footer`, `CartDrawer`, `MobileActionBar`, `FloatingWhatsApp` | `LazySection` separado com rootMargin 100px. Chunk único `home-bottom`. Componentes flutuantes (CartDrawer/Mobile/WhatsApp) são montados quando o bottom entra. |

Resultado: o navegador baixa só o chunk do bloco 1 no primeiro paint. Ao rolar, dispara o chunk do bloco 2; ao chegar perto do rodapé, o bloco 3.

## Arquivos a criar

- `src/components/home/HomeMiddle.tsx` — agrupa os 5 componentes do bloco 2 em um único arquivo. Vira um único chunk lazy.
- `src/components/home/HomeBottom.tsx` — agrupa os 7 componentes do bloco 3.

## Arquivos a editar

- `src/pages/Index.tsx`
  - Remover os 12 `lazy()` individuais.
  - Importar `HomeMiddle` e `HomeBottom` via `lazy()`.
  - Trocar a árvore atual por:
    ```tsx
    <HeroSection />
    {hasSearch && <Suspense ...><BatteryGrid /></Suspense>}
    <LazySection minHeight="1400px" rootMargin="200px">
      <Suspense fallback={null}><HomeMiddle /></Suspense>
    </LazySection>
    <LazySection minHeight="900px" rootMargin="100px">
      <Suspense fallback={null}><HomeBottom /></Suspense>
    </LazySection>
    ```
  - `minHeight` de cada bloco é a soma dos `minHeight` atuais (evita CLS).

- `vite.config.ts` — adicionar `manualChunks` para garantir que cada bloco vire **um** chunk:
  ```ts
  if (id.includes("/components/home/HomeMiddle")) return "home-middle";
  if (id.includes("/components/home/HomeBottom")) return "home-bottom";
  ```

## Detalhes técnicos

```text
Antes (atual):
  Index importa 12 chunks separados via lazy().
  IntersectionObserver dispara 9 vezes (um por LazySection).
  Cada chunk = 1 request HTTP.

Depois:
  Index importa 2 chunks (home-middle, home-bottom).
  Apenas 2 IntersectionObservers.
  2 requests HTTP em vez de 9.
```

Ganhos esperados:
- **−7 round-trips HTTP** após o LCP (importante em mobile 4G).
- **TBT melhor**: menos chunks = menos parse/compile concorrente.
- **LCP idêntico** (bloco 1 não muda).
- **Sem custo de CLS** se o `minHeight` agregado for respeitado.

## Riscos e mitigação

- **Splash de tela em branco** entre blocos ao rolar rápido → `minHeight` correto + fallback opcional com skeleton baixo (pode ser adicionado depois).
- **Componentes flutuantes (FloatingWhatsApp, MobileActionBar)** hoje aparecem cedo. Movê-los para o bloco 3 atrasa eles em mobile. Decisão: mantê-los no bloco 1 (eager dentro de `Suspense fallback={null}`) se você quiser que apareçam imediatamente. **Recomendação: deixá-los no bloco 3** — em mobile o usuário rola rápido e o ganho de bytes vale.
- **CartDrawer**: ele só aparece quando o usuário clica no carrinho do Header. Pode ser lazy *à parte* disparado pelo clique, não pelo scroll. Vou colocar no bloco 3 por simplicidade (rola = monta).

## Fora deste plano

- Mudar o sistema de iframes do tema WP (você escolheu cenário standalone).
- Otimizar `BatteryGrid` (já lazy + guard de URL).
- Service worker / cache.