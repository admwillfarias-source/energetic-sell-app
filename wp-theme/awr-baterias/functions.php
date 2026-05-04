<?php
/**
 * AWR Baterias — tema WordPress headless.
 * Compatível com WordPress >= 5.0 e PHP >= 7.0.
 * Usa apenas funções nomeadas (sem closures) para evitar problemas
 * de parsing em hospedagens com OPcache antigo.
 */

if ( ! defined( 'ABSPATH' ) ) { exit; }

if ( ! defined( 'AWR_THEME_VERSION' ) ) { define( 'AWR_THEME_VERSION', '1.0.2' ); }
if ( ! defined( 'AWR_THEME_DIR' ) )     { define( 'AWR_THEME_DIR', get_template_directory() ); }
if ( ! defined( 'AWR_THEME_URI' ) )     { define( 'AWR_THEME_URI', get_template_directory_uri() ); }

require_once AWR_THEME_DIR . '/inc/seo.php';
if ( file_exists( AWR_THEME_DIR . '/inc/seo-routes.php' ) ) {
    require_once AWR_THEME_DIR . '/inc/seo-routes.php';
}

/* 1. Setup básico ---------------------------------------------------------- */
function awr_setup() {
    add_theme_support( 'title-tag' );
    add_theme_support( 'post-thumbnails' );
    add_theme_support( 'html5', array( 'search-form', 'gallery', 'caption', 'style', 'script' ) );
}
add_action( 'after_setup_theme', 'awr_setup' );

/* 2. Enqueue do bundle React ---------------------------------------------- */
/**
 * Versão única por arquivo (filemtime) — força navegador/CDN a baixar
 * o asset novo sempre que o build é regenerado, mesmo sem bump manual de
 * AWR_THEME_VERSION. Fallback para AWR_THEME_VERSION se filemtime falhar.
 */
function awr_asset_ver( $relative_path ) {
    $full = AWR_THEME_DIR . '/' . ltrim( $relative_path, '/' );
    if ( file_exists( $full ) ) {
        $mt = @filemtime( $full );
        if ( $mt ) { return AWR_THEME_VERSION . '.' . $mt; }
    }
    return AWR_THEME_VERSION;
}

/**
 * Remove handles antigos de versões anteriores que possam ter ficado
 * registrados por plugins de cache ou page-builders.
 */
function awr_dequeue_legacy() {
    $legacy = array(
        'awr-baterias', 'awr-baterias-app', 'awr-react', 'awr-bundle',
        'awr-app-v1', 'awr-app-v2', 'awr-app-v3', 'awr-app-v4',
        'awr-app-v5', 'awr-app-v6',
    );
    foreach ( $legacy as $h ) {
        if ( wp_script_is( $h, 'enqueued' ) || wp_script_is( $h, 'registered' ) ) {
            wp_dequeue_script( $h ); wp_deregister_script( $h );
        }
        if ( wp_style_is( $h, 'enqueued' ) || wp_style_is( $h, 'registered' ) ) {
            wp_dequeue_style( $h ); wp_deregister_style( $h );
        }
    }
}

function awr_enqueue_assets() {
    awr_dequeue_legacy();

    $css_rel = 'assets/app.css';
    $js_rel  = 'assets/app.js';
    $css     = AWR_THEME_DIR . '/' . $css_rel;
    $js      = AWR_THEME_DIR . '/' . $js_rel;

    if ( file_exists( $css ) ) {
        wp_enqueue_style( 'awr-app', AWR_THEME_URI . '/' . $css_rel, array(), awr_asset_ver( $css_rel ) );
    }
    if ( file_exists( $js ) ) {
        wp_enqueue_script( 'awr-app', AWR_THEME_URI . '/' . $js_rel, array(), awr_asset_ver( $js_rel ), true );
        wp_add_inline_script( 'awr-app',
            'window.__AWR_WP__=true;window.AWR_WP_HOME=' . wp_json_encode( home_url( '/' ) ) . ';' .
            // Stub mínimo para evitar "elementorFrontendConfig is not defined" quando
            // scripts órfãos do Elementor sobrevivem em caches/banco sem o plugin ativo.
            'window.elementorFrontendConfig=window.elementorFrontendConfig||{environmentMode:{edit:false,wpPreview:false,isScriptDebug:false},i18n:{},is_rtl:false,breakpoints:{xs:0,sm:480,md:768,lg:1025,xl:1440,xxl:1600},version:"0",urls:{assets:""},settings:{page:{},editorPreferences:{}},kit:{},post:{id:0,title:"",excerpt:"",featuredImage:false}};' .
            'window.elementorFrontend=window.elementorFrontend||{config:window.elementorFrontendConfig,hooks:{addAction:function(){},addFilter:function(){},doAction:function(){},applyFilters:function(a,b){return b;}},elements:{},isEditMode:function(){return false;}};',
            'before'
        );
    }
}
add_action( 'wp_enqueue_scripts', 'awr_enqueue_assets', 20 );

