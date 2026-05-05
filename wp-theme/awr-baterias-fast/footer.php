<?php if ( ! defined( 'ABSPATH' ) ) { exit; } ?>
<?php
$awrf_did_footer = false;
if ( function_exists( 'elementor_theme_do_location' ) ) {
    $awrf_did_footer = elementor_theme_do_location( 'footer' );
}
if ( ! $awrf_did_footer ) : ?>
<footer class="awrf-footer">
    <div class="awrf-container awrf-footer__cols">
        <?php for ( $i = 1; $i <= 3; $i++ ) :
            if ( is_active_sidebar( 'footer-' . $i ) ) : ?>
                <div class="awrf-footer__col"><?php dynamic_sidebar( 'footer-' . $i ); ?></div>
            <?php endif;
        endfor; ?>
    </div>
    <div class="awrf-container awrf-footer__bar">
        <small>© <?php echo esc_html( date_i18n( 'Y' ) ); ?> <?php bloginfo( 'name' ); ?>.</small>
        <?php wp_nav_menu( array( 'theme_location' => 'footer', 'menu_class' => 'awrf-menu awrf-menu--inline', 'container' => false, 'fallback_cb' => '__return_empty_string', 'depth' => 1 ) ); ?>
    </div>
</footer>
<?php endif; ?>
<?php wp_footer(); ?>
</body>
</html>
