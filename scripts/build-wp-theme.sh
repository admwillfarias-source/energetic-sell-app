#!/usr/bin/env bash
# Build completo do tema WordPress.
# Uso: bash scripts/build-wp-theme.sh
set -euo pipefail
cd "$(dirname "$0")/.."

echo "▶ 1/4 Limpando..."
rm -rf wp-theme/awr-baterias/assets wp-theme/awr-baterias/widget
rm -f wp-theme/awr-baterias.zip

echo "▶ 2/4 Build do app React (Vite → assets/)..."
npx vite build --config vite.config.wordpress.ts

echo "▶ 3/4 Build do widget de busca (Vite → widget/)..."
npx vite build --config vite.config.widget.ts

echo "▶ 4/4 Gerando mapa SEO server-side..."
npx tsx scripts/generate-seo-routes.ts

# Copia robots.txt, sitemap e og-image para a raiz do tema (servidos pelo WP).
mkdir -p wp-theme/awr-baterias/public
[ -f public/robots.txt ]  && cp public/robots.txt  wp-theme/awr-baterias/public/
[ -f public/sitemap.xml ] && cp public/sitemap.xml wp-theme/awr-baterias/public/
[ -f public/og-image.jpg ] && cp public/og-image.jpg wp-theme/awr-baterias/

# Empacota.
( cd wp-theme && zip -r awr-baterias.zip awr-baterias -x "*.DS_Store" )

echo ""
echo "✓ Tema pronto: wp-theme/awr-baterias.zip"
echo "  Instalação: WordPress → Aparência → Temas → Adicionar → Enviar tema"
