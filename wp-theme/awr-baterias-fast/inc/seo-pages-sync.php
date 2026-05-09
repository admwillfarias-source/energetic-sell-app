<?php
/**
 * AWR — Sincronização automática de páginas WP a partir do mapa SEO.
 *
 * Para cada rota em awr_seo_routes() cria (se não existir) uma página WP
 * com o mesmo path, conteúdo [awr_app] e título/descrição do mapa.
 *
 * Uso (uma vez, ou após adicionar rotas novas):
 *   1) Logar como administrador no WP.
 *   2) Acessar:  /?awr_sync_seo_pages=1&token=SEGREDO
 *      (defina AWR_SYNC_TOKEN no wp-config.php; default: 'awr-sync')
 *
 * Idempotente: roda quantas vezes quiser, só cria o que falta.
 */
if ( ! defined( 'ABSPATH' ) ) { exit; }

if ( ! defined( 'AWR_SYNC_TOKEN' ) ) { define( 'AWR_SYNC_TOKEN', 'awr-sync' ); }

/**
 * Garante uma página WP com o path informado, hierarquia criada conforme
 * necessário. Retorna o ID da página final.
 */
function awr_ensure_page_for_path( $path, $title, $description = '' ) {
    $path  = '/' . trim( $path, '/' );
    if ( $path === '/' ) {
        // Home tratada à parte (geralmente já existe).
        $front = (int) get_option( 'page_on_front' );
        return $front ?: 0;
    }

    $segments = array_values( array_filter( explode( '/', $path ) ) );
    $parent_id = 0;
    $current_path = '';
    $last_id = 0;

    foreach ( $segments as $i => $slug ) {
        $current_path .= ( $i === 0 ? '' : '/' ) . $slug;
        $is_leaf = ( $i === count( $segments ) - 1 );

        // get_page_by_path espera path completo a partir da raiz.
        $existing = get_page_by_path( $current_path, OBJECT, 'page' );
        if ( $existing && $existing->post_status !== 'trash' ) {
            $last_id   = (int) $existing->ID;
            $parent_id = $last_id;
            // Se for folha e estiver vazia/draft, garante conteúdo + publish.
            if ( $is_leaf ) {
                $needs_update = false;
                $update = array( 'ID' => $last_id );
                if ( $existing->post_status !== 'publish' ) {
                    $update['post_status'] = 'publish';
                    $needs_update = true;
                }
                if ( strpos( (string) $existing->post_content, '[awr_app' ) === false ) {
                    $update['post_content'] = '[awr_app]';
                    $needs_update = true;
                }
                if ( $title && $existing->post_title !== $title ) {
                    $update['post_title'] = $title;
                    $needs_update = true;
                }
                if ( $needs_update ) { wp_update_post( $update ); }
                if ( $description ) {
                    update_post_meta( $last_id, '_awr_seo_description', $description );
                }
            }
            continue;
        }

        $post_id = wp_insert_post( array(
            'post_title'   => $is_leaf && $title ? $title : ucfirst( str_replace( '-', ' ', $slug ) ),
            'post_name'    => $slug,
            'post_status'  => 'publish',
            'post_type'    => 'page',
            'post_parent'  => $parent_id,
            'post_content' => $is_leaf ? '[awr_app]' : '[awr_app]',
        ), true );

        if ( is_wp_error( $post_id ) ) {
            return 0;
        }
        if ( $is_leaf && $description ) {
            update_post_meta( $post_id, '_awr_seo_description', $description );
        }
        $last_id   = (int) $post_id;
        $parent_id = $last_id;
    }

    return $last_id;
}

function awr_sync_seo_pages_run() {
    if ( ! function_exists( 'awr_seo_routes' ) ) {
        return array( 'error' => 'awr_seo_routes() não disponível.' );
    }
    $map = awr_seo_routes();
    $created = 0; $updated = 0; $skipped = 0; $errors = array();

    foreach ( $map as $path => $meta ) {
        if ( $path === '/' ) { $skipped++; continue; }
        $before = get_page_by_path( ltrim( $path, '/' ), OBJECT, 'page' );
        $id = awr_ensure_page_for_path( $path, $meta['title'] ?? '', $meta['description'] ?? '' );
        if ( ! $id ) { $errors[] = $path; continue; }
        if ( $before ) { $updated++; } else { $created++; }
    }

    return array(
        'total'   => count( $map ),
        'created' => $created,
        'updated' => $updated,
        'skipped' => $skipped,
        'errors'  => $errors,
    );
}

function awr_sync_seo_pages_endpoint() {
    if ( empty( $_GET['awr_sync_seo_pages'] ) ) { return; }
    if ( ! current_user_can( 'manage_options' ) ) {
        wp_die( 'Acesso negado.', 'AWR sync', array( 'response' => 403 ) );
    }
    $token = isset( $_GET['token'] ) ? sanitize_text_field( wp_unslash( $_GET['token'] ) ) : '';
    if ( ! hash_equals( AWR_SYNC_TOKEN, $token ) ) {
        wp_die( 'Token inválido.', 'AWR sync', array( 'response' => 403 ) );
    }
    nocache_headers();
    header( 'Content-Type: application/json; charset=utf-8' );
    echo wp_json_encode( awr_sync_seo_pages_run(), JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE );
    exit;
}
add_action( 'init', 'awr_sync_seo_pages_endpoint' );
