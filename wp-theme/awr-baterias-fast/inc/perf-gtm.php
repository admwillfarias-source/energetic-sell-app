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
    $id_js = wp_json_encode( $id );
    ?>
    <script id="awrf-gtm-lazy">
    (function(){
      var loaded=false, gtmId=<?php echo $id_js; ?>;
      function load(){
        if(loaded) return; loaded=true;
        window.dataLayer=window.dataLayer||[];
        window.dataLayer.push({'gtm.start':new Date().getTime(),event:'gtm.js'});
        var f=document.getElementsByTagName('script')[0],
            j=document.createElement('script');
        j.async=true; j.src='https://www.googletagmanager.com/gtm.js?id='+gtmId;
        f.parentNode.insertBefore(j,f);
        clean();
      }
      function clean(){
        ['scroll','touchstart','mousemove','keydown'].forEach(function(e){
          window.removeEventListener(e,load,{passive:true});
        });
      }
      ['scroll','touchstart','mousemove','keydown'].forEach(function(e){
        window.addEventListener(e,load,{passive:true,once:true});
      });
      setTimeout(load,4000);
    })();
    </script>
    <noscript><iframe src="https://www.googletagmanager.com/ns.html?id=<?php echo esc_attr( $id ); ?>"
      height="0" width="0" style="display:none;visibility:hidden" loading="lazy"></iframe></noscript>
    <?php
}
add_action( 'wp_head', 'awrf_gtm_lazy', 5 );
