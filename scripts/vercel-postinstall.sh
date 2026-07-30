#!/bin/sh
# Yarn's file: protocol strips nested node_modules when packing vendor packages.
# Vercel also strips any path containing "node_modules" from uploaded files.
# This script restores the FontAwesome Pro stubs that vendor/axiom-icons needs.
DEST="node_modules/@optimizely/axiom-icons/dist/esm/node_modules/.pnpm"

mkdir -p "$DEST/@fortawesome_pro-light-svg-icons@6.7.2/node_modules/@fortawesome/pro-light-svg-icons"
cp vendor/fa-stubs/pro-light.mjs \
  "$DEST/@fortawesome_pro-light-svg-icons@6.7.2/node_modules/@fortawesome/pro-light-svg-icons/index.mjs"

mkdir -p "$DEST/@fortawesome_pro-solid-svg-icons@6.7.2/node_modules/@fortawesome/pro-solid-svg-icons"
cp vendor/fa-stubs/pro-solid.mjs \
  "$DEST/@fortawesome_pro-solid-svg-icons@6.7.2/node_modules/@fortawesome/pro-solid-svg-icons/index.mjs"
