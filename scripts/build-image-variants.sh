#!/usr/bin/env bash
# Genera derivados WebP 480w y 960w para las placas de Imaginario.
# Idempotente por mtime: no regenera si el derivado es más nuevo que la fuente.
set -euo pipefail

cd "$(dirname "$0")/.."

if ! command -v cwebp >/dev/null 2>&1; then
  echo "cwebp no está instalado. Instala webp (brew install webp) y vuelve a intentar." >&2
  exit 1
fi

count=0
for md in content/collections/_images/*.md; do
  src=$(awk -F': *' '/^image:/{print $2; exit}' "$md")
  [ -n "$src" ] || continue
  src="${src#/}"
  [ -f "$src" ] || { echo "Falta la imagen de $md: $src" >&2; continue; }
  base="${src%.*}"
  for width in 480 960; do
    out="${base}-${width}.webp"
    if [ -f "$out" ] && [ "$out" -nt "$src" ]; then
      continue
    fi
    cwebp -quiet -q 82 -resize "$width" 0 "$src" -o "$out"
    count=$((count + 1))
  done
done

echo "Derivados generados/actualizados: $count"
