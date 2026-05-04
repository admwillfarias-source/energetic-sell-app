<?php
/**
 * AWR Baterias WC — tema WordPress clássico, compatível com WooCommerce e Elementor.
 *
 * Compatível com WP >= 6.0 e PHP >= 7.4.
 * Apenas funções nomeadas (sem closures) para máxima compatibilidade.
 */

if ( ! defined( 'ABSPATH' ) ) { exit; }

if ( ! defined( 'AWRWC_VERSION' ) ) { define( 'AWRWC_VERSION', '1.0.0' ); }
if ( ! defined( 'AWRWC_DIR' ) )     { define( 'AWRWC_DIR', get_template_directory() ); }
if ( ! defined( 'AWRWC_URI' ) )     { define( 'AWRWC_URI', get_template_directory_uri() ); }

/* ---------------------------------------------------------------------------
 * 1. Setup do tema
 * ------------------------------------------------------------------------- */
function awrwc_setup() {
    load_theme_textdomain( 'awr-baterias-wc', AWRWC_DIR . '/languages' );

    add_theme_support( 'title-tag' );
    add_theme_support( 'post-thumbnails' );
    add_theme_support( 'automatic-feed-links' );
    add_theme_support( 'responsive-embeds' );
    add_theme_support( 'align-wide' );
    add_theme_support( 'editor-styles' );
    add_theme_support( 'custom-logo', array(
        'height'      => 80,
        'width'       => 240,
        'flex-height' => true,
        'flex-width'  => true,
    ) );
    add_theme_support( 'custom-background', array( 'default-color' => 'ffffff' ) );
    add_theme_support( 'html5', array(
        'search-form', 'comment-form', 'comment-list', 'gallery', 'caption', 'style', 'script', 'navigation-widgets',
    ) );

    // WooCommerce
    add_theme_support( 'woocommerce' );
    add_theme_support( 'wc-product-gallery-zoom' );
    add_theme_support( 'wc-product-gallery-lightbox' );
    add_theme_support( 'wc-product-gallery-slider' );

    // Elementor
    add_theme_support( 'elementor' );

    register_nav_menus( array(
        'primary' => __( 'Menu principal', 'awr-baterias-wc' ),
        'footer'  => __( 'Menu rodapé', 'awr-baterias-wc' ),
    ) );
}
add_action( 'after_setup_theme', 'awrwc_setup' );

/* ---------------------------------------------------------------------------
 * 2. Widget areas
 * ------------------------------------------------------------------------- */
function awrwc_widgets_init() {
    register_sidebar( array(
        'name'          => __( 'Barra lateral', 'awr-baterias-wc' ),
        'id'            => 'sidebar-1',
        'before_widget' => '<section id="%1$s" class="widget %2$s">',
        'after_widget'  => '</section>',
        'before_title'  => '<h2 class="widget-title">',
        'after_title'   => '</h2>',
    ) );
    for ( $i = 1; $i <= 3; $i++ ) {
        register_sidebar( array(
            'name'          => sprintf( __( 'Rodapé %d', 'awr-baterias-wc' ), $i ),
            'id'            => 'footer-' . $i,
            'before_widget' => '<section id="%1$s" class="widget %2$s">',
            'after_widget'  => '</section>',
            'before_title'  => '<h3 class="widget-title">',
            'after_title'   => '</h3>',
        ) );
    }
}
add_action( 'widgets_init', 'awrwc_widgets_init' );

/* ---------------------------------------------------------------------------
 * 3. Enqueue (cache-busting via filemtime)
 * ------------------------------------------------------------------------- */
function awrwc_asset_ver( $relative_path ) {
    $full = AWRWC_DIR . '/' . ltrim( $relative_path, '/' );
    if ( file_exists( $full ) ) {
        $mt = @filemtime( $full );
        if ( $mt ) { return AWRWC_VERSION . '.' . $mt; }
    }
    return AWRWC_VERSION;
}

