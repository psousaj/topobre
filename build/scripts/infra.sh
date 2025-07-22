#!/bin/bash

set -e

ENV_FILE=".env.runtime"

echo "🔧 Gerando .env.runtime com variáveis de ambiente..."
cat > $ENV_FILE <<EOF
# Infraestrutura
APPDATA=${APPDATA}
REDIS_PASSWORD=${REDIS_PASSWORD}
NODE_ENV=production
UID=$(id -u)
GID=$(id -g)
EOF

echo "📄 .env.runtime gerado com sucesso:"
cat $ENV_FILE

echo "🚀 Subindo containers de infraestrutura com docker compose..."

docker compose -f docker-compose.infra.yml --env-file $ENV_FILE pull
docker compose -f docker-compose.infra.yml --env-file $ENV_FILE down -v --remove-orphans
docker compose -f docker-compose.infra.yml --env-file $ENV_FILE up -d

echo "✅ Deploy da infraestrutura finalizado com sucesso!"
