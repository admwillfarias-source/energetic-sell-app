<?php
/**
 * Shortcode [awr_app] — embute o app React do Lovable em um iframe
 * agressivamente otimizado:
 *
 *  - loading="lazy"  + decoding="async" + fetchpriority="low"
 *  - width/height definidos para evitar CLS
 *  - referrerpolicy="no-referrer-when-downgrade"
 *  - allow / sandbox seguros
 *  - title acessível
 *  - URL com ?embed=1 para o React detectar antes mesmo do window.self check
 *  - preconnect ao domínio do app injetado uma única vez por página
 *  - auto-resize via postMessage (parent escuta "awr:height"); o iframe
 *    deixa de precisar de scroll interno e o parent ajusta a altura real,
 *    evitando "espaço vazio" e renderização de conteúdo invisível.
 *
 * Uso:
 *   [awr_app]                     — usa URL/altura do Customizer
 *   [awr_app height="1200"]
 *   [awr_app url="https://energetic-sell-app.lovable.app/?utm_source=wp"]
 */
if ( ! defined( 'ABSPATH' ) ) { exit; }

function awrf_app_iframe_shortcode( $atts ) {
    $defaults = array(
        'url'    => get_theme_mod( 'awrf_lovable_url', 'https://energetic-sell-app.lovable.app' ),
        'height' => (int) get_theme_mod( 'awrf_iframe_height', 900 ),
        'title'  => 'AWR Baterias',
        'id'     => 'awr-app-' . wp_rand( 1000, 9999 ),
    );
    $a = shortcode_atts( $defaults, $atts, 'awr_app' );

    $url = esc_url( add_query_arg( 'embed', '1', $a['url'] ) );
    $h   = max( 200, (int) $a['height'] );

    // Preconnect injetado uma única vez por request — encurta a 1ª handshake
    // (TLS + DNS) do domínio do iframe. Sem render-blocking.
    static $preconnect_emitted = false;
    $preconnect = '';
    if ( ! $preconnect_emitted ) {
        $origin = wp_parse_url( $a['url'], PHP_URL_SCHEME ) . '://' . wp_parse_url( $a['url'], PHP_URL_HOST );
        $preconnect  = '<link rel="preconnect" href="' . esc_url( $origin ) . '" crossorigin>';
        $preconnect .= '<link rel="dns-prefetch" href="' . esc_url( $origin ) . '">';
        $preconnect_emitted = true;
    }

    // Listener postMessage para auto-resize. Inserido uma única vez por página.
    static $resize_emitted = false;
    $resize_js = '';
    if ( ! $resize_emitted ) {
        $resize_js = "<script>(function(){function upMeta(n,v){var m=document.querySelector('meta[name=\"'+n+'\"]');if(!m){m=document.createElement('meta');m.setAttribute('name',n);document.head.appendChild(m);}m.setAttribute('content',v);}function upProp(p,v){var m=document.querySelector('meta[property=\"'+p+'\"]');if(!m){m=document.createElement('meta');m.setAttribute('property',p);document.head.appendChild(m);}m.setAttribute('content',v);}function upCanon(h){var l=document.querySelector('link[rel=\"canonical\"]');if(!l){l=document.createElement('link');l.setAttribute('rel','canonical');document.head.appendChild(l);}l.setAttribute('href',h);}window.addEventListener('message',function(e){var d=e.data;if(!d||typeof d!=='object')return;if(d.type==='awr:height'){var f=document.querySelector('iframe[data-awr-app=\"1\"][src*=\"'+(d.origin||'')+'\"]')||document.querySelector('iframe[data-awr-app=\"1\"]');if(f&&typeof d.height==='number'&&d.height>200){f.style.height=Math.ceil(d.height)+'px';}return;}if(d.type==='awr:seo'){if(d.title){document.title=d.title;upProp('og:title',d.title);}if(d.description){upMeta('description',d.description);upProp('og:description',d.description);}if(d.canonical){upCanon(d.canonical);upProp('og:url',d.canonical);}if(d.ogImage){upProp('og:image',d.ogImage);}return;}});})();</script>";
        $resize_emitted = true;
    }

    $iframe = sprintf(
        '<iframe data-awr-app="1" src="%1$s" title="%2$s" id="%3$s" '
        . 'loading="lazy" decoding="async" fetchpriority="low" '
        . 'referrerpolicy="no-referrer-when-downgrade" '
        . 'allow="clipboard-write; payment; geolocation" '
        . 'sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-top-navigation-by-user-activation" '
        . 'width="100%%" height="%4$d" '
        . 'style="display:block;width:100%%;border:0;background:hsl(0 0%% 98%%);min-height:%4$dpx"></iframe>',
        $url,
        esc_attr( $a['title'] ),
        esc_attr( $a['id'] ),
        $h
    );

    return $preconnect . $iframe . $resize_js;
}
add_shortcode( 'awr_app', 'awrf_app_iframe_shortcode' );
