<?php
/**
 * Cleanup agressivo do WordPress: remove tudo que não é essencial para
 * visitantes não logados.
 */
if ( ! defined( 'ABSPATH' ) ) { exit; }
if ( ! AWR_FAST_CLEANUP ) { return; }

function awrf_cleanup_head() {
    remove_action( 'wp_head', 'rsd_link' );
    remove_action( 'wp_head', 'wlwmanifest_link' );
    remove_action( 'wp_head', 'wp_generator' );
    remove_action( 'wp_head', 'wp_shortlink_wp_head' );
    remove_action( 'wp_head', 'feed_links_extra', 3 );
    remove_action( 'wp_head', 'rest_output_link_wp_head' );
    remove_action( 'wp_head', 'wp_oembed_add_discovery_links' );
    remove_action( 'wp_head', 'wp_oembed_add_host_js' );
    remove_action( 'template_redirect', 'rest_output_link_header', 11 );
    remove_action( 'template_redirect', 'wp_shortlink_header', 11 );
}
add_action( 'init', 'awrf_cleanup_head' );

/* Emojis */
function awrf_disable_emojis() {
    if ( is_admin() ) { return; }
    remove_action( 'wp_head', 'print_emoji_detection_script', 7 );
    remove_action( 'admin_print_scripts', 'print_emoji_detection_script' );
    remove_action( 'wp_print_styles', 'print_emoji_styles' );
    remove_action( 'admin_print_styles', 'print_emoji_styles' );
    remove_filter( 'the_content_feed', 'wp_staticize_emoji' );
    remove_filter( 'comment_text_rss', 'wp_staticize_emoji' );
    remove_filter( 'wp_mail', 'wp_staticize_emoji_for_email' );
    add_filter( 'tiny_mce_plugins', function( $p ) { return is_array( $p ) ? array_diff( $p, array( 'wpemoji' ) ) : $p; } );
}
add_action( 'init', 'awrf_disable_emojis' );

/* wp-embed */
function awrf_dequeue_embed() { if ( ! is_admin() ) { wp_dequeue_script( 'wp-embed' ); } }
add_action( 'wp_footer', 'awrf_dequeue_embed' );

/* Block library CSS / global styles / classic-themes — quando o conteúdo não usa blocos. */
function awrf_dequeue_block_css() {
    if ( is_admin() ) { return; }
    $needs_blocks = false;
    if ( is_singular() ) {
        $post = get_post();
        if ( $post && function_exists( 'has_blocks' ) && has_blocks( $post->post_content ) ) {
            $needs_blocks = true;
        }
    }
    if ( ! $needs_blocks ) {
        wp_dequeue_style( 'wp-block-library' );
        wp_dequeue_style( 'wp-block-library-theme' );
        wp_dequeue_style( 'global-styles' );
        wp_dequeue_style( 'classic-theme-styles' );
    }
}
add_action( 'wp_enqueue_scripts', 'awrf_dequeue_block_css', 100 );

/* Dashicons no front (visitantes). */
function awrf_dequeue_dashicons() {
    if ( ! is_user_logged_in() ) { wp_dequeue_style( 'dashicons' ); wp_deregister_style( 'dashicons' ); }
}
add_action( 'wp_enqueue_scripts', 'awrf_dequeue_dashicons', 100 );

/* jQuery migrate — não precisa em jQuery 3.x. */
function awrf_remove_jquery_migrate( $scripts ) {
    if ( is_admin() || empty( $scripts->registered['jquery'] ) ) { return; }
    $deps = $scripts->registered['jquery']->deps;
    if ( $deps ) { $scripts->registered['jquery']->deps = array_diff( $deps, array( 'jquery-migrate' ) ); }
}
add_action( 'wp_default_scripts', 'awrf_remove_jquery_migrate' );

/* Heartbeat throttle. */
function awrf_heartbeat_settings( $s ) { $s['interval'] = 60; return $s; }
add_filter( 'heartbeat_settings', 'awrf_heartbeat_settings' );

/* Desabilita XML-RPC. */
add_filter( 'xmlrpc_enabled', '__return_false' );

/* Remove RSD/wlwmanifest do header. */
remove_action( 'wp_head', 'rsd_link' );
remove_action( 'wp_head', 'wlwmanifest_link' );
