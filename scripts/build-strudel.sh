#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
JAM_DIR="$(dirname "$SCRIPT_DIR")"
STRUDEL_DIR="$(dirname "$JAM_DIR")/strudel"
TARGET_DIR="$JAM_DIR/public/strudel"

echo "==> Building Strudel REPL..."
echo "    Strudel repo: $STRUDEL_DIR"
echo "    Target:       $TARGET_DIR"

if [ ! -d "$STRUDEL_DIR/website" ]; then
  echo "ERROR: Strudel repo not found at $STRUDEL_DIR"
  echo "       Expected the strudel repo to be at ../strudel relative to strudel-jam"
  exit 1
fi

# Build the Strudel website (jsdoc-json is a prerequisite)
cd "$STRUDEL_DIR"
echo "==> Generating jsdoc..."
npm run jsdoc-json

echo "==> Building Astro website with base path /strudel/ ..."
cd "$STRUDEL_DIR/website"
# Set BASE_PATH so Astro builds with the right asset prefix
# This ensures /_astro/ becomes /strudel/_astro/ in the HTML
BASE_PATH="/strudel" npm run build

# Copy dist to our public folder
echo "==> Copying build output..."
rm -rf "$TARGET_DIR"
mkdir -p "$TARGET_DIR"
cp -r "$STRUDEL_DIR/website/dist/"* "$TARGET_DIR/"

echo "==> Done! Strudel REPL bundled into public/strudel/"
echo "    Size: $(du -sh "$TARGET_DIR" | cut -f1)"
