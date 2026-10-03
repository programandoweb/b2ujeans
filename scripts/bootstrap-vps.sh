#!/usr/bin/env bash
set -Eeuo pipefail
umask 077

PROJECT_ROOT="/var/www/gaspronal.programandoweb.net"
DOCKER_ENV="$PROJECT_ROOT/.env.docker"
BACKEND_ENV="$PROJECT_ROOT/backend/.env"
FRONTEND_ENV="$PROJECT_ROOT/frontend/.env"

log() {
  printf '\n[%s] %s\n' "$(date -Is)" "$*"
}

die() {
  printf '\n[ERROR] %s\n' "$*" >&2
  exit 1
}

require_root() {
  [[ "$(id -u)" -eq 0 ]] || die "Ejecuta este instalador como root o con sudo."
}

random_secret() {
  openssl rand -hex 32
}

install_base_packages() {
  log "Instalando dependencias base..."

  if command -v apt-get >/dev/null 2>&1; then
    export DEBIAN_FRONTEND=noninteractive
    apt-get update
    apt-get install -y ca-certificates curl git openssh-client openssl
  elif command -v dnf >/dev/null 2>&1; then
    dnf install -y ca-certificates curl git openssh-clients openssl
  elif command -v yum >/dev/null 2>&1; then
    yum install -y ca-certificates curl git openssh-clients openssl gh
  else
    die "Sistema no soportado automáticamente."
  fi
}

install_docker() {
  if command -v docker >/dev/null 2>&1 && docker compose version >/dev/null 2>&1; then
    log "Docker y Docker Compose ya están disponibles."
    return
  fi

  log "Instalando Docker Engine y Docker Compose..."
  curl -fsSL https://get.docker.com | sh
  systemctl enable --now docker

  docker version >/dev/null
  docker compose version >/dev/null
}

create_environment() {
  log "Creando configuración inicial..."

  local db_password db_root_password app_url backend_url admin_email admin_password
  db_password="$(random_secret)"
  db_root_password="$(random_secret)"

  app_url="${GASPRONAL_URL:-https://gaspronal.programandoweb.net}"
  backend_url="${GASPRONAL_BACKEND_URL:-https://backend.gaspronal.programandoweb.net}"
  admin_email="${ADMIN_EMAIL:-lic.jorgemendez@gmail.com}"
  admin_password="${ADMIN_PASSWORD:-}"

  if [[ -t 0 ]]; then
    local admin_email_input
    read -rp "Correo del administrador inicial [$admin_email] (opcional, escribe '-' para dejarlo vacío): " admin_email_input
    if [[ "$admin_email_input" == "-" ]]; then
      admin_email=""
    elif [[ -n "$admin_email_input" ]]; then
      admin_email="$admin_email_input"
    fi
  fi

  if [[ -n "$admin_email" && -z "$admin_password" ]]; then
    admin_password="$(openssl rand -base64 24 | tr -d '\n' | tr '/+' 'Aa')"
  fi

  if [[ ! -f "$DOCKER_ENV" ]]; then
    cat > "$DOCKER_ENV" <<EOF
COMPOSE_PROJECT_NAME=gaspronal
FRONTEND_PORT=${FRONTEND_PORT:-3000}
BACKEND_PORT=${BACKEND_PORT:-8080}
NEXT_PUBLIC_SITE_URL=$app_url

DB_DATABASE=gaspronal
DB_USERNAME=gaspronal
DB_PASSWORD=$db_password
DB_ROOT_PASSWORD=$db_root_password

DOCKER_GID=$(stat -c '%g' /var/run/docker.sock)
DEPLOYMENT_TIMEOUT=1800
EOF
    chmod 600 "$DOCKER_ENV"
  fi

  if [[ ! -f "$BACKEND_ENV" ]]; then
    cp "$PROJECT_ROOT/backend/.env.example" "$BACKEND_ENV"
    chmod 600 "$BACKEND_ENV"

    sed -i \
      -e 's/^APP_ENV=.*/APP_ENV=production/' \
      -e 's/^APP_DEBUG=.*/APP_DEBUG=false/' \
      -e "s|^APP_URL=.*|APP_URL=$backend_url|" \
      -e 's/^DB_HOST=.*/DB_HOST=mariadb/' \
      -e 's/^DB_DATABASE=.*/DB_DATABASE=gaspronal/' \
      -e 's/^DB_USERNAME=.*/DB_USERNAME=gaspronal/' \
      -e "s|^DB_PASSWORD=.*|DB_PASSWORD=$db_password|" \
      -e "s|^FRONTEND_URL=.*|FRONTEND_URL=$app_url|" \
      -e 's/^DEPLOYMENT_ENABLED=.*/DEPLOYMENT_ENABLED=true/' \
      -e 's/^DEPLOYMENT_USE_SUDO=.*/DEPLOYMENT_USE_SUDO=true/' \
      "$BACKEND_ENV"

    if [[ -n "$admin_email" ]]; then
      sed -i \
        -e "s|^ADMIN_EMAIL=.*|ADMIN_EMAIL=$admin_email|" \
        -e "s|^ADMIN_PASSWORD=.*|ADMIN_PASSWORD=$admin_password|" \
        "$BACKEND_ENV"
    fi
  fi

  cat > "$FRONTEND_ENV" <<EOF
NEXT_PUBLIC_SITE_URL=$app_url
LARAVEL_API_URL=http://backend-nginx
EOF
  chmod 600 "$FRONTEND_ENV"

  if [[ -n "$admin_email" && -n "$admin_password" ]]; then
    printf '\n[admin] Usuario inicial: %s\n' "$admin_email"
    printf '[admin] Contraseña inicial: %s\n' "$admin_password"
    printf '[admin] Cambia esta contraseña después del primer acceso.\n'
  fi
}

