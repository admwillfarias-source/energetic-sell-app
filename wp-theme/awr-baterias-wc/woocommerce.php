<?php
/**
 * Template usado para todas as páginas do WooCommerce
 * (loja, categoria, produto único, etc.) quando o tema não fornece um
 * arquivo mais específico. O conteúdo é renderizado pelo próprio plugin
 * via woocommerce_content().
 */
if ( ! defined( 'ABSPATH' ) ) exit;
get_header(); ?>

<?php woocommerce_content(); ?>

<?php get_footer();
