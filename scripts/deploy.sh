#!/bin/bash

set -e

echo "🔧 Exportando variáveis de ambiente..."

export NEXT_PUBLIC_API_URL="${NEXT_PUBLIC_API_URL}"
export NODE_ENV="${NODE_ENV}"
export COOKIE_SECRET="${COOKIE_SECRET}"
export GEMINI_API_KEY="${GEMINI_API_KEY}"
export HOST="${HOST}"
export JWT_SECRET="${JWT_SECRET}"
export OTEL_EXPORTER_OTLP_TRACES_ENDPOINT="${OTEL_EXPORTER_OTLP_TRACES_ENDPOINT}"
export PGDATABASE="${PGDATABASE}"
export PGHOST="${PGHOST}"
export PGPASSWORD="${PGPASSWORD}"
export PGUSER="${PGUSER}"
export PORT="${PORT}"
export UPSTASH_REDIS_URL="${UPSTASH_REDIS_URL}"
export REDIS_PASSWORD="${REDIS_PASSWORD}"
export RESEND_API_KEY="${RESEND_API_KEY}"

echo "🚀 Subindo containers com docker compose..."

docker compose -f docker-compose.apps.yml pull
docker compose -f docker-compose.apps.yml down -v
docker compose -f docker-compose.apps.yml up -d

echo "🚀 Containers rodando com sucesso!"