repair_backend_env() {
  [[ -f "$BACKEND_ENV" ]] || return

  if grep -q '^ADMIN_NAME=Administrador Gaspronal$' "$BACKEND_ENV"; then
    log "Corrigiendo ADMIN_NAME en backend/.env..."
    sed -i 's/^ADMIN_NAME=Administrador Gaspronal$/ADMIN_NAME="Administrador Gaspronal"/' "$BACKEND_ENV"
  fi
}

port_in_use() {
  local port="$1"
  ss -H -ltn 2>/dev/null | awk '{print $4}' | grep -Eq "(^|:)$port$"
}

port_owned_by_gaspronal() {
  local port="$1"
  docker ps --format '{{.Names}} {{.Ports}}' 2>/dev/null \
    | grep -E '^gaspronal-' \
    | grep -Eq "[:.]$port->|0\.0\.0\.0:$port->|\[::\]:$port->"
}

next_free_port() {
  local port="$1"
  while port_in_use "$port" && ! port_owned_by_gaspronal "$port"; do
    port=$((port + 1))
  done
  printf '%s' "$port"
}

set_docker_env_value() {
  local key="$1"
  local value="$2"

  if grep -q "^$key=" "$DOCKER_ENV"; then
    sed -i "s|^$key=.*|$key=$value|" "$DOCKER_ENV"
  else
    printf '%s=%s\n' "$key" "$value" >> "$DOCKER_ENV"
  fi
}

ensure_host_ports() {
  local backend_port frontend_port new_backend_port new_frontend_port

  backend_port="$(grep '^BACKEND_PORT=' "$DOCKER_ENV" | cut -d= -f2-)"
  frontend_port="$(grep '^FRONTEND_PORT=' "$DOCKER_ENV" | cut -d= -f2-)"

  backend_port="${backend_port:-8080}"
  frontend_port="${frontend_port:-3000}"

  new_backend_port="$(next_free_port "$backend_port")"
  new_frontend_port="$(next_free_port "$frontend_port")"

  if [[ "$new_backend_port" != "$backend_port" ]]; then
    log "Puerto backend $backend_port ocupado; usando $new_backend_port."
    set_docker_env_value BACKEND_PORT "$new_backend_port"
  fi

  if [[ "$new_frontend_port" != "$frontend_port" ]]; then
    log "Puerto frontend $frontend_port ocupado; usando $new_frontend_port."
    set_docker_env_value FRONTEND_PORT "$new_frontend_port"
  fi
}

