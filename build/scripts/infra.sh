#!/bin/bash
set -e

export APPDATA=${APPDATA}
export REDIS_PASSWORD=${REDIS_PASSWORD}
export NODE_ENV=production

echo "🚀 Subindo containers de infraestrutura com docker compose..."

docker compose -f docker-compose.infra.yml pull
docker compose -f docker-compose.infra.yml down -v --remove-orphans
docker compose -f docker-compose.infra.yml up -d

echo "✅ Deploy da infraestrutura finalizado com sucesso!"
