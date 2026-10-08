#!/usr/bin/env bash
set -Eeuo pipefail

BRANCH="main"
ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
COMPOSE_FILE="$ROOT_DIR/docker-compose.b2u.yml"
ENV_FILE="$ROOT_DIR/backend/.env"
LOCK_FILE="/tmp/b2ujeans-fast-deploy.lock"

log(){ printf '\n[%s] %s\n' "$(date '+%Y-%m-%d %H:%M:%S')" "$*"; }
fail(){ printf '\n[ERROR] %s\n' "$*" >&2; exit 1; }
dc(){ docker compose --env-file "$ENV_FILE" -p public -f "$COMPOSE_FILE" "$@"; }

for command in git docker curl; do
  command -v "$command" >/dev/null 2>&1 || fail "Falta el comando requerido: $command"
done

docker compose version >/dev/null 2>&1 || fail "Docker Compose v2 no está disponible."
[[ -f "$ENV_FILE" ]] || fail "No existe backend/.env."
[[ -f "$COMPOSE_FILE" ]] || fail "No existe docker-compose.b2u.yml."

if command -v flock >/dev/null 2>&1; then
  exec 9>"$LOCK_FILE"
  flock -n 9 || fail "Ya existe otro despliegue rápido de B2U en ejecución."
fi

cd "$ROOT_DIR"

OLD_SHA="$(git rev-parse HEAD)"
log "Consultando cambios remotos de $BRANCH"
git fetch https://github.com/programandoweb/b2ujeans.git "$BRANCH"
NEW_SHA="$(git rev-parse FETCH_HEAD)"

if [[ "$OLD_SHA" == "$NEW_SHA" ]]; then
  log "No hay cambios nuevos. Nada que desplegar."
  exit 0
fi

CHANGED="$(git diff --name-only "$OLD_SHA" "$NEW_SHA" || true)"

if printf '%s\n' "$CHANGED" | grep -Eq '^(docker-compose\.b2u\.yml|deploy-b2ujeans\.sh|backend/docker/|frontend/Dockerfile|realtime/Dockerfile)'; then
  fail "Hay cambios de infraestructura/Docker. Usa el despliegue completo: bash $ROOT_DIR/deploy-b2ujeans.sh"
fi

log "Actualizando código"
git checkout -B "$BRANCH" "$NEW_SHA"
git reset --hard "$NEW_SHA"

FRONTEND_CHANGED=0
BACKEND_CHANGED=0
REALTIME_CHANGED=0

printf '%s\n' "$CHANGED" | grep -q '^frontend/' && FRONTEND_CHANGED=1 || true
printf '%s\n' "$CHANGED" | grep -q '^backend/' && BACKEND_CHANGED=1 || true
printf '%s\n' "$CHANGED" | grep -q '^realtime/' && REALTIME_CHANGED=1 || true

if [[ "$BACKEND_CHANGED" -eq 1 ]]; then
  log "Aplicando cambios backend sin reconstruir todo el stack"

  if printf '%s\n' "$CHANGED" | grep -Eq '^backend/(composer\.json|composer\.lock)$'; then
    log "Composer cambió; actualizando dependencias"
    dc exec -T b2u-backend composer install --no-dev --optimize-autoloader --no-interaction
  fi

  dc exec -T -u www-data b2u-backend php artisan optimize:clear

  if printf '%s\n' "$CHANGED" | grep -q '^backend/database/migrations/'; then
    log "Aplicando migraciones"
    dc exec -T -u www-data b2u-backend php artisan migrate --force
  fi

  if printf '%s\n' "$CHANGED" | grep -q '^backend/database/seeders/'; then
    log "Ejecutando seeders"
    dc exec -T -u www-data b2u-backend php artisan db:seed --force
  fi

  dc exec -T -u www-data b2u-backend php artisan config:cache
  dc exec -T -u www-data b2u-backend php artisan view:cache
fi

if [[ "$REALTIME_CHANGED" -eq 1 ]]; then
  log "Construyendo solamente realtime"
  dc build b2u-realtime
  dc up -d --no-deps --force-recreate b2u-realtime
fi

if [[ "$FRONTEND_CHANGED" -eq 1 ]]; then
  log "Construyendo solamente frontend"
  dc build b2u-frontend
  dc up -d --no-deps --force-recreate b2u-frontend
fi

if [[ "$BACKEND_CHANGED" -eq 0 && "$REALTIME_CHANGED" -eq 0 && "$FRONTEND_CHANGED" -eq 0 ]]; then
  log "Solo cambiaron archivos de documentación u otros archivos sin servicio asociado."
fi

if [[ "$BACKEND_CHANGED" -eq 1 ]]; then
  log "Verificando backend"
  curl -fsS http://127.0.0.1:6501/api/v1/health >/dev/null || fail "Backend no respondió correctamente."
fi

if [[ "$FRONTEND_CHANGED" -eq 1 ]]; then
  log "Verificando frontend"
  FRONTEND_OK=0
  for _ in $(seq 1 30); do
    if curl -fsS http://127.0.0.1:6500/ >/dev/null; then
      FRONTEND_OK=1
      break
    fi
    sleep 2
  done
  [[ "$FRONTEND_OK" -eq 1 ]] || fail "Frontend no respondió correctamente."
fi

log "Despliegue rápido completado: $NEW_SHA"
printf '%s\n' "$CHANGED"
