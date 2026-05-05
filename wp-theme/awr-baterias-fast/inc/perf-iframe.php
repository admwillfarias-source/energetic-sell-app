<?php
/**
 * Adiciona loading="lazy", decoding="async", width/height e fetchpriority=low
 * em iframes do Lovable (e qualquer iframe sem loading explícito).
 */
if ( ! defined( 'ABSPATH' ) ) { exit; }
if ( ! AWR_FAST_IFRAME_LAZY ) { return; }

function awrf_iframe_optimize( $content ) {
    if ( strpos( $content, '<iframe' ) === false ) { return $content; }
    $h = (int) get_theme_mod( 'awrf_iframe_height', 900 );
    if ( $h < 200 ) { $h = 900; }

    return preg_replace_callback( '/<iframe\b([^>]*)>/i', function( $m ) use ( $h ) {
        $attrs = $m[1];

        // loading="lazy"
        if ( ! preg_match( '/\bloading\s*=/i', $attrs ) ) { $attrs .= ' loading="lazy"'; }
        // decoding="async"
        if ( ! preg_match( '/\bdecoding\s*=/i', $attrs ) ) { $attrs .= ' decoding="async"'; }
        // fetchpriority="low"
        if ( ! preg_match( '/\bfetchpriority\s*=/i', $attrs ) ) { $attrs .= ' fetchpriority="low"'; }
        // width/height para evitar CLS
        if ( ! preg_match( '/\bwidth\s*=/i', $attrs ) )  { $attrs .= ' width="100%"'; }
        if ( ! preg_match( '/\bheight\s*=/i', $attrs ) ) { $attrs .= ' height="' . $h . '"'; }
        // referrerpolicy + sandbox seguros para apps externos
        if ( ! preg_match( '/\breferrerpolicy\s*=/i', $attrs ) ) { $attrs .= ' referrerpolicy="no-referrer-when-downgrade"'; }

        return '<iframe' . $attrs . '>';
    }, $content );
}
add_filter( 'the_content',         'awrf_iframe_optimize', 99 );
add_filter( 'widget_text_content', 'awrf_iframe_optimize', 99 );
add_filter( 'widget_block_content','awrf_iframe_optimize', 99 );