function awrwc_enqueue() {
    // Estilo principal (style.css do tema com cabeçalho).
    wp_enqueue_style( 'awrwc-style', get_stylesheet_uri(), array(), awrwc_asset_ver( 'style.css' ) );

    if ( file_exists( AWRWC_DIR . '/assets/theme.css' ) ) {
        wp_enqueue_style( 'awrwc-theme', AWRWC_URI . '/assets/theme.css', array( 'awrwc-style' ), awrwc_asset_ver( 'assets/theme.css' ) );
    }
    if ( file_exists( AWRWC_DIR . '/assets/theme.js' ) ) {
        wp_enqueue_script( 'awrwc-theme', AWRWC_URI . '/assets/theme.js', array(), awrwc_asset_ver( 'assets/theme.js' ), true );
    }

    // Comentários encadeados.
    if ( is_singular() && comments_open() && get_option( 'thread_comments' ) ) {
        wp_enqueue_script( 'comment-reply' );
    }
}
add_action( 'wp_enqueue_scripts', 'awrwc_enqueue', 20 );

/* ---------------------------------------------------------------------------
 * 4. Limpeza de handles antigos do tema React anterior (awr-baterias)
 * ------------------------------------------------------------------------- */
function awrwc_dequeue_legacy() {
    $legacy = array(
        'awr-app', 'awr-busca', 'awr-baterias', 'awr-baterias-app', 'awr-react', 'awr-bundle',
        'awr-app-v1', 'awr-app-v2', 'awr-app-v3', 'awr-app-v4', 'awr-app-v5', 'awr-app-v6',
    );
    foreach ( $legacy as $h ) {
        if ( wp_script_is( $h, 'enqueued' ) || wp_script_is( $h, 'registered' ) ) {
            wp_dequeue_script( $h ); wp_deregister_script( $h );
        }
        if ( wp_style_is( $h, 'enqueued' ) || wp_style_is( $h, 'registered' ) ) {
            wp_dequeue_style( $h ); wp_deregister_style( $h );
        }
    }
}
add_action( 'wp_enqueue_scripts', 'awrwc_dequeue_legacy', 9999 );
add_action( 'wp_print_scripts',   'awrwc_dequeue_legacy', 9999 );

/* ---------------------------------------------------------------------------
 * 5. Performance: remover emojis / wp-embed para visitantes
 * ------------------------------------------------------------------------- */
function awrwc_disable_emojis() {
    if ( is_admin() ) { return; }
    remove_action( 'wp_head', 'print_emoji_detection_script', 7 );
    remove_action( 'wp_print_styles', 'print_emoji_styles' );
    remove_filter( 'the_content_feed', 'wp_staticize_emoji' );
    remove_filter( 'comment_text_rss', 'wp_staticize_emoji' );
    remove_filter( 'wp_mail', 'wp_staticize_emoji_for_email' );
}
add_action( 'init', 'awrwc_disable_emojis' );

function awrwc_dequeue_embed() {
    if ( ! is_admin() ) { wp_dequeue_script( 'wp-embed' ); }
}
add_action( 'wp_footer', 'awrwc_dequeue_embed' );

/* ---------------------------------------------------------------------------
 * 6. Elementor — registrar Locations (header, footer, single, archive,
 *    single-product, archive-product). Permite ao Elementor Pro Theme Builder
 *    sobrepor templates do tema sem hacks.
 * ------------------------------------------------------------------------- */
function awrwc_register_elementor_locations( $elementor_theme_manager ) {
    $elementor_theme_manager->register_all_core_location();
}
add_action( 'elementor/theme/register_locations', 'awrwc_register_elementor_locations' );

/* ---------------------------------------------------------------------------
 * 7. WooCommerce — wrappers compatíveis com Elementor + tema
 * ------------------------------------------------------------------------- */
function awrwc_wc_wrapper_start() {
    echo '<main id="primary" class="site-main awrwc-wc-main"><div class="awrwc-container">';
}
function awrwc_wc_wrapper_end() {
    echo '</div></main>';
}
function awrwc_wc_wrappers() {
    if ( ! class_exists( 'WooCommerce' ) ) { return; }
    remove_action( 'woocommerce_before_main_content', 'woocommerce_output_content_wrapper', 10 );
    remove_action( 'woocommerce_after_main_content', 'woocommerce_output_content_wrapper_end', 10 );
    add_action( 'woocommerce_before_main_content', 'awrwc_wc_wrapper_start', 10 );
    add_action( 'woocommerce_after_main_content', 'awrwc_wc_wrapper_end', 10 );
}
add_action( 'init', 'awrwc_wc_wrappers' );

