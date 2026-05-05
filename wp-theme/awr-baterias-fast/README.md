# AWR Baterias Fast — tema WordPress ultra-otimizado

Tema WordPress focado em Core Web Vitals. Alvo: **PSI mobile 90+**.

## O que faz

- **Page cache em disco** para visitantes não logados (substitui WP Rocket em ~80% dos casos)
- **Defer/async automático** em todo JS não crítico
- **GTM lazy**: só carrega o `gtm.js` após scroll/touch ou 4s idle
- **Iframe lazy**: aplica `loading=lazy`, `decoding=async`, `width`/`height` em iframes do Lovable e qualquer iframe do conteúdo
- **Critical CSS inline** + CSS principal carregado em modo assíncrono (`media=print` swap)
- **Minificação HTML** do output buffer (sem plugin)
- **Cleanup**: remove emojis, wp-embed, dashicons no front, jQuery migrate, generator, oEmbed, Block Library quando não usado
- **Dequeue condicional** dos assets do Elementor e WooCommerce em páginas que não usam (~400 KB economizados)
- **Headers HTTP** corretos (`Cache-Control`, dns-prefetch, preconnect)
- **Imagens**: `decoding=async` em tudo, `fetchpriority=high` na primeira imagem do conteúdo (LCP)
- **Fontes**: preload de até 2 woff2 + `font-display=swap` automático em Google Fonts

## Instalação

### 1. Subir o tema

**Opção A — pelo painel:**
1. Em `wp-theme/awr-baterias-fast/`, gere um zip:
   ```bash
   cd wp-theme && zip -r awr-baterias-fast.zip awr-baterias-fast
   ```
   ou rode `npm run build:wp-fast` (gera em `wp-theme/dist/`).
2. WordPress → **Aparência → Temas → Adicionar novo → Enviar tema** → escolha o zip.
3. **Ative**.

**Opção B — via FTP/SSH:**
Suba a pasta `awr-baterias-fast/` para `wp-content/themes/` e ative em Aparência → Temas.

### 2. Configurar Customizer

WordPress → **Aparência → Personalizar → AWR Fast — Performance**:

- **GTM ID**: `GTM-XXXXX` (deixe vazio se não usa)
- **URL do iframe Lovable**: `https://energetic-sell-app.lovable.app`
- **Altura padrão do iframe (px)**: `900`
- **Preload Font 1/2 (URL .woff2)**: opcional, URLs absolutas das suas fontes mais usadas
- **Telefone / WhatsApp**: como aparecem no header

### 3. Colar o snippet do .htaccess

Abra o `.htaccess` da raiz do WordPress e cole o conteúdo de `.htaccess-snippet.txt` **antes** do bloco `# BEGIN WordPress`. Salve.

> Em Nginx, peça ao admin do servidor para traduzir as diretivas (cache + compressão).

### 4. Cloudflare (recomendado)

Em Cloudflare → seu domínio:
- **Speed → Optimization**: Brotli **ON**, Auto Minify **OFF** (já minificamos no servidor), Rocket Loader **OFF** (causa conflito com nosso defer).
- **Caching → Configuration**: Browser Cache TTL = `Respect Existing Headers`, Cache Level = `Standard`.
- **Caching → Page Rules**:
  - `*awrbaterias.com.br/wp-content/uploads/*` → Cache Level: Cache Everything, Edge TTL: 1 month.
  - `*awrbaterias.com.br/wp-content/themes/awr-baterias-fast/assets/*` → Cache Level: Cache Everything, Edge TTL: 1 year.

### 5. Testar

Após ativar:

1. Limpe o cache do site (Ferramentas → AWR Fast — limpar cache, ou apague `wp-content/cache/awr-fast/*.html`).
2. Abra a home em uma aba anônima → veja o header de resposta `X-AWRF-Cache: HIT` na 2ª request.
3. Rode no PageSpeed Insights: <https://pagespeed.web.dev/?url=https%3A%2F%2Fawrbaterias.com.br>
4. Compare com o baseline (mobile 30 → alvo 85+).

## Desligar módulos individualmente

No `wp-config.php`, antes do `/* That's all, stop editing! */`:

```php
define( 'AWR_FAST_PAGE_CACHE',    false ); // se já usar WP Rocket
define( 'AWR_FAST_HTML_MIN',      false ); // se notar quebra de layout
define( 'AWR_FAST_DEFER',         false ); // se um plugin quebrar
define( 'AWR_FAST_GTM_LAZY',      false ); // se GTM precisar carregar imediato
define( 'AWR_FAST_IFRAME_LAZY',   false );
define( 'AWR_FAST_FONT_OPT',      false );
define( 'AWR_FAST_IMG_OPT',       false );
define( 'AWR_FAST_CLEANUP',       false );
define( 'AWR_FAST_DEQ_ELEMENTOR', false );
define( 'AWR_FAST_DEQ_WOO',       false );
define( 'AWR_FAST_HEADERS',       false );
```

## Limpeza opcional do banco (faça backup antes!)

```sql
-- Remove revisões de posts
DELETE FROM wp_posts WHERE post_type = 'revision';

-- Remove transients expirados
DELETE FROM wp_options WHERE option_name LIKE '\_transient\_%' AND option_value < UNIX_TIMESTAMP();
DELETE FROM wp_options WHERE option_name LIKE '\_site\_transient\_%';

-- Remove postmeta órfão
DELETE pm FROM wp_postmeta pm LEFT JOIN wp_posts p ON p.ID = pm.post_id WHERE p.ID IS NULL;

-- Remove relacionamentos órfãos
DELETE tr FROM wp_term_relationships tr LEFT JOIN wp_posts p ON p.ID = tr.object_id WHERE p.ID IS NULL;

-- Otimiza tabelas
OPTIMIZE TABLE wp_posts, wp_postmeta, wp_options, wp_term_relationships;
```

## Reverter

Aparência → Temas → ative qualquer outro tema (`awr-baterias-wc` ou um padrão). O tema Fast pode ficar instalado sem efeito.

## Compatibilidade

- WordPress ≥ 6.0
- PHP ≥ 7.4 (testado até 8.3)
- WooCommerce ≥ 8.0
- Elementor 3.x + Elementor Pro

## Suporte

Logs do page cache: cada hit/miss vai como header `X-AWRF-Cache`. Para depurar, abra DevTools → Network → veja a primeira request HTML.
