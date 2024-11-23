# Estágio de build
FROM node:18-slim as builder

WORKDIR /usr/src/app

# Instalar pnpm
RUN npm install -g pnpm

# Copiar arquivos de dependência
COPY package.json pnpm-lock.yaml* ./
COPY prisma ./prisma/

# Instalar dependências incluindo as devDependencies necessárias para o build
RUN pnpm install

# Gerar o cliente Prisma
RUN pnpm dlx prisma generate

# Copiar código fonte e arquivos de configuração
COPY . .

# Gerar o build
RUN pnpm build

# Estágio de produção
FROM node:18-slim as runner

WORKDIR /usr/src/app

# Instalar pnpm
RUN npm install -g pnpm

# Copiar arquivos necessários do estágio de build
COPY --from=builder /usr/src/app/package.json ./
COPY --from=builder /usr/src/app/pnpm-lock.yaml* ./
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/prisma ./prisma
COPY --from=builder /usr/src/app/node_modules/.pnpm/@prisma+client@5.22.0_prisma@5.22.0/node_modules/.prisma ./node_modules/.prisma

# Instalar apenas dependências de produção
RUN pnpm install --prod

# Gerar o cliente Prisma novamente no ambiente de produção
RUN pnpm dlx prisma generate

ARG CLERK_PUBLISHABLE_KEY
ENV CLERK_PUBLISHABLE_KEY=$CLERK_PUBLISHABLE_KEY

# Expor a porta
EXPOSE 3001

# Comando para iniciar a aplicação
CMD ["pnpm", "start"]