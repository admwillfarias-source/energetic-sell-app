
# Plano de Atualização — AWR Baterias (foco em conversão)

## Objetivo
Tornar o caminho "buscar bateria → ver resultado → solicitar (WhatsApp/Checkout)" curto, claro e mobile-first; eliminar links 404 e reforçar prova social.

## Escopo aprovado
1. Hero + busca otimizados (autocomplete atual, levando direto a `/resultado`)
2. Nova página `/catalogo` (todas baterias agrupadas, com filtros)
3. Nova página `/servicos` (entrega+instalação 35min, garantia, áreas, FAQ)
4. Header: corrigir links "Catálogo" e "Serviços" (hoje 404)
5. Reforço de prova social na home
6. Polimento mobile e CTAs persistentes

---

## 1. Header / Navegação
- Atualizar `src/components/Header.tsx`:
  - "Catálogo" → `/catalogo`
  - "Serviços" → `/servicos`
  - Manter "Blog", telefone clicável (`tel:`) e botão WhatsApp em destaque
- Espelhar correções no header do tema WP (`wp-theme/awr-baterias-fast/header.php`) onde houver menus hardcoded
- Garantir menu mobile (drawer) com mesmos itens + CTA WhatsApp fixo

## 2. Hero / Busca (`HeroSection.tsx` + `VehicleAutocomplete.tsx`)
- Manter `VehicleAutocomplete` (já funciona): input único + dropdown
- Melhorias UX:
  - Headline curta com proposta de valor: "Bateria entregue e instalada em até 35 min"
  - Subtítulo: "Porto Alegre e região metropolitana"
  - Selos de confiança abaixo do input (5★ Google, +15 anos, garantia 18 meses)
  - Botão secundário "Falar no WhatsApp" ao lado do "Buscar"
  - Sugestões rápidas ("Onix 2018", "HB20 2020", "Strada 2015") como chips clicáveis pré-busca
  - Estado vazio amigável quando input < 2 chars
- Ao selecionar resultado: navega para `/resultado?codes=...&v=...` (já existe) e mostra `BatteryGrid` com CTA "Pedir esta bateria" muito visível em cada card

## 3. Página `/resultado`
- Revisar `src/pages/Resultado.tsx`:
  - CTA primário em cada card → abre `CheckoutDialog`
  - CTA secundário → WhatsApp pré-preenchido com código da bateria
  - Card sticky no topo: "Não encontrou? Fale conosco" → WhatsApp

## 4. Nova página `/catalogo` (`src/pages/Catalogo.tsx`)
Estrutura:
- Hero curto: título + busca compacta (reusa `VehicleAutocomplete` em variante inline)
- Barra de filtros (sticky em desktop, sheet em mobile):
  - Marca (Moura, Heliar, Zetta, Excell) — checkbox
  - Amperagem (45, 50, 60, 70, 80, 90, 100, 150+ Ah) — chips
  - Tipo de veículo (Popular, Médio, SUV/Picape, Pesado) — chips
- Grid de baterias agrupadas por marca (ou ordenadas por venda) usando `BatteryCard`
- Hub de links SEO no rodapé da página apontando para `/baterias/marca/:slug`, `/baterias/amperagem/:ah`, `/baterias-para/:slug`
- Adicionar rota em `src/App.tsx` (lazy)

## 5. Nova página `/servicos` (`src/pages/Servicos.tsx`)
Seções:
1. Hero: "Entrega e instalação em até 35 minutos" + CTA WhatsApp
2. Como funciona (4 passos, reutiliza `HowItWorks`)
3. Áreas de atendimento (mapa/lista — reaproveita `CityMap`/`stores.ts`)
4. Garantia (18 meses) + descarte ecológico da bateria velha
5. Marcas que trabalhamos (`ManufacturerLogos`)
6. FAQ (reaproveita `FaqHome` ou novo `faqData` filtrado para serviços)
7. CTA final: WhatsApp + telefone
- Adicionar rota em `src/App.tsx` (lazy)

## 6. Prova social na home
- Mover `Testimonials` para mais alto (logo após `BestSellers`)
- Adicionar barra de selos abaixo do Hero: "★ 5,0 Google · +1.500 avaliações · +15 anos · Garantia 18 meses"
- Adicionar logo de marcas (`ManufacturerLogos`) próximo ao Hero (faixa fina)

## 7. CTAs persistentes
- `MobileActionBar` (já existe): garantir botões WhatsApp + Ligar visíveis em todas as páginas novas
- `FloatingWhatsApp` em desktop em `/catalogo`, `/servicos`, `/resultado`

## 8. SEO
- `SEO.tsx` para `/catalogo` e `/servicos` com title <60ch e description <160ch
- JSON-LD `Service` em `/servicos`, `ItemList` em `/catalogo`
- Atualizar `public/sitemap.xml` e `scripts/generate-seo-routes.ts`
- Atualizar `wp-theme/awr-baterias-fast/inc/seo-routes.php` para incluir as novas rotas no sync de páginas WP

## 9. Responsividade & performance
- Tudo mobile-first; breakpoints: base (mobile), `sm` (≥640), `lg` (≥1024)
- Lazy-load das páginas novas (já é o padrão em `App.tsx`)
- Imagens com `loading="lazy"` e srcset (`imageSrcset.ts`)

---

## Detalhes técnicos

### Arquivos a editar
- `src/App.tsx` — adicionar rotas `/catalogo` e `/servicos`
- `src/components/Header.tsx` — links de menu
- `src/components/HeroSection.tsx` — copy + chips + selos + CTA WhatsApp
- `src/components/VehicleAutocomplete.tsx` — pequenos ajustes de UX (chips de exemplo)
- `src/pages/Resultado.tsx` — CTAs reforçados, card "fale conosco"
- `src/pages/Index.tsx` — reordenar prova social
- `wp-theme/awr-baterias-fast/header.php` — links menu
- `wp-theme/awr-baterias-fast/inc/seo-routes.php` — rotas novas
- `public/sitemap.xml`, `scripts/generate-seo-routes.ts`

### Arquivos a criar
- `src/pages/Catalogo.tsx`
- `src/pages/Servicos.tsx`
- `src/components/catalog/CatalogFilters.tsx`
- `src/components/TrustBar.tsx` (selos reutilizáveis)

### Sem mudanças de backend
- Reutiliza `fitments` / `batteries.ts` / `equivalents.json` existentes
- Sem migrações Supabase, sem secrets novos

### Design system
- Apenas tokens semânticos (`bg-background`, `text-primary`, `bg-accent`…) já definidos em `index.css` / `tailwind.config.ts`
- Sem cores hardcoded

---

## Fora de escopo (não será feito agora)
- Wizard guiado de busca (marca→modelo→ano) — usuário optou por manter autocomplete
- Mudanças no checkout/pagamento
- Refator do tema WP além dos links de menu e seo-routes
- Novas integrações ou tabelas no backend

---

## Critérios de aceite
- Cliques em "Catálogo" e "Serviços" no header abrem páginas reais (não 404)
- `/catalogo` lista baterias com filtros funcionais e leva ao checkout/WhatsApp
- `/servicos` apresenta proposta + áreas + FAQ + CTA WhatsApp
- Hero tem chips de busca rápida e selos de confiança
- Layout impecável em 375px, 768px, 1280px
- Lighthouse mobile mantém Performance ≥ 85 e SEO 100
