<?php
/**
 * AWR Baterias — tema WordPress headless.
 *
 * Responsabilidades:
 *  1. Enfileirar o bundle React (assets/app.js + app.css) em todas as páginas.
 *  2. Reescrever todas as URLs públicas (exceto /wp-*, /wp-admin/, REST e arquivos)
 *     para servir o template index.php — React Router cuida do resto.
 *  3. Expor o shortcode [awr_busca_bateria].
 *  4. Imprimir SEO server-side (title, meta description, OG, JSON-LD LocalBusiness)
 *     baseado no mapa em inc/seo-routes.php (gerado em build-time).
 */

if ( ! defined( 'ABSPATH' ) ) { exit; }

define( 'AWR_THEME_VERSION', '1.0.0' );
define( 'AWR_THEME_DIR', get_template_directory() );
define( 'AWR_THEME_URI', get_template_directory_uri() );

require_once AWR_THEME_DIR . '/inc/seo.php';
if ( file_exists( AWR_THEME_DIR . '/inc/seo-routes.php' ) ) {
    require_once AWR_THEME_DIR . '/inc/seo-routes.php';
}

/* -------------------------------------------------------------------------
 * 1. Setup básico
 * ------------------------------------------------------------------------- */
add_action( 'after_setup_theme', function () {
    add_theme_support( 'title-tag' );
    add_theme_support( 'post-thumbnails' );
    add_theme_support( 'html5', array( 'search-form', 'gallery', 'caption', 'style', 'script' ) );
} );

/* -------------------------------------------------------------------------
 * 2. Enqueue do bundle React
 * ------------------------------------------------------------------------- */
add_action( 'wp_enqueue_scripts', function () {
    $css = AWR_THEME_DIR . '/assets/app.css';
    $js  = AWR_THEME_DIR . '/assets/app.js';

    if ( file_exists( $css ) ) {
        wp_enqueue_style( 'awr-app', AWR_THEME_URI . '/assets/app.css', array(), AWR_THEME_VERSION );
    }
    if ( file_exists( $js ) ) {
        wp_enqueue_script( 'awr-app', AWR_THEME_URI . '/assets/app.js', array(), AWR_THEME_VERSION, true );
    }

    // Sinaliza ao bundle que está rodando dentro do WordPress.
    wp_add_inline_script( 'awr-app',
        'window.__AWR_WP__ = true; window.AWR_WP_HOME = ' . wp_json_encode( home_url( '/' ) ) . ';',
        'before'
    );
}, 20 );

// Adiciona type="module" ao bundle (necessário para ESM gerado pelo Vite).
add_filter( 'script_loader_tag', function ( $tag, $handle ) {
    if ( in_array( $handle, array( 'awr-app', 'awr-busca' ), true ) ) {
        return str_replace( '<script ', '<script type="module" ', $tag );
    }
    return $tag;
}, 10, 2 );

/* -------------------------------------------------------------------------
 * 3. Catch-all: toda URL não administrativa renderiza index.php
 * ------------------------------------------------------------------------- */
add_action( 'init', function () {
    add_rewrite_rule( '^(.+)/?$', 'index.php?awr_spa=1', 'top' );
} );

add_filter( 'query_vars', function ( $vars ) {
    $vars[] = 'awr_spa';
    return $vars;
} );

add_filter( 'template_include', function ( $template ) {
    // Páginas administrativas, REST, sitemaps e arquivos físicos passam direto.
    if ( is_admin() || ( defined( 'REST_REQUEST' ) && REST_REQUEST ) ) {
        return $template;
    }
    $req = isset( $_SERVER['REQUEST_URI'] ) ? wp_parse_url( $_SERVER['REQUEST_URI'], PHP_URL_PATH ) : '/';
    if ( preg_match( '#^/(wp-admin|wp-login|wp-json|wp-content|wp-includes|sitemap|robots\.txt|favicon\.ico)#', $req ) ) {
        return $template;
    }
    // Sempre serve o index.php do tema (React Router resolve a rota no client).
    return AWR_THEME_DIR . '/index.php';
}, 99 );

/* -------------------------------------------------------------------------
 * 4. Shortcode [awr_busca_bateria]
 *    Uso: [awr_busca_bateria site_url="https://awrbaterias.com.br"]
 * ------------------------------------------------------------------------- */
add_shortcode( 'awr_busca_bateria', function ( $atts ) {
    $atts = shortcode_atts( array( 'site_url' => '' ), $atts, 'awr_busca_bateria' );

    wp_enqueue_style( 'awr-busca', AWR_THEME_URI . '/widget/awr-busca.css', array(), AWR_THEME_VERSION );
    wp_enqueue_script( 'awr-busca', AWR_THEME_URI . '/widget/awr-busca.js', array(), AWR_THEME_VERSION, true );

    if ( ! empty( $atts['site_url'] ) ) {
        wp_add_inline_script( 'awr-busca',
            'window.AWR_SITE_URL = ' . wp_json_encode( esc_url_raw( $atts['site_url'] ) ) . ';',
            'before'
        );
    }

    $site_attr = $atts['site_url'] ? ' data-site-url="' . esc_attr( $atts['site_url'] ) . '"' : '';
    return '<div data-awr-busca' . $site_attr . '></div>';
} );

/* -------------------------------------------------------------------------
 * 5. SEO server-side
 * ------------------------------------------------------------------------- */
add_action( 'wp_head', 'awr_print_seo_tags', 1 );
