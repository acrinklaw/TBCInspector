#!/usr/bin/env bash
set -euo pipefail

ADDON_DIR="addon/TBCInspector"
TOC_FILE="$ADDON_DIR/TBCInspector.toc"
DIST_DIR="dist"

if [ ! -f "$TOC_FILE" ]; then
  echo "Error: $TOC_FILE not found" >&2
  exit 1
fi

# Extract version from the .toc file
VERSION=$(grep -oP '## Version:\s*\K\S+' "$TOC_FILE")
if [ -z "$VERSION" ]; then
  echo "Error: could not read version from $TOC_FILE" >&2
  exit 1
fi

ZIP_NAME="TBCInspector-${VERSION}.zip"

mkdir -p "$DIST_DIR"

# Create the zip with the TBCInspector folder at the root (as WoW expects)
cd addon
zip -r "../$DIST_DIR/$ZIP_NAME" TBCInspector/
cd ..

echo "Built $DIST_DIR/$ZIP_NAME"
