#!/usr/bin/env bash
# Construye Rizoma (Astro), actualiza el índice de la home de kndl, construye
# Jekyll y embebe Rizoma en _site/rizoma/.
#
# Uso:
#   scripts/build-rizoma.sh
#   RIZOMA_DIR=/ruta/al/repo/rizoma scripts/build-rizoma.sh
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
RIZOMA_DIR="${RIZOMA_DIR:-$ROOT/../rizoma}"
SITE_DIR="${SITE_DIR:-$ROOT/_site}"
BASE="${RIZOMA_BASE:-/rizoma}"
SITE_URL="${RIZOMA_SITE:-https://kndl.quicio.qzz.io}"

if [ ! -d "$RIZOMA_DIR" ]; then
  echo "Rizoma no encontrado en $RIZOMA_DIR" >&2
  echo "Cloná el repo o definí RIZOMA_DIR." >&2
  exit 1
fi

echo "→ Construyendo Rizoma en $RIZOMA_DIR (base $BASE)"
cd "$RIZOMA_DIR"
if [ ! -d node_modules ]; then
  npm ci
fi
RIZOMA_BASE="$BASE" RIZOMA_SITE="$SITE_URL" npm run build

echo "→ Actualizando índice de la home (_data/rizoma_index.json)"
if [ -f "$RIZOMA_DIR/dist/rizoma-index.json" ]; then
  mkdir -p "$ROOT/_data"
  cp "$RIZOMA_DIR/dist/rizoma-index.json" "$ROOT/_data/rizoma_index.json"
else
  echo "Aviso: Rizoma no generó rizoma-index.json; la home usará el índice previo." >&2
fi

echo "→ Construyendo kndl"
cd "$ROOT"
bundle exec jekyll build

echo "→ Copiando Rizoma a $SITE_DIR/rizoma"
rm -rf "$SITE_DIR/rizoma"
mkdir -p "$SITE_DIR/rizoma"
cp -R "$RIZOMA_DIR/dist/." "$SITE_DIR/rizoma/"

echo "OK: Rizoma embebido en $SITE_DIR/rizoma"
