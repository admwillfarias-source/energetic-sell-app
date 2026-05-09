<?php
/**
 * AWR Baterias Fast — orquestrador.
 *
 * Cada módulo de performance vive em inc/perf-*.php e pode ser desligado
 * individualmente via constante no wp-config.php. Ex.:
 *   define( 'AWR_FAST_PAGE_CACHE', false );
 *   define( 'AWR_FAST_HTML_MIN', false );
 *   define( 'AWR_FAST_DEFER', false );
 *   define( 'AWR_FAST_GTM_LAZY', false );
 */

if ( ! defined( 'ABSPATH' ) ) { exit; }

if ( ! defined( 'AWRF_VERSION' ) ) { define( 'AWRF_VERSION', '1.0.0' ); }
if ( ! defined( 'AWRF_DIR' ) )     { define( 'AWRF_DIR', get_template_directory() ); }
if ( ! defined( 'AWRF_URI' ) )     { define( 'AWRF_URI', get_template_directory_uri() ); }

/* Defaults: todos os módulos ON, exceto se o wp-config sobrescrever. */
foreach ( array(
    'AWR_FAST_PAGE_CACHE'    => true,
    'AWR_FAST_HTML_MIN'      => true,
    'AWR_FAST_DEFER'         => true,
    'AWR_FAST_GTM_LAZY'      => true,
    'AWR_FAST_IFRAME_LAZY'   => true,
    'AWR_FAST_FONT_OPT'      => true,
    'AWR_FAST_IMG_OPT'       => true,
    'AWR_FAST_CLEANUP'       => true,
    'AWR_FAST_DEQ_ELEMENTOR' => true,
    'AWR_FAST_DEQ_WOO'       => true,
    'AWR_FAST_HEADERS'       => true,
) as $k => $v ) {
    if ( ! defined( $k ) ) { define( $k, $v ); }
}

/* ---------- Setup do tema ---------- */
function awrf_setup() {
    // Não usamos 'title-tag': awr_print_seo_tags() emite o <title> próprio
    // a partir do mapa de rotas SEO compartilhado com o app React.
    add_theme_support( 'post-thumbnails' );
    add_theme_support( 'automatic-feed-links' );
    add_theme_support( 'responsive-embeds' );
    add_theme_support( 'html5', array( 'search-form', 'comment-form', 'comment-list', 'gallery', 'caption', 'style', 'script' ) );
    add_theme_support( 'custom-logo', array( 'height' => 80, 'width' => 240, 'flex-height' => true, 'flex-width' => true ) );

    if ( class_exists( 'WooCommerce' ) ) {
        add_theme_support( 'woocommerce' );
        add_theme_support( 'wc-product-gallery-zoom' );
        add_theme_support( 'wc-product-gallery-lightbox' );
        add_theme_support( 'wc-product-gallery-slider' );
    }
    add_theme_support( 'elementor' );

    register_nav_menus( array(
        'primary' => __( 'Menu principal', 'awr-baterias-fast' ),
        'footer'  => __( 'Menu rodapé',  'awr-baterias-fast' ),
    ) );
}
add_action( 'after_setup_theme', 'awrf_setup' );

function awrf_widgets_init() {
    for ( $i = 1; $i <= 3; $i++ ) {
        register_sidebar( array(
            'name'          => sprintf( 'Rodapé %d', $i ),
            'id'            => 'footer-' . $i,
            'before_widget' => '<section id="%1$s" class="widget %2$s">',
            'after_widget'  => '</section>',
            'before_title'  => '<h3 class="widget-title">',
            'after_title'   => '</h3>',
        ) );
    }
}
add_action( 'widgets_init', 'awrf_widgets_init' );

/* ---------- Util: cache-busting ---------- */
function awrf_ver( $rel ) {
    $f = AWRF_DIR . '/' . ltrim( $rel, '/' );
    if ( file_exists( $f ) ) { $m = @filemtime( $f ); if ( $m ) return AWRF_VERSION . '.' . $m; }
    return AWRF_VERSION;
}

/* ---------- Customizer ---------- */
function awrf_customize_register( $wp_customize ) {
    $wp_customize->add_section( 'awrf_perf', array(
        'title'    => 'AWR Fast — Performance',
        'priority' => 30,
    ) );

    $fields = array(
        'awrf_gtm_id'        => array( 'GTM ID (ex.: GTM-XXXXX)', '', 'sanitize_text_field' ),
        'awrf_lovable_url'   => array( 'URL do iframe Lovable', 'https://energetic-sell-app.lovable.app', 'esc_url_raw' ),
        'awrf_iframe_height' => array( 'Altura padrão do iframe (px)', '900', 'absint' ),
        'awrf_preload_font1' => array( 'Preload Font 1 (URL .woff2)', '', 'esc_url_raw' ),
        'awrf_preload_font2' => array( 'Preload Font 2 (URL .woff2)', '', 'esc_url_raw' ),
        'awrf_phone'         => array( 'Telefone exibido no header', '(51) 99319-9486', 'sanitize_text_field' ),
        'awrf_whatsapp'      => array( 'WhatsApp (com DDI, só números)', '5551993199486', 'sanitize_text_field' ),
    );
    foreach ( $fields as $id => $cfg ) {
        $wp_customize->add_setting( $id, array( 'default' => $cfg[1], 'sanitize_callback' => $cfg[2] ) );
        $wp_customize->add_control( $id, array( 'label' => $cfg[0], 'section' => 'awrf_perf', 'type' => 'text' ) );
    }
}
add_action( 'customize_register', 'awrf_customize_register' );

