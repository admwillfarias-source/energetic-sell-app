<?php
/**
 * Template catch-all. WordPress carrega tudo aqui; o React Router
 * lê window.location e renderiza a rota correta (/, /bateria/:sku,
 * /baterias/:slug, /baterias/:city/:slug, /baterias/marca/:slug,
 * /baterias/amperagem/:ah, /blog, /blog/:slug, etc).
 */
if ( ! defined( 'ABSPATH' ) ) { exit; }
?><!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
    <meta charset="<?php bloginfo( 'charset' ); ?>" />
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
    <meta name="theme-color" content="#0f172a" />
    <link rel="preconnect" href="https://mkkehvaclefoxkdlcmqm.supabase.co" crossorigin />
    <link rel="dns-prefetch" href="https://mkkehvaclefoxkdlcmqm.supabase.co" />
    <!-- Google Tag Manager -->
    <script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
    new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
    j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
    'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
    })(window,document,'script','dataLayer','GTM-5JTRM2L');</script>
    <!-- End Google Tag Manager -->
    <?php wp_head(); ?>
</head>
<body <?php body_class( 'awr-app-body' ); ?>>
    <!-- Google Tag Manager (noscript) -->
    <noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-5JTRM2L"
      height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
    <!-- End Google Tag Manager (noscript) -->
    <div id="root"></div>
    <noscript>
        <div style="padding:40px;text-align:center;font-family:system-ui">
            <h1>AWR Baterias</h1>
            <p>Este site precisa de JavaScript habilitado. Ligue para
            <a href="tel:+5551993199486">(51) 99319-9486</a> para atendimento imediato.</p>
        </div>
    </noscript>
    <?php wp_footer(); ?>
</body>
</html>
