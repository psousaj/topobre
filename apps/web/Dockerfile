# ========= 🚧 Build Stage =========
FROM node:18-slim AS builder

WORKDIR /app

# Instalar dependências básicas
RUN apt-get update && apt-get install -y \
    openssl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Instalar pnpm
RUN npm install -g pnpm

# Copiar dependências da raiz do monorepo
COPY ../../pnpm-lock.yaml ../../package.json ./
COPY ../../apps/web ./apps/web
COPY ../../packages ./packages
COPY ../../tsconfig.json ./

# Instalar dependências com os workspaces
RUN pnpm install

# Definir variável pública do Next.js
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# Gerar build da web
RUN pnpm build:web


# ========= ✅ Production Stage =========
FROM node:18-slim AS runner

WORKDIR /app

# Instalar dependências básicas
RUN apt-get update && apt-get install -y \
    openssl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Instalar pnpm
RUN npm install -g pnpm

# Copiar apenas os artefatos necessários
COPY --from=builder /app/apps/web/package.json ./apps/web/package.json
COPY --from=builder /app/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/web/.next ./apps/web/.next
COPY --from=builder /app/apps/web/public ./apps/web/public
COPY --from=builder /app/apps/web/next.config.js ./apps/web/next.config.js

# Definir variáveis de ambiente
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# Porta do Next.js
EXPOSE 3000

# Entrar na pasta correta
WORKDIR /app/apps/web

# Rodar em produção
CMD ["pnpm", "start:web"]
