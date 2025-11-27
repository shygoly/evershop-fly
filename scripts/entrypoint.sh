#!/bin/sh
set -eu

# Schema Creation Logic
if [ -n "${DB_SCHEMA:-}" ] && [ -n "${DATABASE_URL:-}" ]; then
  echo "Checking schema: ${DB_SCHEMA}"
  # Use psql to create schema if it doesn't exist
  # We use the DATABASE_URL which is standard for Fly Postgres
  if command -v psql >/dev/null 2>&1; then
    echo "Creating schema ${DB_SCHEMA} if not exists..."
    psql "${DATABASE_URL}" -c "CREATE SCHEMA IF NOT EXISTS \"${DB_SCHEMA}\";" || echo "Warning: Schema creation failed (might already exist or permission issue)"
  else
    echo "Warning: psql not found, skipping schema creation"
  fi
fi

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
