# ========= 🚧 Build Stage =========
FROM node:18-slim AS builder

WORKDIR /topobre

# Instalar dependências do sistema
RUN apt-get update && apt-get install -y \
    openssl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Instalar pnpm
RUN npm install -g pnpm

# Copiar arquivos de dependência da raíz do monorepo
COPY ./pnpm-lock.yaml ./package.json ./
COPY ./pnpm-workspace.yaml ./  
COPY ./apps/api ./apps/api
COPY ./packages ./packages
COPY . ./

# Instalar todas as dependências com os workspaces
RUN pnpm install

# Gerar build apenas da API
RUN pnpm build:api


# ========= ✅ Production Stage =========
FROM node:18-slim AS runner

WORKDIR /topobre

# Instalar dependências do sistema
RUN apt-get update && apt-get install -y \
openssl \
ca-certificates \
&& rm -rf /var/lib/apt/lists/*

# Instalar pnpm
RUN npm install -g pnpm

# Copiar arquivos necessários da build
COPY --from=builder /topobre/apps/api/package.json ./apps/api/package.json
COPY --from=builder /topobre/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=builder /topobre/pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY --from=builder /topobre/node_modules ./node_modules
COPY --from=builder /topobre/apps/api/dist ./apps/api/dist
COPY --from=builder /topobre ./

# Porta padrão da API
EXPOSE 3003

# Entrar na pasta da API antes de iniciar
# WORKDIR /topobre/apps/api

# Start em produção
CMD ["pnpm", "start:api"]
