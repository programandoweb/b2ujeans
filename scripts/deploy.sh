#!/usr/bin/env bash
set -Eeuo pipefail

ROOT="/var/www/gaspronal.programandoweb.net"
COMPOSE_FILE="$ROOT/docker-compose.yml"
ENV_FILE="$ROOT/.env.docker"
LOCK_DIR="/tmp/gaspronal-deploy.lock"

cleanup() {
  rmdir "$LOCK_DIR" 2>/dev/null || true
}
trap cleanup EXIT

if ! mkdir "$LOCK_DIR" 2>/dev/null; then
  echo "[deploy] Ya existe otro despliegue en ejecución."
  exit 75
fi

if [[ ! -d "$ROOT/.git" ]]; then
  echo "[deploy] No existe un repositorio Git en $ROOT."
  exit 2
fi

if [[ ! -f "$COMPOSE_FILE" ]]; then
  echo "[deploy] No existe $COMPOSE_FILE."
  exit 2
fi

if [[ ! -f "$ENV_FILE" ]]; then
  echo "[deploy] Falta $ENV_FILE. Copia .env.docker.example y configura sus valores."
  exit 2
fi

if [[ ! -f "$ROOT/backend/.env" ]]; then
  echo "[deploy] Falta $ROOT/backend/.env."
  exit 2
fi

compose() {
  docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" "$@"
}

echo "[deploy] Inicio: $(date -Is)"
echo "[deploy] Actualizando rama main..."

git -c safe.directory="$ROOT" -C "$ROOT" fetch origin main
BEFORE="$(git -c safe.directory="$ROOT" -C "$ROOT" rev-parse HEAD)"
git -c safe.directory="$ROOT" -C "$ROOT" reset --hard origin/main
AFTER="$(git -c safe.directory="$ROOT" -C "$ROOT" rev-parse HEAD)"

echo "[deploy] Revisión: $BEFORE -> $AFTER"

echo "[backend] Verificando contenedor..."
compose ps backend

echo "[backend] Instalando dependencias PHP..."
compose exec -T backend composer install   --no-dev   --prefer-dist   --no-interaction   --optimize-autoloader

echo "[backend] Ejecutando migraciones..."
compose exec -T backend php artisan migrate --force

echo "[backend] Refrescando cachés..."
compose exec -T backend php artisan optimize:clear
compose exec -T backend php artisan optimize

echo "[backend] Corrigiendo permisos persistentes..."
compose exec -T -u root backend sh -lc   'mkdir -p storage/framework/cache/data storage/framework/sessions storage/framework/views storage/logs bootstrap/cache && chown -R www-data:www-data storage bootstrap/cache'

echo "[nginx] Validando y recargando configuración..."
compose exec -T backend-nginx nginx -t
compose exec -T backend-nginx nginx -s reload

echo "[frontend] Construyendo imagen Next.js..."
compose build --pull frontend

echo "[frontend] Publicando nueva imagen..."
compose up -d --no-deps frontend

echo "[health] Backend..."
curl --fail --silent --show-error --max-time 15 http://backend-nginx/api/v1/health
echo

echo "[health] Frontend..."
curl --fail --silent --show-error --max-time 20 http://frontend:3000/login >/dev/null

echo "[deploy] Estado de servicios:"
compose ps

echo "[deploy] Finalizado correctamente: $(date -Is)"
