<?php
/**
 * Preload de fontes críticas + força font-display: swap em todas as @font-face
 * carregadas via <link> de Google Fonts.
 */
if ( ! defined( 'ABSPATH' ) ) { exit; }
if ( ! AWR_FAST_FONT_OPT ) { return; }

function awrf_preload_fonts() {
    $f1 = trim( (string) get_theme_mod( 'awrf_preload_font1', '' ) );
    $f2 = trim( (string) get_theme_mod( 'awrf_preload_font2', '' ) );
    foreach ( array( $f1, $f2 ) as $url ) {
        if ( $url ) {
            echo '<link rel="preload" as="font" type="font/woff2" href="' . esc_url( $url ) . '" crossorigin="anonymous">' . "\n";
        }
    }
}
add_action( 'wp_head', 'awrf_preload_fonts', 2 );

/* Adiciona display=swap em URLs do Google Fonts. */
function awrf_google_fonts_swap( $html, $handle, $href ) {
    if ( strpos( $href, 'fonts.googleapis.com' ) === false ) { return $html; }
    if ( strpos( $href, 'display=' ) !== false ) { return $html; }
    $sep = ( strpos( $href, '?' ) === false ) ? '?' : '&';
    $new = $href . $sep . 'display=swap';
    return str_replace( $href, $new, $html );
}
add_filter( 'style_loader_tag', 'awrf_google_fonts_swap', 10, 3 );
