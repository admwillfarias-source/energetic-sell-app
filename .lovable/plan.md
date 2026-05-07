# Conversão AWR Baterias → Tema WordPress + Elementor + WooCommerce

## Objetivo da entrega

Gerar um **pacote de especificação técnica + scaffolding** para um desenvolvedor WordPress replicar o app atual como tema nativo (sem iframe, sem React), usando Elementor Pro + WooCommerce + um plugin auxiliar para a busca encadeada Marca → Modelo → Ano → Amperagem.

O entregável final será um arquivo `awr-wordpress-spec.zip` em `/mnt/documents/awr-wordpress/` contendo:

```
awr-wordpress/
├── README.md                          ← visão geral + ordem de execução
├── 01-briefing-dev.md                 ← prompt completo para dev/agência
├── 02-design-tokens.md                ← cores, fontes, espaçamentos, breakpoints
├── 03-estrutura-paginas.md            ← wireframe textual de cada página
├── 04-woocommerce-setup.md            ← atributos, taxonomias, campos extras, exemplo CSV
├── 05-busca-encadeada.md              ← spec funcional + endpoints AJAX
├── 06-elementor-templates.md          ← lista de templates + widgets HTML personalizados
├── 07-integracao-whatsapp.md          ← formato de mensagem, links wa.me
├── 08-seo-performance.md              ← checklist Core Web Vitals + schema.org
├── plugin-awr-search/                 ← plugin WP funcional (busca AJAX + shortcodes)
│   ├── awr-search.php
│   ├── includes/
│   │   ├── class-awr-rest.php         ← endpoints /wp-json/awr/v1/...
│   │   ├── class-awr-shortcodes.php   ← [awr_search_modal] [awr_results]
│   │   └── class-awr-import.php       ← importador do fitments.csv
│   └── assets/
│       ├── awr-search.js              ← reaproveitado do export anterior
│       └── awr-search.css
├── theme-child-hello-elementor/       ← child theme base
│   ├── style.css
│   ├── functions.php
│   └── awr-tokens.css                 ← variáveis CSS do design system
├── data/
│   ├── fitments-sample.csv            ← export Supabase → CSV WP All Import
│   └── produtos-sample.csv            ← template WooCommerce
└── elementor-templates/
    ├── home.json                      ← template Elementor exportado (estrutura)
    ├── catalogo.json
    ├── single-product.json
    └── header-footer.json
```

## Arquitetura proposta

```text
WordPress + Hello Elementor (child)
        │
        ├── WooCommerce ........... produtos (baterias) + atributos globais
        │     ├── pa_marca-carro
        │     ├── pa_modelo-carro
        │     ├── pa_ano
        │     └── pa_amperagem
        │
        ├── Plugin awr-search ..... CPT "fitment" (mapeamento carro→SKU)
        │     ├── REST: /awr/v1/search?q=onix
        │     ├── REST: /awr/v1/years?model=onix
        │     ├── REST: /awr/v1/products?model=onix&year=2018
        │     └── Shortcode [awr_search] [awr_results]
        │
        ├── Elementor Pro ......... Theme Builder (header, footer, single, archive)
        │     └── Loop Builder ..... cards de produto
        │
        └── awr-tokens.css ........ design system (reaproveitado do export anterior)
```

## Páginas e templates

| Página | Tipo | Construção |
|---|---|---|
| Home | Page (Elementor) | Hero + 3 passos + Mais vendidas (Loop) + Benefícios + Como funciona + Depoimentos + Mais buscados + Marcas + FAQ |
| Catálogo | Archive WooCommerce | Loop Builder + filtros (FacetWP ou equivalente) |
| Produto único | Single WooCommerce | Galeria + preço (à vista/parcelado) + benefícios + WhatsApp CTA |
| Serviços | Page | Elementor puro |
| Contato | Page | Form (Elementor Forms) + mapa + WhatsApp |
| Resultados busca | Page (`/resultado`) | `[awr_results]` renderiza cards via JS |

## Busca encadeada — fluxo

```text
[input: "onix"]
        │ keyup ≥2 chars
        ▼
GET /wp-json/awr/v1/search?q=onix
        │ retorna [{brand, model, years:[2012..2020]}]
        ▼
[chips de anos clicáveis]
        │ click 2018
        ▼
GET /wp-json/awr/v1/products?model=onix&year=2018
        │ retorna SKUs do fitment → consulta WC products
        ▼
[cards renderizados em [data-awr-results]]
```

A lógica JS já existe no export anterior (`awr-search.js`) — será adaptada para consumir `/wp-json/awr/v1/*` em vez de Supabase.

## Plugins recomendados

- **Elementor Pro** (Theme Builder + Loop Builder + Forms)
- **WooCommerce** (produtos + atributos)
- **WP All Import Pro** (importar `fitments.csv` e `produtos.csv`)
- **FacetWP** ou **Search & Filter Pro** (filtros do catálogo)
- **Rank Math** (SEO + schema Product)
- **WP Rocket** + **Perfmatters** (performance / Core Web Vitals)

## Migração de dados

1. Export Supabase `fitments` → CSV → import via WP All Import como CPT `awr_fitment` (campos: brand, model, year_start, year_end, sku_moura, sku_heliar, sku_zetta, sku_excell).
2. Produtos: planilha WooCommerce com atributos globais preenchidos + ACF para "Tempo de entrega", "Garantia", "Benefícios" (repeater).
3. Mapeamento SKU fitment ↔ produto WC: usar campo `_sku` nativo.

## O que NÃO está no escopo deste plano

- Implementação real do tema dentro deste projeto Lovable (este projeto continua sendo o app React).
- Compra/instalação de licenças (Elementor Pro, FacetWP).
- Migração de imagens/conteúdo dos produtos reais (template/exemplo apenas).

## Próximo passo após aprovação

Gero todos os arquivos do pacote acima em `/mnt/documents/awr-wordpress/`, incluindo o plugin `awr-search` funcional pronto para zip+upload no WP, e devolvo o ZIP final como `<lov-artifact>`.