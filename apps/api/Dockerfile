# ========= 🚧 Build Stage =========
FROM node:18-slim AS builder

WORKDIR /app

# Instalar dependências do sistema
RUN apt-get update && apt-get install -y \
    openssl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Instalar pnpm
RUN npm install -g pnpm

# Copiar arquivos de dependência da raíz do monorepo
COPY ../../pnpm-lock.yaml ../../package.json ./
COPY ../../pnpm-workspace.yaml ./  
COPY ../../apps/api ./apps/api
COPY ../../packages ./packages

# Instalar todas as dependências com os workspaces
RUN pnpm install

# Gerar build apenas da API
RUN pnpm build:api

# ========= ✅ Production Stage =========
FROM node:18-slim AS runner

WORKDIR /app

# Instalar dependências do sistema
RUN apt-get update && apt-get install -y \
    openssl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Instalar pnpm
RUN npm install -g pnpm

# Copiar arquivos necessários da build
COPY --from=builder /app/apps/api/package.json ./apps/api/package.json
COPY --from=builder /app/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=builder /app/pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/api/dist ./apps/api/dist

# Porta padrão da API
EXPOSE 3003

# Entrar na pasta da API antes de iniciar
WORKDIR /app/apps/api

# Start em produção
CMD ["pnpm", "start:api"]
