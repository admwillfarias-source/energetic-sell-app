<?php
if ( ! defined( 'ABSPATH' ) ) { exit; }
get_header(); ?>
<main id="primary" class="awrf-container">
    <?php woocommerce_content(); ?>
</main>
<?php get_footer();
