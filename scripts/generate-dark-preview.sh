#!/usr/bin/env bash
# Generate the maintained dark thumbnail with the pinned Jaunder browser.
set -euo pipefail

: "${JAUNDER_BIN:?set JAUNDER_BIN to the pinned jaunder executable}"
: "${JAUNDER_THEME_THUMBNAIL_BROWSER:?set JAUNDER_THEME_THUMBNAIL_BROWSER to the pinned Chromium executable}"

repository="$(mktemp -d)"
trap 'rm -rf "$repository"' EXIT
cp -R theme.json style.css assets "$repository/"
# Jaunder's canonical thumbnail is explicitly captured with media=screen. Build
# a temporary valid package where the generated dark media block always applies;
# no package source is changed and Chromium remains the pinned Jaunder browser.
sed 's/@media (prefers-color-scheme:dark){/@media all{/' style.css >"$repository/style.css"
"$JAUNDER_BIN" theme thumbnail "$repository" --browser "$JAUNDER_THEME_THUMBNAIL_BROWSER" --output preview-dark.png
