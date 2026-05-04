<?php
/**
 * Header — fallback usado quando o Elementor Theme Builder não fornece header.
 */
if ( ! defined( 'ABSPATH' ) ) { exit; }
?><!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
    <meta charset="<?php bloginfo( 'charset' ); ?>" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link rel="profile" href="https://gmpg.org/xfn/11" />
    <?php wp_head(); ?>
</head>
<body <?php body_class(); ?>>
<?php wp_body_open(); ?>

<?php
// Se o Elementor Pro tiver um header próprio, renderiza-o e ignora o fallback.
$awrwc_did_header = false;
if ( function_exists( 'elementor_theme_do_location' ) ) {
    $awrwc_did_header = elementor_theme_do_location( 'header' );
}

if ( ! $awrwc_did_header ) : ?>
<header id="masthead" class="site-header awrwc-header">
    <div class="awrwc-container awrwc-header__inner">
        <div class="awrwc-header__brand">
            <?php
            if ( function_exists( 'the_custom_logo' ) && has_custom_logo() ) {
                the_custom_logo();
            } else { ?>
                <a href="<?php echo esc_url( home_url( '/' ) ); ?>" class="awrwc-header__title">
                    <?php bloginfo( 'name' ); ?>
                </a>
            <?php } ?>
        </div>

        <nav class="awrwc-header__nav" aria-label="<?php esc_attr_e( 'Menu principal', 'awr-baterias-wc' ); ?>">
            <?php
            wp_nav_menu( array(
                'theme_location' => 'primary',
                'menu_class'     => 'awrwc-menu',
                'container'      => false,
                'fallback_cb'    => '__return_empty_string',
                'depth'          => 2,
            ) );
            ?>
        </nav>

        <div class="awrwc-header__cta">
            <?php if ( class_exists( 'WooCommerce' ) ) : ?>
                <a class="awrwc-cart-link" href="<?php echo esc_url( wc_get_cart_url() ); ?>" aria-label="<?php esc_attr_e( 'Ver carrinho', 'awr-baterias-wc' ); ?>">
                    🛒 <span class="awrwc-cart-count"><?php echo esc_html( WC()->cart ? WC()->cart->get_cart_contents_count() : 0 ); ?></span>
                </a>
            <?php endif; ?>
            <a class="awrwc-btn awrwc-btn--primary" href="<?php echo esc_url( awrwc_whatsapp_url( 'Olá! Quero uma bateria.' ) ); ?>" target="_blank" rel="noopener">
                WhatsApp <?php echo esc_html( awrwc_phone() ); ?>
            </a>
        </div>
    </div>
</header>
<?php endif; ?>
