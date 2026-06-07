#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [ -f .env ]; then
  DATABASE_URL="$(grep -E '^DATABASE_URL=' .env | cut -d= -f2- | tr -d "'\"")"
fi

if [ -z "${DATABASE_URL:-}" ]; then
  echo "DATABASE_URL is required in .env for neon:push"
  exit 1
fi

for migration in neon/migrations/*.sql; do
  echo "Applying $(basename "$migration")..."
  psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f "$migration"
done

echo "Neon migrations applied."
