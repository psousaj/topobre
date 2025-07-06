<h1 align="center">📊 ToPobre App</h1>

<p align="center">
  Um sistema completo para controle financeiro pessoal, com foco em simplicidade, rastreabilidade e observabilidade.
</p>

<p align="center">
  <img src="https://img.shields.io/github/license/psousa/topobre?color=blue" alt="License" />
  <img src="https://img.shields.io/github/workflow/status/psousaj/topobre/Deploy%20Apps?label=CI%2FCD" alt="CI/CD" />
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
│ ├── api/ # Backend (Node.js, Prisma, OpenTelemetry)
│ ├── web/ # Frontend (Next.js)
│ └── worker/ # Worker de fila/eventos
├── prisma/ # Esquema e migrações do Prisma
├── server/ # Serviços da infra (Postgres, Redis, Grafana, etc)
├── docker-compose.apps.yml
├── docker-compose.infra.yml
└── .github/workflows/

---

## 🚀 Stack Principal

| Categoria       | Tecnologias |
|----------------|-------------|
| Frontend       | Next.js, Tailwind CSS |
| Backend        | Node.js, Prisma, OpenTelemetry |
| Worker         | Node.js, Queue/Event-driven |
| Banco de Dados | PostgreSQL (via Neon) |
| Cache          | Redis (via Upstash) |
| Observabilidade| Grafana, Loki, Tempo, Prometheus |
| CI/CD          | GitHub Actions + GitHub Container Registry |
| Deploy         | Docker Compose (auto e manual) |

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