<?php
/**
 * Defer/async automático em todo JS não crítico.
 * Allowlist crítica: jquery-core (necessário sync no checkout) e nosso awrf-gtm-lazy.
 */
if ( ! defined( 'ABSPATH' ) ) { exit; }
if ( ! AWR_FAST_DEFER ) { return; }

function awrf_defer_scripts( $tag, $handle ) {
    if ( is_admin() ) { return $tag; }

    // Não tocar em handles críticos.
    $critical = array( 'jquery-core', 'awrf-gtm-lazy' );
    if ( in_array( $handle, $critical, true ) ) { return $tag; }

    // No checkout/carrinho do Woo, manter síncrono o que o Woo precisar.
    if ( function_exists( 'is_checkout' ) && ( is_checkout() || is_cart() ) ) {
        $woo_sync = array( 'wc-checkout', 'wc-cart', 'wc-cart-fragments', 'woocommerce' );
        if ( in_array( $handle, $woo_sync, true ) ) { return $tag; }
    }

    // Se já tem defer/async, não duplica.
    if ( strpos( $tag, ' defer' ) !== false || strpos( $tag, ' async' ) !== false ) { return $tag; }

    // Tracking/analytics → async; resto → defer.
    $async_handles = array( 'google-analytics', 'gtag', 'gtm', 'facebook-pixel', 'hotjar' );
    $attr = in_array( $handle, $async_handles, true ) ? ' async' : ' defer';

    return preg_replace( '/<script(?![^>]*\b(defer|async)\b)/', '<script' . $attr, $tag, 1 );
}
add_filter( 'script_loader_tag', 'awrf_defer_scripts', 10, 2 );
