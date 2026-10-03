#!/usr/bin/env bash
set -Eeuo pipefail

# Copiar este archivo fuera del repositorio, por ejemplo:
# /var/www/deploy-gaspronal.sh
# y apuntar DEPLOYMENT_SCRIPT a esa ruta.
#
# Nunca guardar credenciales dentro de este script versionado.

ROOT="/var/www/gaspronal"

echo "[deploy] Inicio $(date -Is)"
cd "$ROOT"

echo "[deploy] Actualizando código..."
git fetch origin main
git reset --hard origin/main

echo "[backend] Dependencias y migraciones..."
cd "$ROOT/backend"
composer install --no-dev --prefer-dist --no-interaction --optimize-autoloader
php8.2 artisan migrate --force
php8.2 artisan optimize

echo "[frontend] Dependencias y build..."
cd "$ROOT/frontend"
npm ci
npm run build

# Adaptar aquí el reinicio real del runtime:
# sudo systemctl reload php8.2-fpm
# docker compose up -d --build
# pm2 restart gaspronal-frontend

echo "[deploy] Finalizado $(date -Is)"
