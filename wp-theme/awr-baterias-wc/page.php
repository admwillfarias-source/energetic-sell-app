<?php
if ( ! defined( 'ABSPATH' ) ) { exit; }
get_header(); ?>

<main id="primary" class="site-main awrwc-container">
    <?php while ( have_posts() ) : the_post(); ?>
        <article <?php post_class( 'awrwc-page' ); ?>>
            <header class="entry-header"><?php the_title( '<h1 class="entry-title">', '</h1>' ); ?></header>
            <div class="entry-content"><?php the_content(); ?></div>
        </article>
    <?php endwhile; ?>
</main>

<?php get_footer();
