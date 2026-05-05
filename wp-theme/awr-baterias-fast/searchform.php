<?php if ( ! defined( 'ABSPATH' ) ) { exit; } ?>
<form role="search" method="get" class="search-form" action="<?php echo esc_url( home_url( '/' ) ); ?>">
    <label for="s" class="screen-reader-text">Buscar:</label>
    <input type="search" id="s" name="s" value="<?php echo esc_attr( get_search_query() ); ?>" placeholder="Buscar...">
    <button class="awrf-btn" type="submit">Buscar</button>
</form>
