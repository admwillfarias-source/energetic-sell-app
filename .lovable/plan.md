## Objetivo
Fazer com que a página WordPress que hospeda o `[awr_app]` use o mesmo SEO definido no app React (title, description, canonical, OG/Twitter, JSON-LD), tanto no carregamento inicial (server-side, indexável) quanto durante navegação interna do iframe (postMessage).

## Por que duas camadas
- **Server-side é o que o Google indexa.** O conteúdo do iframe e o `<title>` que o React define com Helmet ficam dentro de um documento separado (o app), não na página WP. Sem injeção server-side, o Google indexa as meta tags do WP/Elementor, não as do app.
- **Postmessage é UX/compartilhamento.** Quando o usuário navega dentro do iframe (ex: clica numa cidade e vai para `/baterias/porto-alegre`), o título da aba e canonical do WP precisam refletir isso para botão "compartilhar" e histórico do navegador.

---

## Camada 1 — SEO server-side no tema fast (indexação)

O tema `awr-baterias` já tem `inc/seo.php` + `inc/seo-routes.php` (gerado por `scripts/generate-seo-routes.ts`) com o mapa `path → {title, description, jsonLd}`. Vamos reutilizar nesse tema fast.

Passos:
1. **Copiar** `wp-theme/awr-baterias/inc/seo.php` para `wp-theme/awr-baterias-fast/inc/seo.php`.
2. **Adaptar `generate-seo-routes.ts`** para também gerar `wp-theme/awr-baterias-fast/inc/seo-routes.php` (mesmo conteúdo, segundo destino) — ou criar um pequeno include compartilhado.
3. **Wire no `functions.php`** do tema fast:
   - `require_once AWRF_DIR . '/inc/seo-routes.php';`
   - `require_once AWRF_DIR . '/inc/seo.php';`
   - `remove_action('wp_head','_wp_render_title_tag');`
   - `add_action('wp_head','awr_print_seo_tags', 1);`
4. **Resolução de path**: a função `awr_current_path()` já usa `REQUEST_URI`. Como o app React e o WP compartilham o mesmo path (a página WP `/baterias/porto-alegre/` embuta `[awr_app]` que internamente mostra a rota `/baterias/porto-alegre`), o lookup no mapa funciona direto.
5. **Fallback**: se o path WP não existir no mapa, mantém `awr_default_seo()` (home) — comportamento atual já cobre.

## Camada 2 — Sincronização runtime via postMessage (UX)

Quando o usuário navega entre rotas **dentro** do iframe, o `<title>` da aba é o do WP (estático). Para refletir a navegação:

1. **No app React** (`src/components/SEO.tsx`): adicionar um `useEffect` que, quando rodando em iframe, envia ao parent:
   ```js
   parent.postMessage({ type: "awr:seo", title, description, canonical, ogImage }, "*");
   ```
2. **No tema fast** (`inc/perf-app-iframe.php`, dentro do bloco `$resize_js`): adicionar listener para `awr:seo` que atualiza:
   - `document.title`
   - `<meta name="description">` (cria se não existir)
   - `<link rel="canonical">` (cria/atualiza)
   - opcional: `og:title`, `og:description`, `og:url`
3. **Não atualiza JSON-LD via postMessage** — Google ignora alterações pós-load para indexação; o JSON-LD server-side é o que conta.

## Arquivos a editar/criar
- **criar** `wp-theme/awr-baterias-fast/inc/seo.php` (cópia/adaptação do existente)
- **editar** `scripts/generate-seo-routes.ts` para emitir também em `wp-theme/awr-baterias-fast/inc/seo-routes.php`
- **editar** `wp-theme/awr-baterias-fast/functions.php` — `require` dos novos arquivos + remover title tag default + hook `wp_head`
- **editar** `wp-theme/awr-baterias-fast/inc/perf-app-iframe.php` — listener `awr:seo` no JS injetado
- **editar** `src/components/SEO.tsx` — `postMessage` ao parent quando em iframe

## Limitações / observações
- A descoberta SEO pelo Google funciona quando a URL pública do WP corresponde à rota do app (ex.: WP page `/baterias/porto-alegre/` → React mostra Cidade Porto Alegre).
- Se o site WP só tem **uma página** com `[awr_app]` (ex.: `/`) e toda a navegação acontece dentro do iframe, o Google só indexará a home — para múltiplas páginas indexáveis, é preciso criar páginas WP correspondentes (uma por rota SEO) e cada uma com seu `[awr_app]`.
- O `awr_print_seo_tags` substituirá o título padrão; se Yoast/RankMath estiver ativo, conflitará — recomenda-se desativar SEO de plugins nas páginas que servem o app (ou condicionar o hook a apenas essas páginas).
