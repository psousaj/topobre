# Usar a imagem base do Node.js
FROM node:18 as ApiBuilder

# Definir o diretório de trabalho
WORKDIR /usr/src/app

ARG CLERK_PUBLISHABLE_KEY
ENV CLERK_PUBLISHABLE_KEY=$CLERK_PUBLISHABLE_KEY

# Copiar os arquivos de package.json e package-lock.json
COPY package.json ./

# Instalar as dependências
RUN npm install -g pnpm

RUN pnpm install

# Copiar o restante dos arquivos do projeto
COPY . .

# Expor a porta que a API irá rodar
EXPOSE 3001

# Comando para iniciar a API
CMD ["pnpm", "start"]
