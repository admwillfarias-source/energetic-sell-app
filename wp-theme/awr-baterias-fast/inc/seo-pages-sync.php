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

function awr_sync_seo_pages_run( $dry_run = false ) {
    if ( ! function_exists( 'awr_seo_routes' ) ) {
        return array( 'error' => 'awr_seo_routes() não disponível.' );
    }
    $map = awr_seo_routes();
    $created = 0; $updated = 0; $skipped = 0; $errors = array();
    $will_create = array(); $will_update = array();

    foreach ( $map as $path => $meta ) {
        if ( $path === '/' ) { $skipped++; continue; }
        $before = get_page_by_path( ltrim( $path, '/' ), OBJECT, 'page' );

        if ( $dry_run ) {
            if ( $before ) {
                // Detecta se um update real seria necessário.
                $needs = false;
                if ( $before->post_status !== 'publish' ) { $needs = true; }
                if ( strpos( (string) $before->post_content, '[awr_app' ) === false ) { $needs = true; }
                if ( ! empty( $meta['title'] ) && $before->post_title !== $meta['title'] ) { $needs = true; }
                if ( $needs ) { $updated++; $will_update[] = $path; } else { $skipped++; }
            } else {
                $created++; $will_create[] = $path;
            }
            continue;
        }

        $id = awr_ensure_page_for_path( $path, $meta['title'] ?? '', $meta['description'] ?? '' );
        if ( ! $id ) { $errors[] = $path; continue; }
        if ( $before ) { $updated++; } else { $created++; }
    }

    $out = array(
        'dry_run' => (bool) $dry_run,
        'total'   => count( $map ),
        'created' => $created,
        'updated' => $updated,
        'skipped' => $skipped,
        'errors'  => $errors,
    );
    if ( $dry_run ) {
        $out['will_create'] = $will_create;
        $out['will_update'] = $will_update;
    }
    return $out;
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
    $dry = ! empty( $_GET['dry_run'] );
    nocache_headers();
    header( 'Content-Type: application/json; charset=utf-8' );
    echo wp_json_encode( awr_sync_seo_pages_run( $dry ), JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE );
    exit;
}
add_action( 'init', 'awr_sync_seo_pages_endpoint' );

/* ============================================================
 * WP-CLI:  wp awr sync-seo-pages [--token=...] [--dry-run] [--format=table|json]
 * ============================================================ */
if ( defined( 'WP_CLI' ) && WP_CLI ) {

    class AWR_Sync_SEO_CLI {

        /**
         * Cria/atualiza páginas WP a partir do mapa awr_seo_routes().
         *
         * ## OPTIONS
         *
         * [--token=<token>]
         * : Token de segurança (precisa bater com AWR_SYNC_TOKEN). Opcional via CLI
         *   pois o usuário já está autenticado pelo shell, mas aceito por simetria
         *   com o endpoint HTTP.
         *
         * [--dry-run]
         * : Não grava nada — apenas lista o que seria criado/atualizado.
         *
         * [--format=<format>]
         * : table (default) | json | yaml | csv
         *
         * ## EXAMPLES
         *
         *     wp awr sync-seo-pages --dry-run
         *     wp awr sync-seo-pages --token=awr-sync
         *     wp awr sync-seo-pages --dry-run --format=json
         */
        public function sync_seo_pages( $args, $assoc ) {
            if ( isset( $assoc['token'] ) && ! hash_equals( AWR_SYNC_TOKEN, (string) $assoc['token'] ) ) {
                WP_CLI::error( 'Token inválido.' );
            }
            $dry    = ! empty( $assoc['dry-run'] );
            $format = isset( $assoc['format'] ) ? $assoc['format'] : 'table';

            $res = awr_sync_seo_pages_run( $dry );
            if ( ! empty( $res['error'] ) ) { WP_CLI::error( $res['error'] ); }

            $prefix = $dry ? '[DRY-RUN] ' : '';
            WP_CLI::log( sprintf(
                '%stotal=%d  created=%d  updated=%d  skipped=%d  errors=%d',
                $prefix,
                $res['total'], $res['created'], $res['updated'], $res['skipped'], count( $res['errors'] )
            ) );

            if ( $dry ) {
                $rows = array();
                foreach ( ( $res['will_create'] ?? array() ) as $p ) { $rows[] = array( 'action' => 'create', 'path' => $p ); }
                foreach ( ( $res['will_update'] ?? array() ) as $p ) { $rows[] = array( 'action' => 'update', 'path' => $p ); }
                if ( $rows ) {
                    \WP_CLI\Utils\format_items( $format, $rows, array( 'action', 'path' ) );
                } else {
                    WP_CLI::success( 'Nada para fazer — todas as rotas já existem e estão em dia.' );
                }
            } else {
                if ( $res['errors'] ) {
                    WP_CLI::warning( 'Falhas em: ' . implode( ', ', $res['errors'] ) );
                } else {
                    WP_CLI::success( 'Sync concluído sem erros.' );
                }
            }
        }
    }

    WP_CLI::add_command( 'awr sync-seo-pages', array( 'AWR_Sync_SEO_CLI', 'sync_seo_pages' ) );
}
