#!/usr/bin/env bash
set -Eeuo pipefail

ROOT="/var/www/gaspronal.programandoweb.net"

cd "$ROOT"
exec bash "$ROOT/scripts/deploy.sh"
