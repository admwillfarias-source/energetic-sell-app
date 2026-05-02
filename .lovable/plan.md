## Plano de execução — SEO local AWR Baterias

Decisões confirmadas:
- Domínio canônico: **awrbaterias.com.br** (mantido em todos os schemas/sitemap)
- NAP unificado: WhatsApp/telefone oficial **(51) 99319-9486** — substituirá `(51) 98541-9143` em `cityContent.ts`, FAQs, schemas e CTAs
- Ordem de execução: **(1) bairros multi-cidade → (2) expansão de conteúdo → (3) blog topo de funil → (4) fundações técnicas**

Fora de escopo (operacional, não-código): Google Meu Negócio, link building, diretórios (Apontador/Kekanto), assessoria de imprensa, automação de pedido de avaliação.

---

### Fase 1 — Páginas de bairro para outras cidades

Hoje só Porto Alegre tem bairros (`neighborhoodPages` em `src/data/neighborhoodContent.ts`, rota `/baterias/porto-alegre/:slug`). Vou replicar o padrão para **Gravataí, Cachoeirinha, Canoas, Alvorada, Viamão, Esteio e Sapucaia do Sul**.

- Estender o tipo `NeighborhoodPageData` para aceitar qualquer cidade (campo `citySlug`) e agrupar por cidade.
- Adicionar ~6–10 bairros relevantes por cidade, com `deliveryMinutes`, vias de referência e geo aproximada (centro do bairro).
  - Gravataí: Centro, Parque dos Anjos, Morada do Vale I/II/III, Neópolis, Salgado Filho, Barnabé, Bom Sucesso, São Geraldo
  - Cachoeirinha: Vila Vista Alegre, Vila Cachoeirinha, Parque Marechal Rondon, Granja Esperança, Parque Brasília
  - Canoas: Centro, Mathias Velho, Niterói, Igara, Marechal Rondon, São José, Guajuviras
  - Alvorada/Viamão/Esteio/Sapucaia: 5–6 principais cada
- `Neighborhood.tsx`: já lê por slug — ajustar para resolver via `citySlug + slug` e listar “outros bairros próximos” ordenados por `deliveryMinutes`.
- Página de cidade (`City.tsx`): a seção “entrega mais rápida por bairro” passa a usar a nova base e fica habilitada para todas as cidades, não só POA.
- Atualizar `public/sitemap.xml` com todas as novas URLs (`/baterias/{cidade}/{bairro}`).
- JSON-LD `LocalBusiness` + `BreadcrumbList` por bairro, reaproveitando `src/lib/seoSchemas.ts`.

### Fase 2 — Expansão de conteúdo

**2.1 Páginas de marca** (`/baterias/marca/:slug` para Moura, Heliar, Zetta, Excell, Freedom, Eletran, Global)
- Nova `src/pages/Brand.tsx` + expansão de `brandContent.ts` com: descrição, garantia, linhas de produto (EFB/AGM/comum), faixa de preço derivada de `batteries.ts`, FAQ específica e ItemList JSON-LD dos SKUs daquela marca.

**2.2 Páginas por amperagem** (`/baterias/amperagem/:ah` — 45, 50, 60, 70, 75, 100, 150, 220Ah)
- Nova `src/pages/Amperage.tsx` que filtra `batteries.ts` pela amperagem, mostra carros compatíveis (via `fitments.json`), faixa de preço, marcas disponíveis.

**2.3 Depoimentos localizados**
- Adicionar `testimonials: { name, neighborhood, text, rating }[]` em cada `CityPageData` (3–5 por cidade) e renderizar bloco com `Review` schema.

**2.4 Mapa Google embed**
- Componente `<CityMap city geo />` usando `<iframe src="https://www.google.com/maps/embed/v1/place...">` com `loading="lazy"` em cada `City.tsx` e `Neighborhood.tsx`. Sem API key (modo place público) ou usando a chave de Maps que já estiver disponível.

