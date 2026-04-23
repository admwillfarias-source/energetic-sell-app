

## Melhorias: Gatilhos mentais + SEO + Prova social

Tom equilibrado: autoridade ("Desde 2009", marcas oficiais, garantia) combinado com urgência sutil ("plantão agora", "35 min").

### 1. Hero + Header (gatilhos mentais)

**`src/components/Header.tsx`**
- Adicionar microbadge "Desde 2009 · +1500 clientes" ao lado da logo (visível em md+).
- Manter telefone e carrinho; melhorar contraste do CTA telefone (bg accent leve em hover).

**`src/components/HeroSection.tsx`**
- Trocar h1 para incluir palavra-chave forte: "Bateria automotiva entregue e instalada em **Porto Alegre** em até 35 minutos".
- Adicionar **3ª badge de autoridade**: "Desde 2009 · Distribuidor oficial" (ícone Award).
- Adicionar **bloco de aversão à perda** abaixo do parágrafo: caixa pequena com ícone AlertTriangle e texto "Carro não pega? Evite reboque (R$ 150+) e atrasos. Resolva em 35 min."
- Substituir o card de busca por um CTA primário maior + busca; o botão "Buscar" passa a ser cor primary (vermelho), mais proeminente.
- Logo abaixo das estrelas: faixa horizontal com **logos das marcas oficiais** (Moura, Heliar, Freedom, Excell, Zetta, Eletran) em escala de cinza com hover colorido — reforço de autoridade. Reaproveita `ManufacturerLogos` em versão compacta.

### 2. Depoimentos aprofundados (`src/components/Testimonials.tsx`)

- Expandir de 3 para **6 depoimentos** com cidades variadas, modelos de carro mencionados, e cenários distintos (emergência noturna, agendado, frota, etc.).
- Adicionar header da seção com **selo Google grande**: "★ 5.0 · 1500+ avaliações no Google" + link.
- Cada card ganha: badge "Compra verificada", chip do modelo de bateria comprada, resposta da AWR (1 linha) em 2 dos cards (mostra atendimento ativo).
- Manter JSON-LD `aggregateRating` com novos números.
- Adicionar **faixa de selos** abaixo dos depoimentos: Garantia 24m, Instalação grátis, Pague na entrega, Distribuidor oficial — com ícones ShieldCheck/Wrench/Wallet/Award.

### 3. SEO on-page

**Hierarquia de cabeçalhos** — auditoria e correção:
- Garantir um único `<h1>` por página (Hero usa h1; demais seções usam h2 com `id` para âncoras; sub-blocos usam h3).
- `Benefits`, `HowItWorks`, `HowToOrder`, `FaqHome`, `QuickNavigation`, `ManufacturerLogos` recebem `<h2>` de seção quando faltar.

**Atributos `alt` em imagens**:
- `BatteryCard`: alt descritivo "Bateria {marca} {modelo} {amperagem}Ah" (verificar se já está — corrigir se genérico).
- `ManufacturerLogos`: alt "Logo {marca} — distribuidor autorizado AWR Baterias".
- Hero já tem alt bom; manter.

**Meta tags / SEO component**:
- Em `src/pages/Index.tsx`: enriquecer `description` com palavras-chave de cauda longa ("bateria automotiva 24h", "instalação grátis Porto Alegre", marcas).
- Adicionar `image` (og) usando hero-bg.
- Em `City.tsx` e `BatterySku.tsx`: revisar para ter title único + h1 único e meta description com cidade/sku.

**`index.html`**:
- Atualizar `<title>` para incluir "Porto Alegre" e marca.
- Adicionar `<meta name="theme-color">`, `<link rel="preconnect">` para fontes.

**JSON-LD adicional**:
- Em `Index.tsx`, somar `LocalBusiness` com `openingHoursSpecification` (06h–22h), `foundingDate: 2009`, `sameAs` (Google, Instagram se disponível).

### 4. Acessibilidade rápida

- Garantir `aria-label` em ícones-botão (Header carrinho já tem `data-debug-id`; adicionar `aria-label="Abrir carrinho"`).
- Foco visível nos CTAs do Hero (já vem do `focus-visible` do shadcn — verificar que não foi sobrescrito).

### Arquivos a editar
- `src/components/Header.tsx`
- `src/components/HeroSection.tsx`
- `src/components/Testimonials.tsx`
- `src/components/ManufacturerLogos.tsx` (variante compacta + alts)
- `src/components/BatteryCard.tsx` (alts)
- `src/components/Benefits.tsx`, `HowItWorks.tsx`, `HowToOrder.tsx`, `FaqHome.tsx`, `QuickNavigation.tsx` (verificar h2)
- `src/pages/Index.tsx` (SEO + JSON-LD)
- `src/pages/City.tsx`, `src/pages/BatterySku.tsx` (SEO)
- `index.html` (title + theme-color)

### Fora do escopo (próximas fases, se aprovar)
- Reformulação total do catálogo navegável (modal → página) — frente grande, separada.
- A/B testing de CTA (precisa instrumentação).
- Blog / FAQ expandida com artigos.
- Auditoria de performance aprofundada.

