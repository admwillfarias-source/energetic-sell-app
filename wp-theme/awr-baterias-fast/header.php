<?php
/**
 * Header mínimo — Elementor Pro Theme Builder pode sobrescrever via location.
 */
if ( ! defined( 'ABSPATH' ) ) { exit; }
?><!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
<meta charset="<?php bloginfo( 'charset' ); ?>">
<meta name="viewport" content="width=device-width, initial-scale=1">
<?php wp_head(); ?>
</head>
<body <?php body_class(); ?>>
<?php wp_body_open(); ?>
<a class="skip-link" href="#primary"><?php esc_html_e( 'Pular para o conteúdo', 'awr-baterias-fast' ); ?></a>
<?php
$awrf_did_header = false;
if ( function_exists( 'elementor_theme_do_location' ) ) {
    $awrf_did_header = elementor_theme_do_location( 'header' );
}
if ( ! $awrf_did_header ) : ?>
<header class="awrf-header">
    <div class="awrf-container awrf-header__inner">
        <div class="awrf-header__brand">
            <?php if ( has_custom_logo() ) { the_custom_logo(); } else { ?>
                <a href="<?php echo esc_url( home_url( '/' ) ); ?>" class="awrf-header__title"><?php bloginfo( 'name' ); ?></a>
            <?php } ?>
        </div>
        <nav class="awrf-header__nav" aria-label="<?php esc_attr_e( 'Menu principal', 'awr-baterias-fast' ); ?>">
            <?php wp_nav_menu( array( 'theme_location' => 'primary', 'menu_class' => 'awrf-menu', 'container' => false, 'fallback_cb' => '__return_empty_string', 'depth' => 2 ) ); ?>
        </nav>
        <div class="awrf-header__cta">
            <?php if ( class_exists( 'WooCommerce' ) ) : ?>
                <a class="awrf-cart-link" href="<?php echo esc_url( wc_get_cart_url() ); ?>" aria-label="Carrinho">🛒 <span class="awrf-cart-count"><?php echo esc_html( WC()->cart ? WC()->cart->get_cart_contents_count() : 0 ); ?></span></a>
            <?php endif; ?>
            <a class="awrf-btn" href="<?php echo esc_url( awrf_whatsapp_url( 'Olá! Quero uma bateria.' ) ); ?>" target="_blank" rel="noopener">WhatsApp <?php echo esc_html( awrf_phone() ); ?></a>
        </div>
    </div>
</header>
<?php endif; ?>
