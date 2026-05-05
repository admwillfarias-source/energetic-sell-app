<?php
if ( ! defined( 'ABSPATH' ) ) { exit; }
get_header(); ?>
<main id="primary" class="awrf-container">
<?php while ( have_posts() ) : the_post(); ?>
    <article <?php post_class( 'awrf-single' ); ?>>
        <h1><?php the_title(); ?></h1>
        <?php if ( has_post_thumbnail() ) : the_post_thumbnail( 'large', array( 'fetchpriority' => 'high', 'decoding' => 'async' ) ); endif; ?>
        <div class="entry-content"><?php the_content(); ?></div>
    </article>
    <?php if ( comments_open() || get_comments_number() ) : comments_template(); endif; ?>
<?php endwhile; ?>
</main>
<?php get_footer();
