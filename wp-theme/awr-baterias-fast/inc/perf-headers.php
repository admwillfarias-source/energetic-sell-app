<?php
/**
 * Headers HTTP: Cache-Control para HTML, dns-prefetch/preconnect e Link rel=preload.
 * Para assets estáticos (woff2/css/js/img), use o snippet em .htaccess-snippet.txt
 * ou configure no nginx — esses NÃO passam pelo PHP.
 */
if ( ! defined( 'ABSPATH' ) ) { exit; }
if ( ! AWR_FAST_HEADERS ) { return; }

function awrf_send_headers() {
    if ( is_admin() || ( defined( 'REST_REQUEST' ) && REST_REQUEST ) ) { return; }
    if ( is_user_logged_in() ) {
        header( 'Cache-Control: private, no-store' );
        return;
    }
    header( 'Cache-Control: public, max-age=600, s-maxage=600, stale-while-revalidate=86400' );
    header( 'X-Content-Type-Options: nosniff' );
    header( 'Referrer-Policy: strict-origin-when-cross-origin' );
}
add_action( 'send_headers', 'awrf_send_headers' );

/* dns-prefetch + preconnect para origens críticas. */
function awrf_resource_hints( $hints, $relation ) {
    $extras = array(
        'dns-prefetch' => array( '//www.googletagmanager.com', '//www.google-analytics.com', '//energetic-sell-app.lovable.app' ),
        'preconnect'   => array( array( 'href' => 'https://energetic-sell-app.lovable.app', 'crossorigin' => 'anonymous' ) ),
    );
    if ( isset( $extras[ $relation ] ) ) { $hints = array_merge( $hints, $extras[ $relation ] ); }
    return $hints;
}
add_filter( 'wp_resource_hints', 'awrf_resource_hints', 10, 2 );
