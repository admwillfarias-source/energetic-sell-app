<?php
/**
 * GTM lazy: injeta um loader que dispara o gtm.js apenas após
 * primeira interação (scroll/touch/mouse) ou 4s de idle.
 *
 * Configurar GTM ID em Customizer → AWR Fast → Performance.
 */
if ( ! defined( 'ABSPATH' ) ) { exit; }
if ( ! AWR_FAST_GTM_LAZY ) { return; }

function awrf_gtm_lazy() {
    $id = trim( (string) get_theme_mod( 'awrf_gtm_id', '' ) );
    if ( ! $id || ! preg_match( '/^GTM-[A-Z0-9]+$/i', $id ) ) { return; }
    $id_attr = esc_attr( $id );
    ?>
    <!-- Google Tag Manager -->
    <script id="awrf-gtm">
    (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
    new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
    j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
    'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
    })(window,document,'script','dataLayer','<?php echo $id_attr; ?>');
    </script>
    <!-- End Google Tag Manager -->
    <?php
}
add_action( 'wp_head', 'awrf_gtm_lazy', 5 );

/* noscript fallback no início do <body> */
function awrf_gtm_noscript() {
    $id = trim( (string) get_theme_mod( 'awrf_gtm_id', '' ) );
    if ( ! $id || ! preg_match( '/^GTM-[A-Z0-9]+$/i', $id ) ) { return; }
    ?>
    <noscript><iframe src="https://www.googletagmanager.com/ns.html?id=<?php echo esc_attr( $id ); ?>"
      height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
    <?php
}
add_action( 'wp_body_open', 'awrf_gtm_noscript', 1 );
