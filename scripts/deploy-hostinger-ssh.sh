#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

HOST="${HOSTINGER_SSH_HOST:-145.223.108.222}"
PORT="${HOSTINGER_SSH_PORT:-65002}"
USER="${HOSTINGER_SSH_USER:-u116729353}"
REMOTE="${HOSTINGER_SSH_PATH:-domains/artzens.com/public_html}"

echo "Building static export..."
npm run build

echo "Deploying to ${USER}@${HOST}:${REMOTE} ..."
rsync -avz --delete -e "ssh -p ${PORT}" out/ "${USER}@${HOST}:${REMOTE}/"

echo "Done. Site deployed to https://artzens.com"
