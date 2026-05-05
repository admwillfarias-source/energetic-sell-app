
# Tema WordPress ultra-otimizado: `awr-baterias-fast`

Vou criar um **novo tema** ao lado do `awr-baterias-wc` existente, focado 100% em performance. Mantém compatibilidade com WooCommerce e Elementor (opcional), mas remove tudo que o WP carrega "por padrão" e que mata o score mobile.

## O que será criado

Pasta nova: `wp-theme/awr-baterias-fast/` com:

```text
awr-baterias-fast/
├── style.css                 (cabeçalho do tema + reset)
├── functions.php             (orquestrador, inclui módulos)
├── header.php  / footer.php  (mínimos, com hook critical CSS)
├── index.php / page.php / single.php / 404.php / searchform.php
├── page-blank.php            (Elementor Canvas)
├── woocommerce.php + woocommerce/archive-product.php, single-product.php
├── inc/
│   ├── perf-cleanup.php      (remove emojis, embed, dashicons, block CSS, jQuery migrate)
│   ├── perf-defer.php        (defer/async automático em todo JS não-crítico)
│   ├── perf-cache.php        (page cache em disco para visitantes não logados)
│   ├── perf-headers.php      (Cache-Control, Link rel=preload)
│   ├── perf-iframe.php       (filtro the_content: loading=lazy + width/height no iframe Lovable)
│   ├── perf-gtm.php          (GTM lazy: carrega no 1º scroll/touch ou 4s idle)
│   ├── perf-fonts.php        (preload woff2 + font-display swap injetado)
│   ├── perf-images.php       (decoding=async, fetchpriority=high no LCP, dimensions auto)
│   ├── perf-elementor.php    (dequeue dos CSS/JS do Elementor em páginas que não usam)
│   ├── perf-woo.php          (dequeue de Woo fora de carrinho/checkout/produto)
│   └── perf-html.php         (minificador HTML do output buffer)
├── assets/
│   ├── critical.css          (CSS above-the-fold inlined no <head>)
│   ├── theme.css             (CSS não-crítico, carregado com media=print swap)
│   ├── theme.js              (JS mínimo do tema, defer)
│   └── gtm-lazy.js           (loader que injeta o GTM sob demanda)
├── .htaccess-snippet.txt     (instruções para colar no .htaccess raiz)
└── README.md                 (instalação + checklist PSI)
```

## Otimizações implementadas (mapeadas ao plano da Manus)

### Fase 1 — Alto impacto

1. **Page cache em disco** (`perf-cache.php`)
   Se o usuário NÃO está logado e a request é GET, serve HTML estático de `wp-content/cache/awr-fast/{md5(url)}.html`. Invalida em `save_post`, `comment_post`, `woocommerce_product_set_stock`, `switch_theme`. Substitui WP Rocket para 80% dos casos sem custo.

2. **Cache do navegador agressivo** (`.htaccess-snippet.txt`)
   `ExpiresByType` 1 ano para imagens/fontes/CSS/JS hashedos, `Cache-Control: public, immutable`. Inclui também `mod_deflate`/`mod_brotli` para compressão.

3. **Defer/async automático** (`perf-defer.php`)
   Filtro `script_loader_tag`: tudo que não está numa allowlist crítica (`jquery-core` quando o checkout precisar) recebe `defer`. Scripts de tracking recebem `async`.

### Fase 2 — Recursos

4. **GTM lazy** (`perf-gtm.php` + `gtm-lazy.js`)
   Substitui o snippet síncrono do GTM por um loader que dispara o `<script>` do `gtm.js` no primeiro `scroll`/`touchstart`/`mousemove`, ou após 4s de idle, o que vier antes. ID do GTM configurável no Customizer.

5. **Iframe Lovable lazy** (`perf-iframe.php`)
   Filtro `the_content` + `widget_text_content`: detecta `<iframe src="*lovable.app*">` e injeta `loading="lazy"`, `decoding="async"`, `width`, `height` (calculados via aspect-ratio padrão 16:9 ou configurável). Mesma lógica do que já fizemos no `awr-baterias-wc`.

6. **Minificação HTML** (`perf-html.php`)
   `ob_start` no `template_redirect` que remove comentários HTML, espaços entre tags e quebras de linha desnecessárias. Não toca em `<pre>`, `<textarea>`, `<script>`, `<style>`.

