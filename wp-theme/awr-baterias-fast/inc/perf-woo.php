<?php
/**
 * Dequeue dos assets do WooCommerce fora de páginas Woo (carrinho, checkout,
 * conta, produto, archive product). Salva ~150 KB no home/blog/landing.
 */
if ( ! defined( 'ABSPATH' ) ) { exit; }
if ( ! AWR_FAST_DEQ_WOO ) { return; }

function awrf_is_woo_context() {
    if ( ! function_exists( 'is_woocommerce' ) ) { return false; }
    return is_woocommerce() || is_cart() || is_checkout() || is_account_page();
}

function awrf_dequeue_woo_when_unused() {
    if ( is_admin() || ! function_exists( 'WC' ) ) { return; }
    if ( awrf_is_woo_context() ) { return; }

    $handles = array(
        'woocommerce-general', 'woocommerce-layout', 'woocommerce-smallscreen',
        'wc-block-style', 'wc-blocks-style', 'wc-blocks-vendors-style', 'wc-blocks-style-payment-method',
        'wc-cart-fragments', 'wc-add-to-cart', 'woocommerce', 'jquery-blockui',
        'js-cookie', 'select2', 'selectWoo', 'sourcebuster-js',
    );
    foreach ( $handles as $h ) {
        if ( wp_script_is( $h, 'enqueued' ) || wp_script_is( $h, 'registered' ) ) {
            wp_dequeue_script( $h ); wp_deregister_script( $h );
        }
        if ( wp_style_is( $h, 'enqueued' ) || wp_style_is( $h, 'registered' ) ) {
            wp_dequeue_style( $h ); wp_deregister_style( $h );
        }
    }
}
add_action( 'wp_enqueue_scripts', 'awrf_dequeue_woo_when_unused', 9999 );
add_action( 'wp_print_scripts',   'awrf_dequeue_woo_when_unused', 9999 );
add_action( 'wp_print_styles',    'awrf_dequeue_woo_when_unused', 9999 );
