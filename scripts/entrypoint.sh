#!/bin/sh
set -euo pipefail

THEME_SRC_DIR="/app/themes-src"
THEME_DEST_DIR="/app/themes"

if [ -d "$THEME_SRC_DIR" ]; then
  mkdir -p "$THEME_DEST_DIR"

  for candidate in "$THEME_SRC_DIR"/*; do
    [ -d "$candidate" ] || continue
    name="$(basename "$candidate")"
    dest="$THEME_DEST_DIR/$name"
    rm -rf "$dest"
    cp -R "$candidate" "$dest"
  done
fi

if [ "$#" -gt 0 ]; then
  exec "$@"
else
  exec npm start
fi
