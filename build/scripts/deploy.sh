#!/bin/bash

set -e

ENV_FILE=".env.runtime"

echo "🔧 Gerando .env.runtime com variáveis de ambiente..."
cat > $ENV_FILE <<EOF
# API e Worker
API_HOST=${API_HOST}
API_PORT=${API_PORT}
WEB_PORT=${WEB_PORT}
PGHOST=${PGHOST}
PGUSER=${PGUSER}
PGPASSWORD=${PGPASSWORD}
PGDATABASE=${PGDATABASE}
REDIS_PASSWORD=${REDIS_PASSWORD}
UPSTASH_REDIS_URL=${UPSTASH_REDIS_URL}
JWT_SECRET=${JWT_SECRET}
JWT_EXPIRATION=${JWT_EXPIRATION}
API_COOKIE_SECRET=${API_COOKIE_SECRET}
GEMINI_API_KEY=${GEMINI_API_KEY}
RESEND_API_KEY=${RESEND_API_KEY}
PROMETHEUS_PORT=${PROMETHEUS_PORT}
OTEL_EXPORTER_OTLP_TRACES=${OTEL_EXPORTER_OTLP_TRACES}
NODE_ENV=production
NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
IMAGE_TAG=${IMAGE_TAG}
EOF

echo "📄 .env.runtime gerado com sucesso:"
cat $ENV_FILE

echo "🏷️ Usando tag da imagem: ${IMAGE_TAG}"
echo "🚀 Subindo containers com docker compose..."

docker compose -f docker-compose.apps.yml pull
docker compose -f docker-compose.apps.yml down -v --remove-orphans
docker compose -f docker-compose.apps.yml up -d

echo "✅ Deploy finalizado com sucesso!"
