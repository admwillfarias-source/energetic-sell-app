# Plano: cortar FCP/LCP/TBT da home

Métricas atuais (Lighthouse): **FCP 3,6s · LCP 8,4s · TBT 470ms · Speed Index 9,8s**.
Após investigar, três coisas estão custando caro — e nenhuma exige mudar visual.

## 1. Remover o bypass de Lighthouse no `LazySection` (CRÍTICO)

`src/components/LazySection.tsx` tem isto:

```ts
const isAuditEnv = (): boolean => {
  const ua = navigator.userAgent || "";
  if (/Lighthouse|...|HeadlessChrome|.../i.test(ua)) return true;
  return false;
};
const [visible, setVisible] = useState(() => isAuditEnv());
```

Resultado: **durante a auditoria do Lighthouse, TODOS os blocos `HomeMiddle` + `HomeBottom` montam imediatamente** — exatamente o oposto da estratégia de lazy-load por scroll. É por isso que LCP=8,4s e Speed Index=9,8s: a auditoria está medindo a página inteira renderizada de uma vez, não só o hero. Em usuário real, a página já é rápida.

**Ação:** remover `isAuditEnv()`. `useState(false)` direto. Lighthouse vai medir só o hero, como o usuário real vê.

## 2. Pintar o hero antes do JS parsear (ganho de FCP)

Hoje o `<div id="root">` está vazio no HTML. O navegador precisa: baixar bundle → parsear React → montar `<HeroSection>` → pintar. Isso é ~3s de FCP em mobile.

**Ação:** inserir um *shell estático* do hero (mesmo background + H1 + CTA fake, sem JS) dentro de `#root` no `index.html`. O CSS crítico já está inline. Quando o React montar, ele substitui — sem CLS porque mesmas dimensões. FCP cai para o tempo de baixar HTML+CSS crítico (~600ms).

Estrutura mínima do shell:
- `<section id="inicio">` com `<picture>` do hero (mesmas tags do componente)
- `<h1>` "Bateria entregue e instalada em até 35 minutos"
- placeholder visual da busca (input estático)

## 3. Tornar `react-helmet-async` lazy (ganho de TBT)

`HelmetProvider` envolve o app inteiro em `main.tsx` e o `<SEO>` corre em todo render do `Index`. O `<title>` e `<meta description>` já existem no `index.html`. JSON-LD pode ser injetado depois do LCP.

**Ação:**
- Remover `<HelmetProvider>` de `main.tsx`.
- Em `Index.tsx`, adiar a injeção do JSON-LD via `requestIdleCallback` (cria um `<script type="application/ld+json">` no `<head>` direto).
- Manter `<SEO>` apenas nas rotas internas (cidade, blog etc.) onde o título muda.

Ganho: ~15KB gz removidos do caminho crítico + menos trabalho de render.

## 4. Carregar `LazyToaster` só após primeira interação

Hoje monta em `App.tsx` dentro de `<Suspense fallback={null}>` — Suspense+lazy ainda dispara import imediato.

**Ação:** trocar por `useEffect` com `requestIdleCallback` (timeout 3s) que faz `import("@/components/LazyToaster")` e renderiza via state. Toaster só aparece quando há `toast()`, então pode chegar tarde.

## Arquivos a editar

- `src/components/LazySection.tsx` — remover `isAuditEnv`
- `index.html` — adicionar shell estático do hero dentro de `#root`
- `src/main.tsx` — remover `HelmetProvider`
- `src/pages/Index.tsx` — JSON-LD via idle, sem `<SEO>` (ou `<SEO>` lazy)
- `src/App.tsx` — `LazyToaster` via idle, não Suspense

## Resultado esperado

| Métrica | Antes | Depois (estimado) |
|---|---|---|
| FCP | 3,6s | ~0,8s |
| LCP | 8,4s | ~2,0s |
| TBT | 470ms | ~150ms |
| Speed Index | 9,8s | ~2,5s |

O item #1 sozinho já deve cortar LCP/SI pela metade. Os outros são ganhos compostos.
