<?php
/**
 * Page cache em disco (visitantes não logados, GET, sem query params dinâmicos).
 * Substitui ~80% do que WP Rocket / W3 Total Cache fazem.
 *
 * Armazena em wp-content/cache/awr-fast/{md5(host+uri)}.html
 * TTL padrão: 12 horas. Invalidação: hooks save_post, comment_post, etc.
 */
if ( ! defined( 'ABSPATH' ) ) { exit; }
if ( ! AWR_FAST_PAGE_CACHE ) { return; }

if ( ! defined( 'AWRF_CACHE_TTL' ) )  { define( 'AWRF_CACHE_TTL', 12 * HOUR_IN_SECONDS ); }
if ( ! defined( 'AWRF_CACHE_DIR' ) )  { define( 'AWRF_CACHE_DIR', WP_CONTENT_DIR . '/cache/awr-fast' ); }

function awrf_cache_eligible() {
    if ( is_admin() ) { return false; }
    if ( defined( 'DOING_AJAX' ) && DOING_AJAX ) { return false; }
    if ( defined( 'DOING_CRON' ) && DOING_CRON ) { return false; }
    if ( defined( 'REST_REQUEST' ) && REST_REQUEST ) { return false; }
    if ( ! empty( $_POST ) ) { return false; }
    if ( ! isset( $_SERVER['REQUEST_METHOD'] ) || $_SERVER['REQUEST_METHOD'] !== 'GET' ) { return false; }
    if ( is_user_logged_in() ) { return false; }

    // Cookies que indicam usuário "estado": logado, comentou, carrinho com itens.
    foreach ( (array) $_COOKIE as $k => $v ) {
        if ( preg_match( '/^(wordpress_logged_in|comment_author|woocommerce_items_in_cart|wp_woocommerce_session)/', $k ) ) {
            return false;
        }
    }
    // Não cachear carrinho/checkout/minha-conta.
    if ( function_exists( 'is_cart' ) && ( is_cart() || is_checkout() || is_account_page() ) ) { return false; }
    return true;
}

function awrf_cache_key() {
    $host = isset( $_SERVER['HTTP_HOST'] ) ? $_SERVER['HTTP_HOST'] : 'localhost';
    $uri  = isset( $_SERVER['REQUEST_URI'] ) ? $_SERVER['REQUEST_URI'] : '/';
    $mob  = wp_is_mobile() ? 'm' : 'd';
    return md5( $host . '|' . $uri . '|' . $mob );
}

function awrf_cache_path() {
    if ( ! is_dir( AWRF_CACHE_DIR ) ) { @wp_mkdir_p( AWRF_CACHE_DIR ); }
    return AWRF_CACHE_DIR . '/' . awrf_cache_key() . '.html';
}

function awrf_cache_serve() {
    if ( ! awrf_cache_eligible() ) { return; }
    $f = awrf_cache_path();
    if ( file_exists( $f ) && ( time() - filemtime( $f ) < AWRF_CACHE_TTL ) ) {
        header( 'X-AWRF-Cache: HIT' );
        header( 'Cache-Control: public, max-age=600' );
        readfile( $f );
        exit;
    }
}
add_action( 'init', 'awrf_cache_serve', 0 );

function awrf_cache_capture_start() {
    if ( awrf_cache_eligible() ) { ob_start( 'awrf_cache_capture_end' ); }
}
add_action( 'template_redirect', 'awrf_cache_capture_start', 0 );

function awrf_cache_capture_end( $buffer ) {
    if ( strlen( $buffer ) > 500 && strpos( $buffer, '</html>' ) !== false ) {
        @file_put_contents( awrf_cache_path(), $buffer, LOCK_EX );
    }
    return $buffer;
}

function awrf_cache_clear_all() {
    if ( ! is_dir( AWRF_CACHE_DIR ) ) { return; }
    $files = glob( AWRF_CACHE_DIR . '/*.html' );
    if ( $files ) { foreach ( $files as $f ) { @unlink( $f ); } }
}
