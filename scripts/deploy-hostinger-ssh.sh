#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

HOST="${HOSTINGER_SSH_HOST:-145.223.108.222}"
PORT="${HOSTINGER_SSH_PORT:-65002}"
USER="${HOSTINGER_SSH_USER:-u116729353}"
REMOTE="${HOSTINGER_SSH_PATH:-domains/artzens.com/public_html}"

# Load public env for static bake (Shopify checkout domain, etc.)
if [[ -f .env.local ]]; then
  set -a
  # shellcheck disable=SC1091
  source <(grep -E '^(NEXT_PUBLIC_|ARTZENS_)' .env.local | sed 's/\r$//' || true)
  set +a
fi
export NEXT_PUBLIC_SITE_URL="${NEXT_PUBLIC_SITE_URL:-https://artzens.com}"
export NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN="${NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN:-store.artzens.com}"

echo "Syncing Shopify variant ids…"
npm run catalog:sync-variant-ids

echo "Building static export (Shopify domain: ${NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN})..."
npm run build

echo "Deploying to ${USER}@${HOST}:${REMOTE} ..."
rsync -avz --delete -e "ssh -p ${PORT} -o StrictHostKeyChecking=accept-new" out/ "${USER}@${HOST}:${REMOTE}/"

echo "Done. Site deployed to https://artzens.com"
