<?php
/**
 * Template Name: Em branco (Elementor Canvas)
 *
 * Página totalmente vazia para o Elementor desenhar do zero (sem header/footer
 * do tema). Útil para landing pages.
 */
if ( ! defined( 'ABSPATH' ) ) exit;
?><!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
<meta charset="<?php bloginfo( 'charset' ); ?>" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<?php wp_head(); ?>
</head>
<body <?php body_class( 'awrwc-canvas' ); ?>>
<?php wp_body_open();
while ( have_posts() ) : the_post(); the_content(); endwhile;
wp_footer(); ?>
</body>
</html>
