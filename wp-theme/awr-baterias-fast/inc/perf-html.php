<?php
/**
 * Minificador HTML do output buffer. Não toca em <pre>, <textarea>, <script>, <style>.
 */
if ( ! defined( 'ABSPATH' ) ) { exit; }
if ( ! AWR_FAST_HTML_MIN ) { return; }

function awrf_html_min_start() {
    if ( is_admin() || is_user_logged_in() ) { return; }
    if ( defined( 'REST_REQUEST' ) && REST_REQUEST ) { return; }
    if ( defined( 'DOING_AJAX' ) && DOING_AJAX ) { return; }
    ob_start( 'awrf_html_min' );
}
add_action( 'template_redirect', 'awrf_html_min_start', 1 );

function awrf_html_min( $html ) {
    if ( strlen( $html ) < 200 ) { return $html; }

    // Preserva blocos sensíveis com placeholders.
    $store = array();
    $i = 0;
    $html = preg_replace_callback(
        '#<(pre|textarea|script|style)\b[^>]*>[\s\S]*?</\1>#i',
        function( $m ) use ( &$store, &$i ) {
            $key = "\x01AWRF_PH_{$i}\x01"; $store[ $key ] = $m[0]; $i++; return $key;
        },
        $html
    );

    // Remove comentários HTML (preserva condicionais IE e SSI).
    $html = preg_replace( '/<!--(?!\[if|<!|#)[\s\S]*?-->/', '', $html );
    // Colapsa espaços em branco entre tags e quebras múltiplas.
    $html = preg_replace( '/>\s+</', '><', $html );
    $html = preg_replace( '/[ \t]{2,}/', ' ', $html );
    $html = preg_replace( '/\n{2,}/', "\n", $html );

    // Restaura blocos.
    if ( $store ) { $html = strtr( $html, $store ); }
    return $html;
}
