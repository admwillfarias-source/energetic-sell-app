<?php if ( ! defined( 'ABSPATH' ) ) exit; ?>
<form role="search" method="get" class="awrwc-search-form" action="<?php echo esc_url( home_url( '/' ) ); ?>">
    <label class="screen-reader-text" for="awrwc-s"><?php esc_html_e( 'Buscar:', 'awr-baterias-wc' ); ?></label>
    <input type="search" id="awrwc-s" name="s" value="<?php echo esc_attr( get_search_query() ); ?>" placeholder="<?php esc_attr_e( 'Buscar…', 'awr-baterias-wc' ); ?>" />
    <button type="submit" class="awrwc-btn"><?php esc_html_e( 'Buscar', 'awr-baterias-wc' ); ?></button>
</form>
