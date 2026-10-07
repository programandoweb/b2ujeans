#!/usr/bin/env bash
set -Eeuo pipefail

BRANCH="b2ujeans"
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
COMPOSE_FILE="${ROOT_DIR}/docker-compose.b2u.yml"
ENV_FILE="${ROOT_DIR}/backend/.env"
LOCK_FILE="/tmp/b2ujeans-deploy.lock"

log() {
  printf '\n[%s] %s\n' "$(date '+%Y-%m-%d %H:%M:%S')" "$*"
}

fail() {
  printf '\n[ERROR] %s\n' "$*" >&2
  exit 1
}

for command in git docker curl; do
  command -v "$command" >/dev/null 2>&1 || fail "Falta el comando requerido: $command"
done

docker compose version >/dev/null 2>&1 || fail "Docker Compose v2 no está disponible."
[[ -f "$ENV_FILE" ]] || fail "No existe backend/.env. El despliegue nunca crea ni sobrescribe secretos."
[[ -f "$COMPOSE_FILE" ]] || fail "No existe docker-compose.b2u.yml."

if command -v flock >/dev/null 2>&1; then
  exec 9>"$LOCK_FILE"
  flock -n 9 || fail "Ya existe otro despliegue de B2U en ejecución."
fi

cd "$ROOT_DIR"

log "Sincronizando rama $BRANCH"
git fetch origin "$BRANCH"
git checkout "$BRANCH"
git reset --hard "origin/$BRANCH"

APP_KEY_VALUE="$(grep -m1 '^APP_KEY=' "$ENV_FILE" | cut -d= -f2- || true)"
[[ -n "$APP_KEY_VALUE" ]] || fail "APP_KEY está vacía. Configúrala antes de desplegar."
BASE64_COUNT="$(printf '%s' "$APP_KEY_VALUE" | grep -o 'base64:' | wc -l | tr -d ' ')"
[[ "$BASE64_COUNT" -le 1 ]] || fail "APP_KEY contiene más de un prefijo base64:. Corrige backend/.env antes de desplegar."

COMPOSE=(docker compose --env-file "$ENV_FILE" -p public -f "$COMPOSE_FILE")

# Compatibilidad con el primer despliegue manual previo a docker-compose.b2u.yml.
if docker container inspect b2ujeans-frontend >/dev/null 2>&1; then
  EXISTING_PROJECT="$(docker inspect -f '{{ index .Config.Labels "com.docker.compose.project" }}' b2ujeans-frontend 2>/dev/null || true)"
  if [[ "$EXISTING_PROJECT" != "public" ]]; then
    log "Retirando contenedor frontend manual anterior"
    docker rm -f b2ujeans-frontend
  fi
fi

log "Construyendo backend, realtime y frontend"
"${COMPOSE[@]}" build b2u-backend b2u-realtime b2u-frontend

log "Levantando MariaDB"
"${COMPOSE[@]}" up -d b2u-mariadb

log "Levantando backend PHP-FPM con configuración actual"
"${COMPOSE[@]}" up -d --force-recreate b2u-backend

log "Preparando directorios escribibles de Laravel"
"${COMPOSE[@]}" exec -T -u root b2u-backend sh -lc \
  'mkdir -p bootstrap/cache storage/framework/cache/data storage/framework/sessions storage/framework/views storage/logs && chown -R www-data:www-data bootstrap/cache storage && chmod -R ug+rwX bootstrap/cache storage'

log "Instalando dependencias PHP"
"${COMPOSE[@]}" exec -T b2u-backend composer install --no-dev --optimize-autoloader --no-interaction

log "Limpiando cachés Laravel"
"${COMPOSE[@]}" exec -T b2u-backend php artisan optimize:clear

log "Aplicando migraciones"
"${COMPOSE[@]}" exec -T b2u-backend php artisan migrate --force

log "Ejecutando seeders idempotentes"
"${COMPOSE[@]}" exec -T b2u-backend php artisan db:seed --force

log "Generando cachés de producción"
"${COMPOSE[@]}" exec -T b2u-backend php artisan config:cache
"${COMPOSE[@]}" exec -T b2u-backend php artisan view:cache

# Composer/Artisan pueden volver a crear archivos como root durante el despliegue.
# La normalización final debe ocurrir DESPUÉS de todos esos pasos para que
# PHP-FPM (www-data) pueda escribir caché, sesiones, vistas y logs.
log "Normalizando permisos Laravel después de Composer, seeders y caches"
"${COMPOSE[@]}" exec -T -u root b2u-backend sh -lc '
  mkdir -p storage/framework/cache/data storage/framework/sessions storage/framework/views storage/logs bootstrap/cache
  chown -R www-data:www-data storage bootstrap/cache
  find storage bootstrap/cache -type d -exec chmod 775 {} \;
  find storage bootstrap/cache -type f -exec chmod 664 {} \;
'
"${COMPOSE[@]}" exec -T -u www-data b2u-backend php artisan optimize:clear
"${COMPOSE[@]}" exec -T -u www-data b2u-backend php artisan permission:cache-reset
"${COMPOSE[@]}" exec -T -u www-data b2u-backend php artisan config:cache
"${COMPOSE[@]}" exec -T -u www-data b2u-backend php artisan view:cache

log "Publicando Nginx backend, agentes realtime y frontend"
"${COMPOSE[@]}" up -d --force-recreate b2u-backend-nginx b2u-realtime b2u-frontend

log "Esperando health del backend"
BACKEND_OK=0
for _ in $(seq 1 30); do
  if curl -fsS http://127.0.0.1:6501/api/v1/health >/dev/null; then
    BACKEND_OK=1
    break
  fi
  sleep 2
done
[[ "$BACKEND_OK" -eq 1 ]] || fail "Backend B2U no respondió correctamente en el puerto 6501."

log "Esperando health del frontend"
FRONTEND_OK=0
for _ in $(seq 1 45); do
  if curl -fsS http://127.0.0.1:6500/ >/dev/null; then
    FRONTEND_OK=1
    break
  fi
  sleep 2
done
[[ "$FRONTEND_OK" -eq 1 ]] || fail "Frontend B2U no respondió correctamente en el puerto 6500."

DEPLOYED_SHA="$(git rev-parse HEAD)"
log "Despliegue B2U completado: $DEPLOYED_SHA"
"${COMPOSE[@]}" ps
