Você quer mudar a abordagem: em vez do tema headless React atual (que está dando conflito com Elementor e cache), gerar um **tema WordPress nativo, compatível com WooCommerce e Elementor**. Isso resolve definitivamente os erros de `elementorFrontendConfig`, React duplicado e bundles v5/v6 — porque deixamos de injetar um app React e passamos a usar o pipeline padrão do WordPress.

## O que vou gerar

Um novo tema chamado `awr-baterias-wc` em `wp-theme/awr-baterias-wc/`, empacotado como `awr-baterias-wc.zip` para você instalar.

### 1. Base do tema (clássico, compatível Elementor + Woo)

- `style.css` com cabeçalho do tema (Name, Version, Tags: `elementor`, `woocommerce`, `full-width-template`, `custom-colors`, `custom-logo`).
- `functions.php` com:
  - `add_theme_support` para: `title-tag`, `post-thumbnails`, `html5`, `custom-logo`, `responsive-embeds`, `align-wide`, `editor-styles`, `woocommerce`, `wc-product-gallery-zoom`, `wc-product-gallery-lightbox`, `wc-product-gallery-slider`, `elementor`.
  - Registro de menus (`primary`, `footer`).
  - Registro de áreas de widget (sidebar, footer-1..3).
  - Enqueue limpo: apenas `style.css` + `assets/theme.css` + `assets/theme.js` com cache-busting via `filemtime` (sem dependências de React/Vite).
  - `after_setup_theme` carregando suporte a Elementor Pro Locations (`register_elementor_locations`) para header/footer/single/archive.
- `screenshot.png` gerado simples (cores da marca AWR).

### 2. Templates obrigatórios

- `index.php`, `header.php`, `footer.php`, `sidebar.php`, `searchform.php`, `404.php`, `page.php`, `single.php`, `archive.php`, `comments.php`.
- Todos com `wp_head()`/`wp_footer()`, suporte a `body_class()`, e wrappers compatíveis com Elementor (sem markup que conflite com builders).
- `page-blank.php` (template em branco para Elementor "Canvas/Full Width").

### 3. WooCommerce

- `woocommerce.php` declarando suporte e usando `do_action('woocommerce_before_main_content')` / `after_main_content`.
- Pasta `woocommerce/` com overrides mínimos: `archive-product.php`, `single-product.php`, `content-product.php`, `cart/cart.php`, `checkout/form-checkout.php` — apenas estrutura básica que herda os templates do plugin (sem reimplementar).
- Hook removendo wrappers padrão e adicionando os do tema:
  ```php
  remove_action('woocommerce_before_main_content','woocommerce_output_content_wrapper',10);
  remove_action('woocommerce_after_main_content','woocommerce_output_content_wrapper_end',10);
  add_action('woocommerce_before_main_content','awr_wc_wrapper_start',10);
  add_action('woocommerce_after_main_content','awr_wc_wrapper_end',10);
  ```
- Suporte a `wc-product-gallery-*` já no `add_theme_support`.

### 4. Elementor

- Registro de Elementor Locations (header, footer, single, archive, single-product, archive-product) via hook `elementor/theme/register_locations` — assim Elementor Pro pode sobrepor templates do tema sem quebrar.
- `add_theme_support('elementor')`.
- Nenhum stub manual de `elementorFrontendConfig`: agora o próprio Elementor cuida disso porque o tema é clássico.
- CSS mínimo no `theme.css` para tipografia/cores base, sem competir com Elementor.

### 5. Customizer / opções

- Suporte básico de Customizer: cor primária, logo (via `custom-logo`), telefone/WhatsApp para o header.
- Header simples imprimindo logo + menu + CTA WhatsApp quando o usuário não montar header pelo Elementor.

### 6. Limpeza e segurança

- Remover emojis WP, `wp-embed`, `dashicons` no front para visitantes não logados (boa prática + performance).
- Remover handles antigos do tema React (`awr-app`, `awr-busca`, etc.) caso ele ainda esteja registrado em algum cache, com `wp_dequeue_script`/`wp_deregister_script` em `wp_enqueue_scripts` prioridade alta.

### 7. Build/empacotamento

- Script `scripts/build-wc-theme.sh`:
  - Valida sintaxe PHP de todos os `.php`.
  - Gera `wp-theme/awr-baterias-wc.zip` pronto para upload em **Aparência → Temas → Adicionar → Enviar**.
- Sem build de Vite — é um tema puro PHP/CSS/JS.

### 8. README de instalação

`wp-theme/README-WC.md` com:
- Pré-requisitos (WordPress 6.x, PHP 7.4+, plugins WooCommerce e Elementor; Elementor Pro opcional).
- Passo a passo: instalar Woo → instalar Elementor → ativar tema → configurar páginas Woo (`Loja`, `Carrinho`, `Finalizar compra`, `Minha conta`) em **WooCommerce → Definições → Avançado**.
- Como usar Elementor Theme Builder para header/footer/single/archive.

## Pontos a confirmar antes de começar

1. **Posso descontinuar o tema React atual** (`wp-theme/awr-baterias`) ou você quer manter os dois lado a lado e só adicionar o novo `awr-baterias-wc`?
2. Quer que eu **migre o conteúdo do app React** (catálogo, blog, busca por veículo) para shortcodes/blocos Elementor neste novo tema, ou começamos só com o tema base e depois portamos as features?
3. Algum **plugin extra obrigatório** (ex.: Elementor Pro, WPML, Yoast SEO)? Isso muda o que registramos como Locations/integrações.

Se você só responder "pode seguir", eu começo pelo tema base (itens 1–8) sem migrar nada do React e mantenho o tema antigo intacto.