**2.5 Footer e navegação interna**
- Atualizar `Footer.tsx` para listar marcas, amperagens populares e top-bairros, adensando o link interno.

### Fase 3 — Blog / topo de funil

- Nova rota `/blog` (índice) + `/blog/:slug` (artigo), página estática alimentada por `src/data/blogPosts.ts` (TS, sem CMS).
- 6 artigos iniciais focados nas KWs do plano:
  1. “Carro não liga e faz tec tec: o que é e como resolver”
  2. “Quanto tempo dura uma bateria Moura?”
  3. “Como saber se a bateria do carro pifou — 7 sinais”
  4. “Bateria 60Ah ou 70Ah: qual escolher?”
  5. “Bateria descarregou no frio: por que acontece em Porto Alegre/Gravataí”
  6. “EFB vs AGM vs comum: diferenças para start-stop”
- Cada artigo com `Article` JSON-LD, breadcrumb, CTA WhatsApp inline e bloco “atendemos sua cidade” linkando às landing pages.
- Inclusão no sitemap.

### Fase 4 — Fundações técnicas (Core Web Vitals + NAP)

- **NAP unificado**: substituir `(51) 98541-9143` por `(51) 99319-9486` em `cityContent.ts`, FAQs e qualquer schema. Garantir mesmo número em `FloatingWhatsApp`, header e footer.
- **Imagens**: auditar `src/assets/`, converter para WebP (mantendo fallback) e adicionar `width`/`height` + `loading="lazy"` (exceto LCP) para reduzir CLS.
- **LCP**: marcar imagem hero da home/cidade como `fetchpriority="high"` e `loading="eager"`; pré-carregar fonte principal em `index.html`.
- **JS**: garantir `lazy()` em rotas pesadas (já parcial em `App.tsx`); revisar imports do Index para code-splitting de componentes abaixo da dobra.
- **Mobile CRO**: revisar tamanho de toque dos CTAs (mín. 48px), espaçamento e contraste do `FloatingWhatsApp`.
- **Robots/Sitemap**: regenerar `sitemap.xml` ao final de cada fase incluindo todas as URLs novas; revisar `robots.txt`.
- **Validação**: revisar manualmente os JSON-LD gerados (LocalBusiness, FAQPage, BreadcrumbList, Product, Article, Review) com base em `src/lib/seoSchemas.ts` para 100% de conformidade Rich Results.

---

### Detalhes técnicos

Arquivos novos:
- `src/data/blogPosts.ts`, `src/pages/Blog.tsx`, `src/pages/BlogPost.tsx`
- `src/pages/Brand.tsx`, `src/pages/Amperage.tsx`
- `src/components/CityMap.tsx`

Arquivos editados:
- `src/data/neighborhoodContent.ts` (multi-cidade), `src/data/cityContent.ts` (telefone + depoimentos), `src/data/brandContent.ts` (conteúdo rico)
- `src/pages/Neighborhood.tsx`, `src/pages/City.tsx`, `src/components/Footer.tsx`, `src/App.tsx` (novas rotas)
- `src/lib/seoSchemas.ts` (helpers para `Article` e `Review`)
- `public/sitemap.xml`, `public/robots.txt`

Estrutura de rotas resultante:

```text
/                                    Home
/baterias/:cidade                    City (7 cidades)
/baterias/:cidade/:bairro            Neighborhood (~50 URLs)
/baterias/marca/:slug                Brand (7 URLs)
/baterias/amperagem/:ah              Amperage (~8 URLs)
/baterias-para/:slug[/:year]         VehicleSeo (já existe)
/blog, /blog/:slug                   Conteúdo topo de funil (6+ URLs)
```

### Como vou entregar

Por ser bastante código, executarei em **4 entregas separadas** (uma por fase), começando pela Fase 1. Após cada fase você revisa antes de eu seguir para a próxima.
