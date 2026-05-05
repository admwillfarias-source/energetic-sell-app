<?php
/**
 * Dequeue dos assets do Elementor em páginas que NÃO usam Elementor.
 * Salva ~250 KB (CSS+JS) em páginas comuns / arquivo / single Woo.
 */
if ( ! defined( 'ABSPATH' ) ) { exit; }
if ( ! AWR_FAST_DEQ_ELEMENTOR ) { return; }

function awrf_page_uses_elementor() {
    if ( ! did_action( 'elementor/loaded' ) ) { return false; }
    $id = 0;
    if ( is_singular() ) { $id = get_queried_object_id(); }
    if ( ! $id ) { return false; }
    if ( get_post_meta( $id, '_elementor_edit_mode', true ) === 'builder' ) { return true; }
    return false;
}

function awrf_dequeue_elementor_when_unused() {
    if ( is_admin() ) { return; }
    if ( awrf_page_uses_elementor() ) { return; }

    $handles = array(
        'elementor-frontend', 'elementor-frontend-modules', 'elementor-pro-frontend',
        'elementor-common', 'elementor-webpack-runtime', 'elementor-app-loader',
        'elementor-icons', 'elementor-animations', 'elementor-pro',
        'elementor-post-1', 'elementor-post-2', 'elementor-global',
        'swiper', 'eicons',
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
add_action( 'wp_enqueue_scripts', 'awrf_dequeue_elementor_when_unused', 9999 );
add_action( 'wp_print_scripts',   'awrf_dequeue_elementor_when_unused', 9999 );
add_action( 'wp_print_styles',    'awrf_dequeue_elementor_when_unused', 9999 );
