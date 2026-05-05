## Problemas identificados (perfil real)

- **FCP 8.6s / DCL 8.4s** — muito acima do ideal (alvo <2.5s)
- **CLS 0.137** no h1 do Hero (alvo <0.05)
- **102 scripts no load inicial**, ~1.1MB JS
- `CheckoutDialog` (50KB) é importado eagerly dentro do `CartDrawer`
- `App.tsx` importa eagerly `Admin`, `WhatsappLogs/Test/Diagnose`, `BatterySku`, `CheckoutTest`, `PedidoConfirmado`, `Auth`, `Resultado`, `NotFound` — todas viajam no bundle da home
- `lucide-react` aparece como 156KB — não está sendo tree-shaken (provavelmente por algum `import * as`)
- Preloads de imagem usam `/src/assets/hero-bg*.webp` (caminho de dev) — em produção o Vite renomeia com hash, então o preload falha silenciosamente

## Mudanças

### 1. App.tsx — lazy em todas as rotas exceto `/`
Manter eager apenas `Index` e `NotFound`. Lazy: `Auth`, `Admin`, `WhatsappLogs`, `WhatsappTest`, `WhatsappDiagnose`, `BatterySku`, `Resultado`, `CheckoutTest`, `PedidoConfirmado`. Estimativa: −150 a −250KB do bundle inicial.

### 2. CartDrawer — lazy em CheckoutDialog
Trocar `import { CheckoutDialog }` por `lazy(() => import(...))` + `Suspense`. Só carrega quando o usuário abre o carrinho/checkout. Economia: ~50KB + dependências (zod, viacep, fitments).

### 3. Hero — eliminar CLS
Reservar altura mínima no container do h1/subtítulo/badge para que o reflow após a fonte carregar não empurre o layout. Adicionar `min-h` no bloco do título e usar `font-display: swap` com fallback métrico (`size-adjust` no @font-face local, ou simplesmente reservar `min-height` no h1).

### 4. index.html — remover preloads quebrados
Remover os dois `<link rel="preload" as="image" href="/src/assets/...">` que apontam para caminhos não-buildados. Em vez disso, deixar o `HeroSection` importar normalmente (Vite gera o hash e injeta na ordem certa) e marcar o `<img>`/CSS background com `fetchpriority="high"`.

### 5. lucide-react — auditar imports
Rodar `rg "from \"lucide-react\"" src/ -l` e garantir que todos os imports sejam nomeados (`import { X } from "lucide-react"`). Se algum arquivo usar `import * as Icons`, refatorar.

### 6. Vite config — chunk de forms/checkout
Adicionar regra `manualChunks` para `react-hook-form`, `@hookform/resolvers`, `zod` e `date-fns` num chunk `forms` separado, que só baixa quando CheckoutDialog é aberto.

### 7. Remover dependências não usadas (verificar primeiro)
Auditar `recharts`, `embla-carousel-react`, `vaul`, `react-resizable-panels`, `input-otp`, `react-day-picker` — se não há uso real fora de `components/ui`, remover para reduzir o grafo do Vite.

## Arquivos a editar

- `src/App.tsx` — lazy em rotas extras
- `src/components/CartDrawer.tsx` — lazy CheckoutDialog
- `src/components/HeroSection.tsx` — `min-h` no bloco do título
- `index.html` — remover preloads `/src/assets/*`
- `vite.config.ts` — novo chunk `forms`
- `package.json` — remover libs não usadas (após auditoria)

## Métricas alvo após as mudanças

- FCP < 2.5s (de 8.6s)
- CLS < 0.05 (de 0.137)
- JS inicial < 400KB (de ~1.1MB)
- Scripts no load: < 30 (de 102)