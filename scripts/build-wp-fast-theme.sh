#!/usr/bin/env bash
# Empacota o tema awr-baterias-fast em um zip pronto para upload no WordPress.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SRC="$ROOT/wp-theme/awr-baterias-fast"
OUT_DIR="$ROOT/wp-theme/dist"
OUT="$OUT_DIR/awr-baterias-fast.zip"

if [ ! -d "$SRC" ]; then
    echo "ERRO: pasta do tema não encontrada em $SRC" >&2
    exit 1
fi

mkdir -p "$OUT_DIR"
rm -f "$OUT"

cd "$ROOT/wp-theme"
zip -r "$OUT" "awr-baterias-fast" \
    -x "awr-baterias-fast/.DS_Store" \
    -x "awr-baterias-fast/*/.DS_Store"

echo ""
echo "Tema empacotado: $OUT"
echo "Tamanho: $(du -h "$OUT" | cut -f1)"
echo ""
echo "Suba em WordPress → Aparência → Temas → Adicionar novo → Enviar tema."
