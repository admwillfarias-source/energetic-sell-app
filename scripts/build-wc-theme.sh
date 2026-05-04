#!/usr/bin/env bash
# Build do tema WordPress clássico (WooCommerce + Elementor).
set -euo pipefail
cd "$(dirname "$0")/.."

THEME_DIR="wp-theme/awr-baterias-wc"
ZIP_OUT="wp-theme/awr-baterias-wc.zip"

echo "▶ 1/3 Validando sintaxe PHP..."
if command -v php >/dev/null 2>&1; then
    find "$THEME_DIR" -name '*.php' -print0 | xargs -0 -n1 php -l > /tmp/awrwc-lint.log
    echo "  ok"
else
    echo "  (php não instalado no sandbox; pulando lint)"
fi

echo "▶ 2/3 Empacotando..."
rm -f "$ZIP_OUT"
( cd wp-theme && zip -rq awr-baterias-wc.zip awr-baterias-wc -x "*.DS_Store" )

echo "▶ 3/3 Copiando para /mnt/documents..."
mkdir -p /mnt/documents
cp "$ZIP_OUT" /mnt/documents/awr-baterias-wc.zip

echo ""
echo "✓ Tema pronto: $ZIP_OUT"
echo "  Cópia para download: /mnt/documents/awr-baterias-wc.zip"
