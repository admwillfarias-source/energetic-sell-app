## Objetivo

Hoje a página `/resultado?v=...&codes=...` (arquivo `src/pages/Resultado.tsx`) tem apenas um `<SEO>` básico com title e description genéricos. Vamos transformá-la numa página otimizada para SEO orgânico para buscas como "bateria para Fiat Toro", "bateria Hyundai Creta 2020" etc.

## O que será feito

### 1. SEO dinâmico em `src/pages/Resultado.tsx`

Quando houver `vehicle` (ex: "Fiat Toro 2020"):

- **Title**: `Bateria para {Veículo} — Preço, Modelo e Entrega em 35 min | AWR Baterias`
- **Description**: inclui marcas compatíveis encontradas (Moura, Heliar, Zetta, Excell), faixa de preço (a partir de R$ X), entrega em 35 min em Porto Alegre + cidades atendidas e instalação grátis. Gerada dinamicamente a partir de `sorted` (resultados).
- **Canonical**: URL absoluta com `?v=...&codes=...` para evitar conteúdo duplicado.
- **OG image**: imagem da primeira bateria recomendada (quando disponível).
- **Robots**: `index,follow` quando há resultados; `noindex` quando a busca não retornou nada (evita poluir índice com páginas vazias).

### 2. JSON-LD estruturado

Três schemas injetados via prop `jsonLd` do componente `SEO`:

- **BreadcrumbList**: Home › Baterias › {Veículo}
- **ItemList** com os produtos retornados (nome, marca, preço, link, imagem) — ajuda o Google a exibir resultados ricos.
- **FAQPage** com 3 perguntas geradas dinamicamente:
  - "Qual bateria é compatível com {Veículo}?"
  - "Quanto custa uma bateria para {Veículo}?"
  - "Quanto tempo demora a entrega da bateria para {Veículo}?"

### 3. Headings e conteúdo on-page (bom para SEO)

- Manter o `<h1>` atual ("Baterias compatíveis com {Veículo}").
- Adicionar abaixo da lista um bloco curto com:
  - `<h2>` "Sobre as baterias para {Veículo}" — parágrafo curto descrevendo as opções (marcas, amperagens encontradas) gerado a partir dos resultados.
  - `<h2>` "Perguntas frequentes sobre bateria para {Veículo}" — usa o componente Accordion com as mesmas 3 perguntas do FAQPage JSON-LD (consistência on-page ↔ structured data).
- Bloco de "Cidades atendidas" com links internos para `/baterias/{slug}` (reaproveitando dados de `cityContent.ts`) — reforça linkagem interna.

### 4. Sitemap

Não vamos listar combinações `vehicle × codes` no sitemap (alta cardinalidade). Em vez disso, garantir que a busca exista e seja descoberta via páginas de cidade e marcas. Páginas individuais por modelo de carro popular (Strada, Onix, etc.) ficam como melhoria futura usando `src/data/vehicles.ts`.

## Arquivos afetados

- `src/pages/Resultado.tsx` — SEO dinâmico, JSON-LD, headings extras, FAQ on-page e links de cidades.

## Fora de escopo (sugestões para depois)

- Páginas estáticas por modelo (`/baterias-para/{slug}`) usando `vehiclePages` — gera URLs amigáveis indexáveis sem depender de querystring.
- Sitemap dinâmico incluindo esses modelos.
