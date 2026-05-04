<?php
if ( ! defined( 'ABSPATH' ) ) { exit; }
get_header(); ?>

<main id="primary" class="site-main awrwc-container">
    <?php if ( have_posts() ) : ?>
        <div class="awrwc-posts">
        <?php while ( have_posts() ) : the_post(); ?>
            <article id="post-<?php the_ID(); ?>" <?php post_class( 'awrwc-post' ); ?>>
                <header class="entry-header">
                    <?php the_title( sprintf( '<h2 class="entry-title"><a href="%s">', esc_url( get_permalink() ) ), '</a></h2>' ); ?>
                </header>
                <?php if ( has_post_thumbnail() ) : ?>
                    <a class="awrwc-post__thumb" href="<?php the_permalink(); ?>"><?php the_post_thumbnail( 'large' ); ?></a>
                <?php endif; ?>
                <div class="entry-summary"><?php the_excerpt(); ?></div>
                <p><a class="awrwc-btn" href="<?php the_permalink(); ?>"><?php esc_html_e( 'Ler mais', 'awr-baterias-wc' ); ?></a></p>
            </article>
        <?php endwhile; ?>
        </div>
        <nav class="awrwc-pagination"><?php the_posts_pagination(); ?></nav>
    <?php else : ?>
        <p><?php esc_html_e( 'Nenhum conteúdo encontrado.', 'awr-baterias-wc' ); ?></p>
    <?php endif; ?>
</main>

<?php get_footer();
