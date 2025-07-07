# ========= 🚧 Build Stage =========
FROM node:18-slim AS builder

WORKDIR /topobre

# Instalar pnpm
RUN npm install -g pnpm

# Copiar configs de workspace
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./

# Copiar pacotes e app do worker
COPY ./packages ./packages
COPY ./config ./config
COPY ./apps/worker ./apps/worker
COPY . ./

# Instalar dependências com workspaces
RUN pnpm install

# Gerar build do worker
RUN pnpm build:worker


# ========= ✅ Production Stage =========
FROM node:18-slim AS runner

WORKDIR /topobre

# Instalar pnpm
RUN npm install -g pnpm

# Copiar apenas o necessário
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY --from=builder /topobre/node_modules ./node_modules
COPY --from=builder /topobre/apps/worker/dist ./apps/worker/dist
COPY --from=builder . ./

# Instalar só as dependências de produção
RUN pnpm install

# Definir comando de entrada
CMD ["pnpm", "start:worker"]
