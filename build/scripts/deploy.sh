#!/bin/bash

set -e

echo "🔧 Exportando variáveis de ambiente..."

ENV_FILE=".env.runtime"

cat > $ENV_FILE <<EOF
NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
NODE_ENV=${NODE_ENV}
COOKIE_SECRET=${COOKIE_SECRET}
GEMINI_API_KEY=${GEMINI_API_KEY}
HOST=${HOST}
JWT_SECRET=${JWT_SECRET}
OTEL_EXPORTER_OTLP_TRACES_ENDPOINT=${OTEL_EXPORTER_OTLP_TRACES_ENDPOINT}
PGDATABASE=${PGDATABASE}
PGHOST=${PGHOST}
PGPASSWORD=${PGPASSWORD}
PGUSER=${PGUSER}
PORT=${PORT}
UPSTASH_REDIS_URL=${UPSTASH_REDIS_URL}
REDIS_PASSWORD=${REDIS_PASSWORD}
RESEND_API_KEY=${RESEND_API_KEY}
IMAGE_TAG=${IMAGE_TAG}
EOF

echo "📄 .env gerado com sucesso:"
cat $ENV_FILE
echo "🏷️ Usando tag da imagem: ${IMAGE_TAG}"
echo "🚀 Subindo containers com docker compose..."

echo "🐛 DEBUG: Testando leitura das variáveis do ambiente"
echo "PGHOST=$PGHOST"
echo "PGDATABASE=$PGDATABASE"
echo "PGUSER=$PGUSER"
echo "PGPASSWORD=$PGPASSWORD"
echo "RESEND_API_KEY=$RESEND_API_KEY"
echo "JWT_SECRET=$JWT_SECRET"
echo "COOKIE_SECRET=$COOKIE_SECRET"
echo "OTEL_EXPORTER_OTLP_TRACES_ENDPOINT=$OTEL_EXPORTER_OTLP_TRACES_ENDPOINT"
echo "NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL"
echo "IMAGE_TAG=$IMAGE_TAG"
echo "NODE_ENV=$NODE_ENV"

docker compose --env-file $ENV_FILE -f docker-compose.apps.yml pull
docker compose --env-file $ENV_FILE -f docker-compose.apps.yml down -v --remove-orphans
docker compose --env-file $ENV_FILE -f docker-compose.apps.yml up -d

echo "✅ Deploy finalizado com sucesso!"