#!/usr/bin/env bash
# Patch the Strudel REPL build with Strudel Jam customizations:
# - Bridge script for parent/iframe communication
# - CSS to hide REPL toolbar and play overlay
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
INDEX="$1"  # path to public/strudel/index.html

if [ ! -f "$INDEX" ]; then
  echo "Error: $INDEX not found"
  exit 1
fi

BRIDGE_JS="$SCRIPT_DIR/strudel-bridge.js"

# CSS to inject into <head>
CUSTOM_CSS='<style>/* Strudel Jam: hide REPL header toolbar and big play overlay */
#header {
  position: absolute !important;
  top: -9999px !important;
  left: -9999px !important;
  height: 0 !important;
  overflow: hidden !important;
}
button.fixed.text-2xl { display: none !important; }
</style>'

# Inject custom CSS before </head>
# Use perl for reliable multi-line replacement
perl -i -pe "s|</head>|${CUSTOM_CSS}\n</head>|" "$INDEX"

# Inject bridge script before </body>
BRIDGE_CONTENT=$(cat "$BRIDGE_JS")
# Use a temp file approach for the script injection (content is too large for sed)
python3 -c "
import sys
bridge = open('$BRIDGE_JS').read()
html = open('$INDEX').read()
patched = html.replace('</body>', '<script>\n' + bridge + '\n</script>\n</body>')
open('$INDEX', 'w').write(patched)
"

echo "Patched $INDEX with Strudel Jam bridge and custom CSS"
