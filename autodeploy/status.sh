#!/usr/bin/env bash
set -Eeuo pipefail

BASE_URL="${AUTODEPLOY_URL:-https://backend.gaspronal.programandoweb.net}"
TOKEN="${AUTODEPLOY_TOKEN:-}"
DEPLOYMENT_ID="${1:-}"

if [[ -z "$TOKEN" || -z "$DEPLOYMENT_ID" ]]; then
  echo "Uso: AUTODEPLOY_TOKEN=... $0 <deployment_id>" >&2
  exit 2
fi

curl --fail-with-body --silent --show-error \
  "$BASE_URL/api/v1/autodeploy/deployments/$DEPLOYMENT_ID" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer $TOKEN"
echo
