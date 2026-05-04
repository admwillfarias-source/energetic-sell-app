<?php
if ( ! defined( 'ABSPATH' ) ) exit;
if ( post_password_required() ) return; ?>
<div id="comments" class="comments-area awrwc-comments">
    <?php if ( have_comments() ) : ?>
        <h2 class="comments-title"><?php printf( esc_html( _n( '%s comentário', '%s comentários', get_comments_number(), 'awr-baterias-wc' ) ), number_format_i18n( get_comments_number() ) ); ?></h2>
        <ol class="comment-list"><?php wp_list_comments( array( 'style' => 'ol', 'short_ping' => true ) ); ?></ol>
        <?php the_comments_pagination(); ?>
    <?php endif; ?>
    <?php comment_form(); ?>
</div>
