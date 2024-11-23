# Estágio de build
FROM node:18-slim as builder

WORKDIR /usr/src/app

# Instalar pnpm
RUN npm install -g pnpm

# Copiar arquivos de dependência
COPY package.json pnpm-lock.yaml* ./

# Instalar dependências incluindo as devDependencies necessárias para o build
RUN pnpm install

# Copiar código fonte e arquivos de configuração
COPY . .

# Gerar o build
RUN pnpm build

# Estágio de produção
FROM node:18-slim as runner

WORKDIR /usr/src/app

# Instalar pnpm
RUN npm install -g pnpm

# Copiar apenas os arquivos necessários do estágio de build
COPY --from=builder /usr/src/app/package.json ./
COPY --from=builder /usr/src/app/pnpm-lock.yaml* ./
COPY --from=builder /usr/src/app/dist ./dist

# Instalar apenas dependências de produção
RUN pnpm install --prod

ARG CLERK_PUBLISHABLE_KEY
ENV CLERK_PUBLISHABLE_KEY=$CLERK_PUBLISHABLE_KEY

# Expor a porta
EXPOSE 3001

# Comando para iniciar a aplicação
CMD ["pnpm", "start"]