/**
 * Remove scripts/estilos do Elementor (e variantes) quando o plugin
 * não estiver ativo. Resolve "elementorFrontendConfig is not defined"
 * causado por handles órfãos.
 */
function awr_remove_elementor_if_inactive() {
    if ( did_action( 'elementor/loaded' ) || class_exists( 'Elementor\\Plugin' ) ) { return; }
    $orphans = array(
        'elementor-frontend', 'elementor-frontend-modules', 'elementor-pro-frontend',
        'elementor-common', 'elementor-webpack-runtime', 'elementor-app-loader',
        'elementor-icons', 'elementor-animations', 'elementor-pro',
    );
    foreach ( $orphans as $h ) {
        if ( wp_script_is( $h, 'enqueued' ) || wp_script_is( $h, 'registered' ) ) {
            wp_dequeue_script( $h ); wp_deregister_script( $h );
        }
        if ( wp_style_is( $h, 'enqueued' ) || wp_style_is( $h, 'registered' ) ) {
            wp_dequeue_style( $h ); wp_deregister_style( $h );
        }
    }
}
add_action( 'wp_enqueue_scripts', 'awr_remove_elementor_if_inactive', 9999 );
add_action( 'wp_print_scripts',   'awr_remove_elementor_if_inactive', 9999 );

/* Adiciona type="module" ao bundle (necessário para ESM gerado pelo Vite). */
function awr_module_script_tag( $tag, $handle ) {
    if ( $handle === 'awr-app' || $handle === 'awr-busca' ) {
        if ( strpos( $tag, 'type="module"' ) === false ) {
            $tag = str_replace( '<script ', '<script type="module" ', $tag );
        }
    }
    return $tag;
}
add_filter( 'script_loader_tag', 'awr_module_script_tag', 10, 2 );

/* 3. Catch-all: toda URL não administrativa renderiza index.php ----------- */
function awr_add_rewrite() {
    add_rewrite_rule( '^(.+)/?$', 'index.php?awr_spa=1', 'top' );
}
add_action( 'init', 'awr_add_rewrite' );

function awr_query_vars( $vars ) {
    $vars[] = 'awr_spa';
    return $vars;
}
add_filter( 'query_vars', 'awr_query_vars' );

function awr_template_include( $template ) {
    if ( is_admin() || ( defined( 'REST_REQUEST' ) && REST_REQUEST ) ) {
        return $template;
    }
    $uri = isset( $_SERVER['REQUEST_URI'] ) ? $_SERVER['REQUEST_URI'] : '/';
    $req = parse_url( $uri, PHP_URL_PATH );
    if ( ! is_string( $req ) ) { $req = '/'; }
    if ( preg_match( '#^/(wp-admin|wp-login|wp-json|wp-content|wp-includes|wp-cron|xmlrpc|sitemap|robots\.txt|favicon\.ico)#', $req ) ) {
        return $template;
    }
    return AWR_THEME_DIR . '/index.php';
}
add_filter( 'template_include', 'awr_template_include', 99 );

/* Flush rewrites na ativação/troca do tema. */
function awr_after_switch_theme() {
    awr_add_rewrite();
    flush_rewrite_rules();
}
add_action( 'after_switch_theme', 'awr_after_switch_theme' );

/* 4. Shortcode [awr_busca_bateria] ---------------------------------------- */
function awr_shortcode_busca( $atts ) {
    $atts = shortcode_atts( array( 'site_url' => '' ), $atts, 'awr_busca_bateria' );

    wp_enqueue_style( 'awr-busca', AWR_THEME_URI . '/widget/awr-busca.css', array(), awr_asset_ver( 'widget/awr-busca.css' ) );
    wp_enqueue_script( 'awr-busca', AWR_THEME_URI . '/widget/awr-busca.js', array(), awr_asset_ver( 'widget/awr-busca.js' ), true );

    if ( ! empty( $atts['site_url'] ) ) {
        wp_add_inline_script( 'awr-busca',
            'window.AWR_SITE_URL=' . wp_json_encode( esc_url_raw( $atts['site_url'] ) ) . ';',
            'before'
        );
    }

    $site_attr = ! empty( $atts['site_url'] ) ? ' data-site-url="' . esc_attr( $atts['site_url'] ) . '"' : '';
    return '<div data-awr-busca' . $site_attr . '></div>';
}
add_shortcode( 'awr_busca_bateria', 'awr_shortcode_busca' );

/* 5. SEO server-side ------------------------------------------------------ */
add_action( 'wp_head', 'awr_print_seo_tags', 1 );
