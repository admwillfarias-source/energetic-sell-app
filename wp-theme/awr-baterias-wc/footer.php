<?php if ( ! defined( 'ABSPATH' ) ) { exit; } ?>

<?php
$awrwc_did_footer = false;
if ( function_exists( 'elementor_theme_do_location' ) ) {
    $awrwc_did_footer = elementor_theme_do_location( 'footer' );
}
if ( ! $awrwc_did_footer ) : ?>
<footer id="colophon" class="site-footer awrwc-footer">
    <div class="awrwc-container awrwc-footer__cols">
        <?php for ( $i = 1; $i <= 3; $i++ ) :
            if ( is_active_sidebar( 'footer-' . $i ) ) : ?>
                <div class="awrwc-footer__col"><?php dynamic_sidebar( 'footer-' . $i ); ?></div>
            <?php endif;
        endfor; ?>
    </div>
    <div class="awrwc-container awrwc-footer__bar">
        <small>© <?php echo esc_html( date_i18n( 'Y' ) ); ?> <?php bloginfo( 'name' ); ?>. <?php esc_html_e( 'Todos os direitos reservados.', 'awr-baterias-wc' ); ?></small>
        <?php
        wp_nav_menu( array(
            'theme_location' => 'footer',
            'menu_class'     => 'awrwc-menu awrwc-menu--inline',
            'container'      => false,
            'fallback_cb'    => '__return_empty_string',
            'depth'          => 1,
        ) );
        ?>
    </div>
</footer>
<?php endif; ?>

<?php wp_footer(); ?>
</body>
</html>
