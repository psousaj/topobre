# Estágio de build
FROM node:18-slim as builder

WORKDIR /usr/src/app

# Instalar pnpm
RUN npm install -g pnpm

# Copiar arquivos de configuração do monorepo
COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml turbo.json ./

# Copiar dependências dos pacotes
COPY packages packages
COPY config config
COPY apps/worker apps/worker

# Instalar todas as dependências
RUN pnpm install

# Build do worker
RUN pnpm --filter @topobre/worker build

# Estágio de produção
FROM node:18-slim as runner

WORKDIR /usr/src/app

# Instalar pnpm
RUN npm install -g pnpm

# Copiar arquivos de configuração
COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml ./

# Copiar o build do worker do estágio anterior
COPY --from=builder /usr/src/app/apps/worker/dist ./apps/worker/dist
COPY --from=builder /usr/src/app/node_modules ./node_modules

# Instalar dependências de produção
RUN pnpm install --prod

# Expor a porta (se necessário, embora workers geralmente não exponham portas)
# EXPOSE 3001

CMD ["pnpm", "--filter", "@topobre/worker", "start"]
