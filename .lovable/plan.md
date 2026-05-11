# Plano de refinos de conversão — AWR Baterias

A maior parte da reforma já foi implementada nas iterações anteriores (rotas `/catalogo` e `/servicos` criadas, links do header/footer corrigidos, `BestSellers` com paginação manual). Este plano cobre os ajustes que ainda faltam para fechar o escopo do briefing.

## 1. Hero / Busca (foco em conversão)

Arquivo: `src/components/HeroSection.tsx`, `src/components/VehicleAutocomplete.tsx`

- Reforçar selo de prova social ao lado da busca: estrelas Google, "+1500 clientes desde 2009", "18 meses de garantia", "entrega + instalação 35 min".
- Adicionar "chips" de busca rápida abaixo do input: `Onix 2018`, `HB20 2020`, `Strada 2015`, `Corolla 2017`. Ao clicar, dispara a busca direto.
- Botão WhatsApp secundário ao lado do "Buscar" no hero, para quem prefere atendimento humano (já existe `HeroWhatsButton` — garantir presença mobile).
- Garantir que o autocomplete continua levando direto para `/resultado` (já está) e que o estado vazio mostra CTA "Falar no WhatsApp".

## 2. Página de Catálogo

Arquivo: `src/pages/Catalogo.tsx`

- Aplicar a mesma paginação "Mostrar mais" usada em `BestSellers` (4 mobile / 8 desktop), em vez de listar 100 itens de uma vez.
- Filtros já existem (marca, amperagem) — adicionar filtro por tipo de veículo (carro/moto/utilitário) usando metadados disponíveis em `fetchBatteries`.
- Sticky filter sidebar no desktop e drawer no mobile (já parcialmente feito) — revisar UX em 390px.
- Card do catálogo deve ter CTA duplo: "Pedir agora" (CheckoutDialog) + "WhatsApp" (mensagem pré-preenchida com modelo).

## 3. Página de Serviços

Arquivo: `src/pages/Servicos.tsx`

- Adicionar seção "Áreas atendidas" reaproveitando `CityMap` ou lista de cidades de `src/data/stores.ts`.
- Adicionar bloco de garantia 18 meses + descarte ecológico da bateria antiga.
- Inserir `ManufacturerLogos` e `Testimonials` para reforçar prova social.
- FAQ já existe (`faqLd`) — renderizar visualmente com `Accordion` (hoje só tem JSON-LD).

## 4. Resultado da busca

Arquivo: `src/pages/Resultado.tsx`, `src/components/BatteryCard.tsx`

- Card sticky no topo "Não encontrou? Fale no WhatsApp" quando a lista vier vazia.
- CTAs do card: garantir que ambos (Pedir / WhatsApp) aparecem lado a lado no mobile sem quebrar.

## 5. Prova social na home

Arquivo: `src/pages/Index.tsx`, `src/components/home/HomeMiddle.tsx`

- Inserir um `TrustBar` compacto logo abaixo do Hero (estrelas Google, +1500 clientes, 18m garantia, marcas atendidas) — antes mesmo do `HomeMiddle` carregar via lazy.
- Subir `Testimonials` na ordem do `HomeMiddle` para vir antes de `Benefits`.

## 6. SEO e sitemap

- Adicionar JSON-LD `Service` em `/servicos` e `ItemList` em `/catalogo`.
- Verificar `public/sitemap.xml` (já contém `/catalogo` e `/servicos`).

## Detalhes técnicos

- Reaproveitar padrão de paginação de `BestSellers.tsx` (estado `page`, fatia `items.slice(0, page*perPage)`, botão "Mostrar mais").
- `useIsMobile()` já existe em `src/hooks/use-mobile.tsx` para escolher 4 vs 8.
- Chips de busca rápida no hero: array estático em `HeroSection.tsx`, clique chama `navigate('/resultado?v=' + encodeURIComponent(label))`.
- Novo componente `src/components/TrustBar.tsx` (4 itens, ícones lucide, sem dependências novas).
- Filtro tipo de veículo: derivar de `battery.categories` ou `tags` no retorno de `fetchBatteries`.

## Fora de escopo

- Wizard guiado passo a passo (carro→ano→marca) — manter autocomplete atual.
- Mudanças no checkout/pagamento.
- Alterações no tema WordPress além de menu/SEO já feitos.
- Novas integrações de backend.
