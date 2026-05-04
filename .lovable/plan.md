# Plano: Tema WordPress "awr-baterias" (headless + widget de busca)

## Objetivo
Gerar um pacote `.zip` instalável no WordPress que:
1. Serve o site React atual (Vite build) como tema (Home, Bairros, Cidades, Marcas, Amperagens, Blog, Checkout WhatsApp, SEO).
2. Expõe a busca de bateria por veículo como **shortcode `[awr_busca_bateria]`** para usar em qualquer página/post do WP.
3. Mantém o backend atual (Supabase Edge Functions + WooCommerce Store API) — zero migração de dados.

## Arquitetura

```text
WordPress (PHP)
 ├─ wp-content/themes/awr-baterias/
 │   ├─ style.css                  (cabeçalho do tema)
 │   ├─ functions.php              (enqueue do bundle, shortcode, rewrite)
 │   ├─ index.php                  (catch-all → renderiza <div id="root">)
 │   ├─ front-page.php             (home)
 │   ├─ 404.php
 │   ├─ header.php / footer.php    (mínimos: <head> + container)
 │   ├─ assets/                    (output do `vite build`)
 │   │   ├─ index-[hash].js
 │   │   ├─ index-[hash].css
 │   │   └─ ...imagens, fonts
 │   └─ widget/
 │       └─ awr-busca.js           (bundle isolado só da busca)
 └─ Backend (inalterado): Supabase + WooCommerce Store API
```

## Entregáveis

1. **`/wp-theme/awr-baterias/`** — código-fonte do tema (PHP + assets do build).
2. **`/wp-theme/awr-baterias.zip`** — pacote pronto pra instalar via *Aparência → Temas → Adicionar*.
3. **`/wp-theme/README-INSTALACAO.md`** — passo a passo (instalar tema, criar página "Início" e definir como estática, configurar permalinks como "Nome do post", instalar Yoast opcional).

## Passos de implementação

### 1. Configurar Vite para gerar bundle compatível com WP
- Criar `vite.config.wordpress.ts` com:
  - `base: '/wp-content/themes/awr-baterias/assets/'`
  - `build.outDir: 'wp-theme/awr-baterias/assets'`
  - `build.rollupOptions.output` com nomes determinísticos pra functions.php encontrar.
- Adicionar script `npm run build:wp`.

### 2. Resolver roteamento SPA dentro do WP
- `functions.php` registra um rewrite catch-all que manda **todas** as URLs não-admin/não-wp para `index.php`.
- `index.php` imprime `<div id="root"></div>` + enqueue do bundle. React Router assume controle no client (mantém `/bateria/:sku`, `/bairro/:slug`, etc).
- Flag de ambiente: bundle detecta `window.__AWR_WP__` pra ajustar base URL se necessário.

### 3. Shortcode `[awr_busca_bateria]`
- Build separado (`vite build --config vite.config.widget.ts`) que exporta só `<VehicleAutocomplete>` montando em `[data-awr-busca]`.
- `functions.php`:
  ```php
  add_shortcode('awr_busca_bateria', function($atts) {
    wp_enqueue_script('awr-busca', get_template_directory_uri().'/widget/awr-busca.js', [], null, true);
    wp_enqueue_style('awr-busca-css', get_template_directory_uri().'/widget/awr-busca.css');
    return '<div data-awr-busca></div>';
  });
  ```
- Ao escolher veículo, redireciona pra `/resultado?...` (mesma rota do React, ou domínio externo se configurado).

### 4. Variáveis de ambiente no WP
- Bundle do React precisa de `VITE_SUPABASE_URL` + `VITE_SUPABASE_PUBLISHABLE_KEY`. Como já estão embutidos no build atual (públicos), vão direto no JS minificado — sem ação extra.
- WooCommerce continua sendo consultado via Edge Function `wc-products` (não muda).

### 5. SEO
- Como é SPA, **Helmet renderiza tags no client** — bom pro Google moderno mas não pra todos os crawlers.
- Solução incluída no plano:
  - **Página inicial**: `header.php` injeta `<title>`, `<meta description>`, OG tags e JSON-LD `LocalBusiness` direto em PHP (server-side), usando os mesmos dados de `src/lib/seoSchemas.ts` portados pra um `inc/seo.php`.
  - **Bairros/Cidades/Marcas/Amperagens**: gerar em build-time um arquivo `inc/seo-routes.php` com mapa `slug → {title, description, jsonLd}` extraído de `src/data/neighborhoodContent.ts`, `cityContent.ts`, `brandContent.ts`, `amperageContent.ts`. `header.php` consulta esse mapa pela URL atual e imprime as tags antes do React montar.
  - **Blog**: idem, mapa gerado de `src/data/blogPosts.ts`.
  - `sitemap.xml` e `robots.txt` atuais ficam em `public/` e são copiados pra raiz do tema; functions.php expõe via rewrite.

### 6. Checkout WhatsApp
- Componente `CheckoutDialog` já chama Edge Functions Supabase (`send-whatsapp-order`, `wc-create-order`). Continua funcionando dentro do bundle React — nenhuma adaptação necessária.

### 7. Empacotamento
- Script `scripts/build-wp-theme.sh`:
  1. `npm run build:wp`
  2. `npm run build:widget`
  3. Copia `public/_headers`, `robots.txt`, `sitemap.xml`, `placeholder.svg`, OG image.
  4. Gera `inc/seo-routes.php` lendo os arquivos de `src/data/*`.
  5. `zip -r wp-theme/awr-baterias.zip wp-theme/awr-baterias`.

## Limitações conhecidas (avisar o usuário)
- **Não é um tema PHP "nativo"**: editar conteúdo de bairros/cidades pelo painel do WP **não** funciona — esses textos vivem em `src/data/*.ts` e exigem novo build do tema.
- **WooCommerce do WP destino não é usado** pra produtos da busca: o bundle continua consumindo a loja WooCommerce atual via Edge Function. Se o WP destino for a própria loja, dá pra apontar a Edge Function pra ela (mesma API).
- **Renderização server-side parcial**: SEO tags principais são server-side (PHP), mas conteúdo HTML completo continua client-side. Suficiente pro Google, limitado pra crawlers antigos.
- Requer WordPress ≥ 6.0, PHP ≥ 8.0, permalinks "Nome do post".

## Arquivos novos (no repositório atual)
- `vite.config.wordpress.ts`
- `vite.config.widget.ts`
- `src/widget/main.tsx` (entry só do `<VehicleAutocomplete>`)
- `wp-theme/awr-baterias/{style.css, functions.php, index.php, front-page.php, header.php, footer.php, 404.php}`
- `wp-theme/awr-baterias/inc/{seo.php, seo-routes.php (gerado)}`
- `scripts/build-wp-theme.sh`
- `scripts/generate-seo-routes.mjs` (lê `src/data/*` e emite PHP)
- `wp-theme/README-INSTALACAO.md`

## Arquivos alterados
- `package.json` — adicionar scripts `build:wp`, `build:widget`, `build:wp-theme`.

Nenhum arquivo do app React atual é modificado — o site no Lovable continua funcionando igual.
