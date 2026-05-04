<?php
/**
 * Geração das tags SEO server-side (title, meta description, Open Graph,
 * Twitter, canonical e JSON-LD). Resolve a URL atual contra o mapa
 * inc/seo-routes.php (gerado pelo build) e, em fallback, imprime
 * dados padrão da AWR Baterias.
 */
if ( ! defined( 'ABSPATH' ) ) { exit; }

function awr_current_path() {
    $p = isset( $_SERVER['REQUEST_URI'] ) ? wp_parse_url( $_SERVER['REQUEST_URI'], PHP_URL_PATH ) : '/';
    $p = '/' . trim( (string) $p, '/' );
    return $p === '' ? '/' : $p;
}

function awr_default_seo() {
    return array(
        'title'       => 'AWR Baterias — Entrega e instalação grátis em Gravataí, Porto Alegre e região',
        'description' => 'Baterias automotivas Moura, Heliar, Zetta e Excell com entrega e instalação grátis em até 35 minutos. Garantia de fábrica, nota fiscal e retirada da bateria antiga inclusa.',
        'image'       => 'https://awrbaterias.com.br/og-image.jpg',
        'type'        => 'website',
    );
}

function awr_resolve_seo() {
    $path = awr_current_path();
    if ( function_exists( 'awr_seo_routes' ) ) {
        $map = awr_seo_routes();
        if ( isset( $map[ $path ] ) ) {
            return array_merge( awr_default_seo(), $map[ $path ] );
        }
    }
    return awr_default_seo();
}

function awr_local_business_jsonld() {
    return array(
        '@context'    => 'https://schema.org',
        '@type'       => 'AutoPartsStore',
        'name'        => 'AWR Baterias',
        'image'       => 'https://awrbaterias.com.br/og-image.jpg',
        'telephone'   => '+55 51 99319-9486',
        'priceRange'  => 'R$ 340 - R$ 1.800',
        'address'     => array(
            '@type'           => 'PostalAddress',
            'streetAddress'   => 'Av. Dorival Cândido Luz de Oliveira, 6390',
            'addressLocality' => 'Gravataí',
            'addressRegion'   => 'RS',
            'postalCode'      => '94130-000',
            'addressCountry'  => 'BR',
        ),
        'areaServed'  => array( 'Gravataí', 'Porto Alegre', 'Cachoeirinha', 'Canoas', 'Alvorada', 'Viamão', 'Sapucaia do Sul' ),
        'openingHours'=> 'Mo-Su 08:00-22:00',
        'url'         => home_url( '/' ),
    );
}

function awr_print_seo_tags() {
    $seo  = awr_resolve_seo();
    $path = awr_current_path();
    $url  = home_url( $path );

    echo "\n<!-- AWR SEO -->\n";
    echo '<title>' . esc_html( $seo['title'] ) . "</title>\n";
    echo '<meta name="description" content="' . esc_attr( $seo['description'] ) . "\" />\n";
    echo '<meta name="robots" content="index,follow,max-image-preview:large" />' . "\n";
    echo '<link rel="canonical" href="' . esc_url( $url ) . "\" />\n";

    echo '<meta property="og:title" content="' . esc_attr( $seo['title'] ) . "\" />\n";
    echo '<meta property="og:description" content="' . esc_attr( $seo['description'] ) . "\" />\n";
    echo '<meta property="og:type" content="' . esc_attr( $seo['type'] ) . "\" />\n";
    echo '<meta property="og:url" content="' . esc_url( $url ) . "\" />\n";
    echo '<meta property="og:image" content="' . esc_url( $seo['image'] ) . "\" />\n";
    echo '<meta property="og:site_name" content="AWR Baterias" />' . "\n";
    echo '<meta property="og:locale" content="pt_BR" />' . "\n";

    echo '<meta name="twitter:card" content="summary_large_image" />' . "\n";
    echo '<meta name="twitter:title" content="' . esc_attr( $seo['title'] ) . "\" />\n";
    echo '<meta name="twitter:description" content="' . esc_attr( $seo['description'] ) . "\" />\n";
    echo '<meta name="twitter:image" content="' . esc_url( $seo['image'] ) . "\" />\n";

    // JSON-LD: LocalBusiness sempre + extras específicos da rota
    $ld = array( awr_local_business_jsonld() );
    if ( ! empty( $seo['jsonLd'] ) ) {
        $ld[] = $seo['jsonLd'];
    }
    foreach ( $ld as $obj ) {
        echo '<script type="application/ld+json">' . wp_json_encode( $obj, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE ) . "</script>\n";
    }
}
