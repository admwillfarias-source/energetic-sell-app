<?php
/**
 * Imagens: decoding=async em tudo, fetchpriority=high na primeira imagem do
 * conteúdo (LCP típico), lazy nas demais. WordPress 5.5+ já adiciona width/height
 * automaticamente quando o atributo não está presente.
 */
if ( ! defined( 'ABSPATH' ) ) { exit; }
if ( ! AWR_FAST_IMG_OPT ) { return; }

function awrf_img_attrs( $attr, $attachment, $size ) {
    if ( ! isset( $attr['decoding'] ) ) { $attr['decoding'] = 'async'; }
    return $attr;
}
add_filter( 'wp_get_attachment_image_attributes', 'awrf_img_attrs', 10, 3 );

/* Marca a primeira imagem de cada the_content com fetchpriority=high (LCP). */
function awrf_first_img_priority( $content ) {
    if ( is_admin() || ! in_the_loop() || ! is_main_query() ) { return $content; }
    static $done = false;
    if ( $done ) { return $content; }
    if ( strpos( $content, '<img' ) === false ) { return $content; }
    $content = preg_replace_callback( '/<img\b([^>]*)>/i', function( $m ) use ( &$done ) {
        if ( $done ) { return $m[0]; }
        $done = true;
        $a = $m[1];
        $a = preg_replace( '/\sloading\s*=\s*"[^"]*"/i', '', $a );
        if ( ! preg_match( '/\bfetchpriority\s*=/i', $a ) ) { $a .= ' fetchpriority="high"'; }
        if ( ! preg_match( '/\bdecoding\s*=/i', $a ) )      { $a .= ' decoding="async"'; }
        return '<img' . $a . '>';
    }, $content, 1 );
    return $content;
}
add_filter( 'the_content', 'awrf_first_img_priority', 5 );
