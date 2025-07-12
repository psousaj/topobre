#!/bin/bash

set -e

echo "🔧 Exportando variáveis de ambiente..."
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

docker compose -f docker-compose.apps.yml pull
docker compose -f docker-compose.apps.yml down -v --remove-orphans
docker compose -f docker-compose.apps.yml up -d

echo "✅ Deploy finalizado com sucesso!"