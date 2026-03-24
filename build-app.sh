#!/bin/bash
# build-app.sh — Build rivo-web and copy output into /app for GitHub Pages deployment
# Run this locally from the rivo_landing directory.
set -e

RIVO_WEB_DIR="${1:-../rivo_web}"

if [ ! -d "$RIVO_WEB_DIR" ]; then
  echo "Error: rivo-web directory not found at '$RIVO_WEB_DIR'"
  echo "Usage: ./build-app.sh [path/to/rivo_web]"
  exit 1
fi

echo "==> Building Flutter web from $RIVO_WEB_DIR ..."
cd "$RIVO_WEB_DIR"
flutter pub get
flutter build web --release --base-href /app/
cd - > /dev/null

echo "==> Copying build output to /app/ ..."
rm -rf app
cp -r "$RIVO_WEB_DIR/build/web" app

echo "==> Done. Run the following to deploy:"
echo "    git add app/ && git commit -m 'chore: update app build' && git push"