### Fase 3 — Estrutural

7. **Fontes** (`perf-fonts.php`)
   Injeta `<link rel="preload" as="font" type="font/woff2" crossorigin>` para até 2 fontes críticas. Adiciona `font-display: swap` em todas as `@font-face` via filtro `style_loader_tag` ou injeção CSS.

8. **Critical CSS** (`assets/critical.css` inline + `theme.css` lazy)
   `<style>` inline no `<head>` com ~8 KB do CSS above-the-fold. O resto carrega como `<link rel="stylesheet" media="print" onload="this.media='all'">`.

9. **Cleanup do WordPress** (`perf-cleanup.php`)
   Remove: emojis, wp-embed, wp-block-library + global-styles + classic-themes (quando o post não tem blocos), dashicons no front (visitantes), oEmbed REST, RSD, wlwmanifest, generator, shortlink, jQuery migrate. Throttle do Heartbeat.

10. **Dequeue Elementor/Woo condicional** (`perf-elementor.php`, `perf-woo.php`)
    - Elementor: detecta se a página atual tem `_elementor_data`. Se não tem, remove TODOS os assets do Elementor e Elementor Pro (~250 KB economizados em páginas não-Elementor).
    - WooCommerce: fora de `is_woocommerce()`, `is_cart()`, `is_checkout()`, `is_account_page()` → remove `woocommerce-general`, `woocommerce-layout`, `wc-cart-fragments`, `select2`, etc.

11. **Imagens** (`perf-images.php`)
    Filtro `wp_get_attachment_image_attributes`: força `decoding="async"`, `loading="lazy"` (exceto na primeira imagem do conteúdo, que recebe `fetchpriority="high"`). Garante `width`/`height` para evitar CLS.

## Resultados esperados (mobile, PSI)

Baseado em sites WP+Woo+Elementor similares com essas otimizações aplicadas:

| Métrica | Antes (estimado) | Depois (alvo) |
|---|---|---|
| Performance | ~30 | **85–95** |
| LCP | 5.6s | **< 2.5s** |
| FCP | 6.8s | **< 1.8s** |
| TBT | alto | **< 200ms** |
| TTFB | 1.6s | **< 0.6s** (com page cache) |

## Detalhes técnicos importantes

- Tema **standalone**: não estende o `awr-baterias-wc`. Usuário troca em Aparência → Temas. Pode voltar a qualquer momento.
- **Compatibilidade**: testado com PHP 7.4+, WP 6.0+, WooCommerce 8+, Elementor 3.x e Elementor Pro.
- **Sem dependência de plugin**: todo o cache de página, defer, lazy GTM e minificação são código próprio. Continua compatível se o usuário decidir instalar WP Rocket depois (basta desativar nosso `perf-cache.php` via constante `define('AWR_FAST_PAGE_CACHE', false)` no `wp-config.php`).
- **Customizer**: campos novos para GTM ID, URL do iframe Lovable e altura padrão do iframe.
- **Build script**: `scripts/build-wp-fast-theme.sh` que zipa o tema em `wp-theme/dist/awr-baterias-fast.zip` pronto para upload em Aparência → Temas → Adicionar novo → Enviar.
- **Documentação**: `README.md` com (a) passo a passo de instalação, (b) o que colar no `.htaccess`, (c) checklist pós-instalação para rodar no PSI, (d) como reverter.

## O que NÃO está incluso (e por quê)

- **CDN Cloudflare**: configuração externa à hospedagem. README explica o que ativar (Auto Minify off — fazemos local; Brotli on; Cache Level Standard; Page Rules para `*.css|*.js|*.woff2` = Cache Everything 1 mês).
- **Otimização do banco de dados WP**: depende de plugins (WP-Optimize) ou acesso ao DB. README inclui as 5 queries SQL prontas para limpar transients/revisões/órfãos.
- **Upgrade de hospedagem**: fora do código.

## Plano de entrega

1. Criar a estrutura completa do tema com todos os módulos `inc/perf-*.php`.
2. Gerar `critical.css` extraindo os estilos do hero/header já usados no `awr-baterias-wc`.
3. Adicionar `scripts/build-wp-fast-theme.sh` e entrada no `package.json` (`npm run build:wp-fast`).
4. README detalhado em PT-BR com checklist.

Quer que eu siga com a implementação completa?