compose() {
  docker compose --env-file "$DOCKER_ENV" -f "$PROJECT_ROOT/docker-compose.yml" "$@"
}

initial_install() {
  log "Construyendo e instalando servicios..."
  cd "$PROJECT_ROOT"

  compose pull mariadb backend-nginx
  compose build --pull backend frontend
  compose up -d mariadb backend backend-nginx

  log "Esperando MariaDB..."
  local attempt root_password
  root_password="$(grep '^DB_ROOT_PASSWORD=' "$DOCKER_ENV" | cut -d= -f2-)"

  for attempt in $(seq 1 60); do
    if compose exec -T mariadb mariadb-admin ping \
      -h 127.0.0.1 \
      -uroot \
      -p"$root_password" \
      --silent >/dev/null 2>&1; then
      break
    fi

    [[ "$attempt" -lt 60 ]] || die "MariaDB no quedó disponible."
    sleep 2
  done

  log "Preparando directorios Laravel..."
  compose exec -T -u root backend sh -lc \
    'mkdir -p storage/framework/cache/data storage/framework/sessions storage/framework/views storage/logs bootstrap/cache resources/views && chown -R www-data:www-data storage bootstrap/cache resources/views && chmod -R ug+rwX storage bootstrap/cache resources/views'

  log "Instalando backend Laravel..."
  compose exec -T backend composer install \
    --no-dev \
    --prefer-dist \
    --no-interaction \
    --optimize-autoloader

  if ! grep -q '^APP_KEY=base64:' "$BACKEND_ENV"; then
    compose exec -T backend php artisan key:generate --force
  fi

  if ! grep -Eq '^JWT_SECRET=.{20,}$' "$BACKEND_ENV"; then
    compose exec -T backend php artisan jwt:secret --force
  fi

  compose exec -T backend php artisan migrate --force
  compose exec -T backend php artisan db:seed --force
  compose exec -T backend php artisan optimize:clear
  compose exec -T backend php artisan optimize

  compose exec -T -u root backend sh -lc \
    'mkdir -p storage/framework/cache/data storage/framework/sessions storage/framework/views storage/logs bootstrap/cache && chown -R www-data:www-data storage bootstrap/cache && chmod -R ug+rwX storage bootstrap/cache'

  log "Iniciando frontend Next.js..."
  compose up -d frontend

  log "Validando servicios..."
  compose ps

  local backend_port frontend_port
  backend_port="$(grep '^BACKEND_PORT=' "$DOCKER_ENV" | cut -d= -f2-)"
  frontend_port="$(grep '^FRONTEND_PORT=' "$DOCKER_ENV" | cut -d= -f2-)"

  curl --fail --silent --show-error --max-time 20 \
    "http://127.0.0.1:$backend_port/api/v1/health"
  printf '\n'

  curl --fail --silent --show-error --max-time 30 \
    "http://127.0.0.1:$frontend_port/login" >/dev/null

  log "Instalación inicial completada."
  printf '\nProyecto: %s\n' "$PROJECT_ROOT"
  printf 'Autodespliegue: %s/scripts/deploy.sh\n' "$PROJECT_ROOT"
}

main() {
  require_root

  [[ -d "$PROJECT_ROOT/.git" ]] || die "No existe un repositorio Git preparado en $PROJECT_ROOT. Ejecuta primero el inicializador público."

  install_base_packages
  install_docker
  create_environment
  repair_backend_env
  ensure_host_ports
  initial_install
}

main "$@"
