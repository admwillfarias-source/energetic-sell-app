<?php
if ( ! defined( 'ABSPATH' ) ) { exit; }
get_header(); ?>
<main id="primary" class="awrf-container">
<?php if ( have_posts() ) : ?>
    <div class="awrf-posts">
    <?php while ( have_posts() ) : the_post(); ?>
        <article id="post-<?php the_ID(); ?>" <?php post_class( 'awrf-post' ); ?>>
            <?php the_title( sprintf( '<h2 class="entry-title"><a href="%s">', esc_url( get_permalink() ) ), '</a></h2>' ); ?>
            <?php if ( has_post_thumbnail() ) : ?>
                <a class="awrf-post__thumb" href="<?php the_permalink(); ?>"><?php the_post_thumbnail( 'large', array( 'loading' => 'lazy', 'decoding' => 'async' ) ); ?></a>
            <?php endif; ?>
            <div class="entry-summary"><?php the_excerpt(); ?></div>
            <p><a class="awrf-btn" href="<?php the_permalink(); ?>">Ler mais</a></p>
        </article>
    <?php endwhile; ?>
    </div>
    <nav class="awrf-pagination"><?php the_posts_pagination(); ?></nav>
<?php else : ?>
    <p>Nenhum conteúdo encontrado.</p>
<?php endif; ?>
</main>
<?php get_footer();
