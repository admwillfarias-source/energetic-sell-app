<?php
/**
 * AWR Baterias — tema WordPress headless.
 * Compatível com WordPress >= 5.0 e PHP >= 7.0.
 * Usa apenas funções nomeadas (sem closures) para evitar problemas
 * de parsing em hospedagens com OPcache antigo.
 */

if ( ! defined( 'ABSPATH' ) ) { exit; }

if ( ! defined( 'AWR_THEME_VERSION' ) ) { define( 'AWR_THEME_VERSION', '1.0.1' ); }
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
function awr_enqueue_assets() {
    $css = AWR_THEME_DIR . '/assets/app.css';
    $js  = AWR_THEME_DIR . '/assets/app.js';

    if ( file_exists( $css ) ) {
        wp_enqueue_style( 'awr-app', AWR_THEME_URI . '/assets/app.css', array(), AWR_THEME_VERSION );
    }
    if ( file_exists( $js ) ) {
        wp_enqueue_script( 'awr-app', AWR_THEME_URI . '/assets/app.js', array(), AWR_THEME_VERSION, true );
        wp_add_inline_script( 'awr-app',
            'window.__AWR_WP__=true;window.AWR_WP_HOME=' . wp_json_encode( home_url( '/' ) ) . ';',
            'before'
        );
    }
}
add_action( 'wp_enqueue_scripts', 'awr_enqueue_assets', 20 );

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

    wp_enqueue_style( 'awr-busca', AWR_THEME_URI . '/widget/awr-busca.css', array(), AWR_THEME_VERSION );
    wp_enqueue_script( 'awr-busca', AWR_THEME_URI . '/widget/awr-busca.js', array(), AWR_THEME_VERSION, true );

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
