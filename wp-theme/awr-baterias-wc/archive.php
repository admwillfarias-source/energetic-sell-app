<?php
if ( ! defined( 'ABSPATH' ) ) { exit; }
get_header(); ?>

<main id="primary" class="site-main awrwc-container">
    <header class="awrwc-archive-header"><?php the_archive_title( '<h1 class="entry-title">', '</h1>' ); the_archive_description( '<div class="archive-description">', '</div>' ); ?></header>
    <?php if ( have_posts() ) : ?>
        <div class="awrwc-posts">
        <?php while ( have_posts() ) : the_post(); ?>
            <article <?php post_class( 'awrwc-post' ); ?>>
                <?php the_title( sprintf( '<h2 class="entry-title"><a href="%s">', esc_url( get_permalink() ) ), '</a></h2>' ); ?>
                <div class="entry-summary"><?php the_excerpt(); ?></div>
            </article>
        <?php endwhile; ?>
        </div>
        <?php the_posts_pagination(); ?>
    <?php else : ?>
        <p><?php esc_html_e( 'Nada encontrado.', 'awr-baterias-wc' ); ?></p>
    <?php endif; ?>
</main>

<?php get_footer();
