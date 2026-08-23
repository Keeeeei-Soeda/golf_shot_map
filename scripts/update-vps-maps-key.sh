#!/bin/bash
# VPS の NEXT_PUBLIC_GOOGLE_MAPS_API_KEY をローカル shotty/.env.local の値で差し替え、
# build → pm2 restart まで行う。
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ENV_FILE="$ROOT/shotty/.env.local"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "shotty/.env.local がありません" >&2
  exit 1
fi

KEY="$(grep '^NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=' "$ENV_FILE" | cut -d= -f2-)"
if [[ -z "$KEY" ]]; then
  echo "NEXT_PUBLIC_GOOGLE_MAPS_API_KEY が .env.local にありません" >&2
  exit 1
fi

VPS_HOST="${VPS_HOST:-160.251.213.110}"
PEM="${VPS_PEM:-$ROOT/shotty_golf.pem}"
SSH_OPTS=(-o IdentitiesOnly=yes -o StrictHostKeyChecking=accept-new)
if [[ -f "$PEM" ]]; then
  chmod 600 "$PEM" 2>/dev/null || true
  SSH_OPTS+=(-i "$PEM")
  echo "Using PEM: $PEM"
else
  echo "PEM not found ($PEM); trying default ssh key"
fi

echo "Updating Maps key on ${VPS_HOST} (suffix ${KEY: -8}) ..."

ssh "${SSH_OPTS[@]}" "root@${VPS_HOST}" bash -s <<EOF
set -euo pipefail
cd /var/www/shotty/shotty
cp .env.local ".env.local.bak.\$(date +%Y%m%d%H%M%S)"
if grep -q '^NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=' .env.local; then
  sed -i "s|^NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=.*|NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=${KEY}|" .env.local
else
  echo "NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=${KEY}" >> .env.local
fi
grep '^NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=' .env.local | sed 's/=.*/=***REDACTED***/'
npm run build
pm2 restart shotty
pm2 status shotty
EOF

echo "Done."
