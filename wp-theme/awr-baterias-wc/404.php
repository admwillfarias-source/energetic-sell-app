<?php
if ( ! defined( 'ABSPATH' ) ) exit;
get_header(); ?>
<main id="primary" class="site-main awrwc-container awrwc-404">
    <h1><?php esc_html_e( 'Página não encontrada', 'awr-baterias-wc' ); ?></h1>
    <p><?php esc_html_e( 'O conteúdo que você procura pode ter sido movido.', 'awr-baterias-wc' ); ?></p>
    <p><a class="awrwc-btn awrwc-btn--primary" href="<?php echo esc_url( home_url( '/' ) ); ?>"><?php esc_html_e( 'Voltar à página inicial', 'awr-baterias-wc' ); ?></a></p>
    <?php get_search_form(); ?>
</main>
<?php get_footer();
