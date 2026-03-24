#!/bin/bash
# build-app.sh — Build rivo-web and copy output into /app for GitHub Pages deployment
set -e

echo "==> Updating submodule..."
git submodule update --init --remote rivo-web

echo "==> Building Flutter web..."
cd rivo-web
flutter pub get
flutter build web --release --base-href /app/
cd ..

echo "==> Copying build output to /app..."
rm -rf app
cp -r rivo-web/build/web app

echo "==> Done. Commit and push rivo_landing to deploy."
echo "    git add app/ && git commit -m 'chore: update app build' && git push"
