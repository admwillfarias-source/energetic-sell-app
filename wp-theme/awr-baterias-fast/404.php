<?php
if ( ! defined( 'ABSPATH' ) ) { exit; }
get_header(); ?>
<main id="primary" class="awrf-container" style="padding:64px 16px;text-align:center">
    <h1>404</h1>
    <p>Página não encontrada.</p>
    <p><a class="awrf-btn" href="<?php echo esc_url( home_url( '/' ) ); ?>">Voltar para a home</a></p>
</main>
<?php get_footer();
