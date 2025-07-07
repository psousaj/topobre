<h1 align="center">📊 ToPobre App</h1>

<p align="center">
  Um sistema completo para controle financeiro pessoal, com foco em simplicidade, rastreabilidade e observabilidade.
</p>

<p align="center">
  <a href="https://creativecommons.org/licenses/by-nc-nd/4.0/">
    <img src="https://img.shields.io/badge/License-CC%20BY--NC--ND%204.0-lightgrey.svg" alt="License: CC BY-NC-ND 4.0" />
  </a>
  <a href="https://github.com/psousaj/topobre/actions/workflows/deploy%20apps.yml">
    <img src="https://img.shields.io/github/actions/workflow/status/psousaj/topobre/deploy-apps.yml?label=CI%2FCD&branch=main" alt="CI/CD" />
  </a>
</p>



---

## ✨ Visão Geral

O **ToPobre** é um sistema full-stack que permite ao usuário gerenciar suas finanças, com recursos como:

- ✅ Cadastro e visualização de transações
- ✅ Dashboard intuitivo
- ✅ Observabilidade com Grafana, Prometheus, Tempo e Loki
- ✅ Tracing distribuído com OpenTelemetry
- ✅ Arquitetura moderna com Docker e GitHub Actions

---

## 📁 Estrutura do Projeto

topobre/
├── apps/
│   ├── api/              # Backend (Fastify, TypeORM, OpenTelemetry)
│   ├── web/              # Frontend (Next.js)
│   ├── worker/           # Worker de fila/eventos (BullMQ)
│   ├── analytics/        # Serviço de análise de dados
│   ├── billing/          # Serviço de faturamento
│   ├── budget-engine/    # Motor de orçamento
│   ├── finloader/        # Carregador de extratos financeiros
│   ├── notification/     # Serviço de notificações
│   └── reports/          # Serviço de relatórios
├── packages/
│   ├── typeorm/          # Entidades e configurações do TypeORM
│   ├── bullmq/           # Configuração do BullMQ para filas
│   ├── redis/            # Cliente Redis
│   ├── telemetry/        # Configuração do OpenTelemetry
│   ├── winston/          # Configuração de logs com Winston
│   └── ...               # Outros pacotes compartilhados
├── config/
│   ├── eslint/           # Configurações do ESLint
│   ├── prettier/         # Configurações do Prettier
│   └── tsconfig/         # Configurações base do TypeScript
├── server/               # Serviços de infraestrutura (Postgres, Redis, Grafana, etc)
├── docker-compose.apps.yml
├── docker-compose.infra.yml
└── .github/workflows/

---

## 🚀 Stack Principal

| Categoria       | Tecnologias |
|----------------|-------------|
| Frontend       | Next.js, Tailwind CSS |
| Backend        | Fastify, TypeORM, OpenTelemetry |
| Worker         | Node.js, BullMQ |
| Banco de Dados | PostgreSQL |
| Cache          | Redis |
| Observabilidade| Grafana, Loki, Tempo, Prometheus |
| CI/CD          | GitHub Actions |
| Deploy         | Docker Compose |

---

## 🛠️ Pré-requisitos

- [Node.js](https://nodejs.org/) (v16+)
- [Docker](https://www.docker.com/)
- [Docker Compose](https://docs.docker.com/compose/)
- Conta no [GitHub](https://github.com/)
- Variáveis de ambiente configuradas (ver `.env.example`)

---

## ⚙️ Instalação Local

1. Clone o repositório:
   ```bash
   git clone https://github.com/seu-usuario/topobre.git
   cd topobre
   ```

2. Crie o arquivo .env na raiz e preencha com suas credenciais (Postgres, Redis, API keys etc).

3. Inicie todos os serviços:

   - Infra:

      ```bash
      docker compose -f docker-compose.infra.yml up -d
      ```
   - Apps:

         ```bash
         docker compose -f docker-compose.apps.yml up -d --build
         ```

4. Acesse:

   - Web App: http://localhost:3000

   - API: http://localhost:3003

   - Grafana: http://localhost:3001 (usuário: admin, senha: admin)

---

## 📄 Licença

Este projeto é disponibilizado publicamente apenas para fins de portfólio e aprendizado.  
**Qualquer uso comercial ou modificação é proibido sem autorização.**

Licença: [CC BY-NC-ND 4.0](https://creativecommons.org/licenses/by-nc-nd/4.0/)