function awrf_phone()    { return get_theme_mod( 'awrf_phone',    '(51) 99319-9486' ); }
function awrf_whatsapp() { return preg_replace( '/\D/', '', get_theme_mod( 'awrf_whatsapp', '5551993199486' ) ); }
function awrf_whatsapp_url( $msg = '' ) { $b = 'https://wa.me/' . awrf_whatsapp(); return $msg ? $b . '?text=' . rawurlencode( $msg ) : $b; }

/* ---------- Enqueue: critical CSS inline + theme.css lazy + theme.js defer ---------- */
function awrf_enqueue() {
    // CSS não-crítico, carregado de forma assíncrona (preload + onload swap).
    wp_enqueue_style( 'awrf-theme', AWRF_URI . '/assets/theme.css', array(), awrf_ver( 'assets/theme.css' ), 'all' );
    // theme.js (defer aplicado pelo perf-defer).
    wp_enqueue_script( 'awrf-theme', AWRF_URI . '/assets/theme.js', array(), awrf_ver( 'assets/theme.js' ), true );
}
add_action( 'wp_enqueue_scripts', 'awrf_enqueue', 20 );

/* Critical CSS inline + carregamento async do theme.css. */
function awrf_inline_critical_css() {
    $crit = AWRF_DIR . '/assets/critical.css';
    if ( file_exists( $crit ) ) {
        echo "<style id=\"awrf-critical\">" . file_get_contents( $crit ) . "</style>\n";
    }
}
add_action( 'wp_head', 'awrf_inline_critical_css', 1 );

/* Carrega theme.css com media=print + onload swap (não bloqueia render). */
function awrf_async_css( $html, $handle ) {
    if ( $handle === 'awrf-theme' ) {
        $html = str_replace( "rel='stylesheet'", "rel='stylesheet' media='print' onload=\"this.media='all'\"", $html );
        $html = str_replace( 'rel="stylesheet"', 'rel="stylesheet" media="print" onload="this.media=\'all\'"', $html );
        $html .= '<noscript><link rel="stylesheet" href="' . esc_url( AWRF_URI . '/assets/theme.css?v=' . awrf_ver( 'assets/theme.css' ) ) . '"></noscript>';
    }
    return $html;
}
add_filter( 'style_loader_tag', 'awrf_async_css', 10, 2 );

/* ---------- Carrega módulos de performance ---------- */
require_once AWRF_DIR . '/inc/perf-cleanup.php';
require_once AWRF_DIR . '/inc/perf-defer.php';
require_once AWRF_DIR . '/inc/perf-cache.php';
require_once AWRF_DIR . '/inc/perf-headers.php';
require_once AWRF_DIR . '/inc/perf-iframe.php';
require_once AWRF_DIR . '/inc/perf-app-iframe.php';
require_once AWRF_DIR . '/inc/perf-gtm.php';
require_once AWRF_DIR . '/inc/perf-fonts.php';
require_once AWRF_DIR . '/inc/perf-images.php';
require_once AWRF_DIR . '/inc/perf-elementor.php';
require_once AWRF_DIR . '/inc/perf-woo.php';
require_once AWRF_DIR . '/inc/perf-html.php';

/* ---------- SEO server-side (mapa compartilhado com o app React) ---------- */
if ( file_exists( AWRF_DIR . '/inc/seo-routes.php' ) ) {
    require_once AWRF_DIR . '/inc/seo-routes.php';
}
require_once AWRF_DIR . '/inc/seo.php';
add_action( 'wp_head', 'awr_print_seo_tags', 1 );

/* Evita conflito com Yoast/RankMath nas páginas que servem o app. */
add_filter( 'wpseo_title',          '__return_false' );
add_filter( 'wpseo_metadesc',       '__return_false' );
add_filter( 'rank_math/frontend/title',       '__return_false' );
add_filter( 'rank_math/frontend/description', '__return_false' );

/* Elementor — registra Locations para Theme Builder. */
function awrf_register_elementor_locations( $mgr ) { $mgr->register_all_core_location(); }
add_action( 'elementor/theme/register_locations', 'awrf_register_elementor_locations' );

/* Templates de página customizados. */
function awrf_register_page_templates( $t ) {
    $t['page-blank.php'] = 'Em branco (Elementor Canvas)';
    return $t;
}
add_filter( 'theme_page_templates', 'awrf_register_page_templates' );

/* Invalida nosso page cache em mudanças de conteúdo. */
function awrf_flush_cache_hooks() {
    if ( function_exists( 'awrf_cache_clear_all' ) ) { awrf_cache_clear_all(); }
}
add_action( 'switch_theme',                'awrf_flush_cache_hooks' );
add_action( 'save_post',                   'awrf_flush_cache_hooks' );
add_action( 'comment_post',                'awrf_flush_cache_hooks' );
add_action( 'wp_set_comment_status',       'awrf_flush_cache_hooks' );
add_action( 'edited_term',                 'awrf_flush_cache_hooks' );
add_action( 'woocommerce_product_set_stock','awrf_flush_cache_hooks' );
