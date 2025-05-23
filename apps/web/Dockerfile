# Usar a imagem base do Node.js
FROM node:18 as WebBuilder

# Definir o diretório de trabalho
WORKDIR /app

ARG CLERK_PUBLISHABLE_KEY
ENV NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=$CLERK_PUBLISHABLE_KEY
ARG API_URL
ENV NEXT_PUBLIC_API_URL=$API_URL

# Verificar se o argumento está vazio
RUN if [ -z "$CLERK_PUBLISHABLE_KEY" ]; then \
      echo "Erro: CLERK_PUBLISHABLE_KEY não pode ser vazio." && exit 1; \
    fi

# Copiar os arquivos de package.json e package-lock.json
COPY package*.json ./

# Instalar as dependências
RUN npm install -g pnpm

RUN pnpm install

# Copiar o restante dos arquivos do projeto
COPY . .

# Construir a aplicação
RUN pnpm run build

# Expor a porta que a aplicação irá rodar
EXPOSE 3000

# Comando para iniciar a aplicação
CMD ["pnpm", "start"]
