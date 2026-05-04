<?php
if ( ! defined( 'ABSPATH' ) ) { exit; }
get_header(); ?>

<main id="primary" class="site-main awrwc-container">
    <?php while ( have_posts() ) : the_post(); ?>
        <article <?php post_class( 'awrwc-single' ); ?>>
            <header class="entry-header">
                <?php the_title( '<h1 class="entry-title">', '</h1>' ); ?>
                <p class="entry-meta"><?php echo esc_html( get_the_date() ); ?> — <?php the_author(); ?></p>
            </header>
            <?php if ( has_post_thumbnail() ) the_post_thumbnail( 'large' ); ?>
            <div class="entry-content"><?php the_content(); ?></div>
        </article>
        <?php if ( comments_open() || get_comments_number() ) : comments_template(); endif; ?>
    <?php endwhile; ?>
</main>

<?php get_footer();