/* Mostrar contagem de itens do carrinho ao atualizar via AJAX */
function awrwc_wc_cart_fragment( $fragments ) {
    if ( ! function_exists( 'WC' ) || ! WC()->cart ) { return $fragments; }
    ob_start();
    ?>
    <span class="awrwc-cart-count"><?php echo esc_html( WC()->cart->get_cart_contents_count() ); ?></span>
    <?php
    $fragments['span.awrwc-cart-count'] = ob_get_clean();
    return $fragments;
}
add_filter( 'woocommerce_add_to_cart_fragments', 'awrwc_wc_cart_fragment' );

/* ---------------------------------------------------------------------------
 * 8. Customizer — cor primária, telefone/WhatsApp do header
 * ------------------------------------------------------------------------- */
function awrwc_customize_register( $wp_customize ) {
    $wp_customize->add_section( 'awrwc_brand', array(
        'title'    => __( 'AWR Baterias — Marca', 'awr-baterias-wc' ),
        'priority' => 30,
    ) );

    $wp_customize->add_setting( 'awrwc_primary_color', array(
        'default'           => '#d92121',
        'sanitize_callback' => 'sanitize_hex_color',
        'transport'         => 'refresh',
    ) );
    $wp_customize->add_control( new WP_Customize_Color_Control( $wp_customize, 'awrwc_primary_color', array(
        'label'   => __( 'Cor primária', 'awr-baterias-wc' ),
        'section' => 'awrwc_brand',
    ) ) );

    $wp_customize->add_setting( 'awrwc_phone', array(
        'default'           => '(51) 99319-9486',
        'sanitize_callback' => 'sanitize_text_field',
    ) );
    $wp_customize->add_control( 'awrwc_phone', array(
        'label'   => __( 'Telefone (exibido no header)', 'awr-baterias-wc' ),
        'section' => 'awrwc_brand',
        'type'    => 'text',
    ) );

    $wp_customize->add_setting( 'awrwc_whatsapp', array(
        'default'           => '5551993199486',
        'sanitize_callback' => 'sanitize_text_field',
    ) );
    $wp_customize->add_control( 'awrwc_whatsapp', array(
        'label'       => __( 'WhatsApp (somente números, com DDI)', 'awr-baterias-wc' ),
        'description' => __( 'Ex.: 5551993199486', 'awr-baterias-wc' ),
        'section'     => 'awrwc_brand',
        'type'        => 'text',
    ) );
}
add_action( 'customize_register', 'awrwc_customize_register' );

function awrwc_customizer_css() {
    $primary = get_theme_mod( 'awrwc_primary_color', '#d92121' );
    if ( ! $primary ) { return; }
    echo '<style id="awrwc-customizer">:root{--awrwc-primary:' . esc_html( $primary ) . ';}</style>';
}
add_action( 'wp_head', 'awrwc_customizer_css', 100 );

/* Helpers usados nos templates */
function awrwc_phone() { return get_theme_mod( 'awrwc_phone', '(51) 99319-9486' ); }
function awrwc_whatsapp() { return preg_replace( '/\D/', '', get_theme_mod( 'awrwc_whatsapp', '5551993199486' ) ); }
function awrwc_whatsapp_url( $msg = '' ) {
    $base = 'https://wa.me/' . awrwc_whatsapp();
    return $msg ? $base . '?text=' . rawurlencode( $msg ) : $base;
}

/* ---------------------------------------------------------------------------
 * 9. Templates de página customizados
 * ------------------------------------------------------------------------- */
function awrwc_register_page_templates( $templates ) {
    $templates['page-blank.php'] = __( 'Em branco (Elementor Canvas)', 'awr-baterias-wc' );
    return $templates;
}
add_filter( 'theme_page_templates', 'awrwc_register_page_templates' );
