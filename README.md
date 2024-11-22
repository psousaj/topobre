# ToPobre

Este é um projeto Next.js que visa ajudar os usuários a gerenciar suas finanças pessoais de forma simples e eficiente. O aplicativo permite que os usuários adicionem, editem e excluam transações, além de visualizar um resumo de suas finanças.

## Começando

Para começar a usar o projeto, siga os passos abaixo:

### Pré-requisitos

- Node.js (versão 14 ou superior)
- npm ou yarn
- PostgreSQL (ou outro banco de dados compatível com Prisma)

### Instalação

1. Clone o repositório:
   ```bash
   git clone https://github.com/seu-usuario/topobre.git
   cd topobre
   ```

2. Instale as dependências do backend:
   ```bash
   cd api
   npm install
   ```

3. Instale as dependências do frontend:
   ```bash
   cd web
   npm install
   ```

4. Crie um arquivo `.env` na raiz do projeto e adicione suas variáveis de ambiente. Um exemplo de configuração pode ser encontrado em `.env.example`.

5. Execute as migrações do banco de dados:
   ```bash
   npx prisma migrate dev
   ```

### Executando o projeto

Para iniciar o servidor de desenvolvimento, siga os passos abaixo:

1. Inicie o backend:
   ```bash
   cd api
   npm run dev
   ```

2. Em um novo terminal, inicie o frontend:
   ```bash
   cd web
   npm run dev
   ```

3. Abra seu navegador e acesse [http://localhost:3000](http://localhost:3000) para ver o aplicativo em funcionamento.

## Estrutura do projeto

- `api/`: Contém o código do backend, incluindo rotas, modelos e configuração do Prisma.
- `web/`: Contém o código do frontend, construído com Next.js e React.
- `prisma/`: Contém os arquivos de configuração do Prisma e as migrações do banco de dados.

## Contribuindo

Contribuições são bem-vindas! Sinta-se à vontade para abrir uma issue ou enviar um pull request.

## Licença

Este projeto está licenciado sob a MIT License. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.
