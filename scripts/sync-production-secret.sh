#!/usr/bin/env bash
set -euo pipefail

NAMESPACE="media-prod"
SECRET_NAME="media-generation-secrets"

: "${GEMINI_API_KEY:?GEMINI_API_KEY is required}"
: "${SUPABASE_URL:?SUPABASE_URL is required}"
: "${SUPABASE_SERVICE_ROLE_KEY:?SUPABASE_SERVICE_ROLE_KEY is required}"
: "${MEDIA_STORAGE_BUCKET:?MEDIA_STORAGE_BUCKET is required}"

command -v sudo >/dev/null
test -x /usr/local/sbin/platform-kubectl

printf '%s\n' \
  "GEMINI_API_KEY=${GEMINI_API_KEY}" \
  "SUPABASE_URL=${SUPABASE_URL}" \
  "SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY}" \
  "MEDIA_STORAGE_BUCKET=${MEDIA_STORAGE_BUCKET}" |
  sudo /usr/local/sbin/platform-kubectl create secret generic "${SECRET_NAME}" \
    -n "${NAMESPACE}" \
    --from-env-file=/dev/stdin \
    --dry-run=client \
    -o yaml |
  sudo /usr/local/sbin/platform-kubectl apply -f -

echo "Synchronized Kubernetes secret ${NAMESPACE}/${SECRET_NAME}."
