#!/bin/bash
# VPS デプロイ前の .env.local 必須項目チェック
set -e
ENV_FILE="${1:-.env.local}"

if [ ! -f "$ENV_FILE" ]; then
  echo "ERROR: $ENV_FILE not found"
  exit 1
fi

missing=0
check_var() {
  local name="$1"
  if ! grep -q "^${name}=" "$ENV_FILE" 2>/dev/null; then
    echo "MISSING: $name"
    missing=1
    return
  fi
  local val
  val=$(grep "^${name}=" "$ENV_FILE" | cut -d= -f2- | tr -d '"' | tr -d "'")
  if [ -z "$val" ]; then
    echo "EMPTY: $name"
    missing=1
  fi
}

check_var DATABASE_URL
check_var AUTH_SECRET
check_var NEXTAUTH_URL

if [ "$missing" -eq 1 ]; then
  echo ""
  echo "Fix $ENV_FILE on VPS. See shotty/.env.example"
  exit 1
fi

echo "OK: required env vars present in $ENV_FILE"
