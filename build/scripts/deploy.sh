#!/bin/bash

set -e

ENV_FILE=".env.runtime"

echo "🔧 Gerando .env.runtime com variáveis de ambiente..."
cat > $ENV_FILE <<EOF
# API e Worker
APPDATA=${APPDATA}
API_HOST=${API_HOST}
API_PORT=${API_PORT}
API_COOKIE_SECRET=${API_COOKIE_SECRET}
PGHOST=${PGHOST}
PGUSER=${PGUSER}
PGPASSWORD=${PGPASSWORD}
PGDATABASE=${PGDATABASE}
REDIS_HOST=${REDIS_HOST}
REDIS_PORT=${REDIS_PORT}
REDIS_PASSWORD=${REDIS_PASSWORD}
JWT_SECRET=${JWT_SECRET}
JWT_EXPIRATION=${JWT_EXPIRATION}
GEMINI_API_KEY=${GEMINI_API_KEY}
RESEND_API_KEY=${RESEND_API_KEY}
PROMETHEUS_PORT=${PROMETHEUS_PORT}
OTEL_EXPORTER_OTLP_TRACES=${OTEL_EXPORTER_OTLP_TRACES}
LOKI_ENDPOINT=${LOKI_ENDPOINT}
NODE_ENV=production
NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
WEB_PORT=${WEB_PORT}
IMAGE_TAG=${IMAGE_TAG}
UID=$(id -u)
GID=$(id -g)
EOF

echo "📄 .env.runtime gerado com sucesso:"
cat $ENV_FILE

echo "🏷️ Usando tag da imagem: ${IMAGE_TAG}"
echo "🚀 Subindo containers com docker compose..."

docker compose -f docker-compose.apps.yml pull
docker compose -f docker-compose.apps.yml down -v --remove-orphans
docker compose -f docker-compose.apps.yml up -d

echo "✅ Deploy finalizado com sucesso!"
