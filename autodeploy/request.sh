#!/usr/bin/env bash
set -Eeuo pipefail

BASE_URL="${AUTODEPLOY_URL:-https://backend.gaspronal.programandoweb.net}"
TOKEN="${AUTODEPLOY_TOKEN:-}"

if [[ -z "$TOKEN" ]]; then
  echo "Falta AUTODEPLOY_TOKEN en el entorno." >&2
  exit 2
fi

curl --fail-with-body --silent --show-error \
  -X POST "$BASE_URL/api/v1/autodeploy/deploy" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer $TOKEN"
echo
