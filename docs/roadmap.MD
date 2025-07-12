# Roadmap para o topobre

## Estado Atual
- **Descrição do Projeto:** Um sistema completo para controle financeiro pessoal, focado em simplicidade, rastreabilidade e observabilidade.
- **Funcionalidades Atuais:**
  - Cadastro e visualização de transações.
  - Dashboard intuitivo.
  - Observabilidade com Grafana, Prometheus, Tempo e Loki.
  - Tracing distribuído com OpenTelemetry.
  - Arquitetura moderna com Docker e GitHub Actions.
- **Tecnologias Utilizadas:**
  - **Frontend:** Next.js, Tailwind CSS.
  - **Backend:** Fastify, TypeORM, OpenTelemetry.
  - **Worker:** Node.js, BullMQ.
  - **Banco de Dados:** PostgreSQL.
  - **Cache:** Redis.
  - **Observabilidade:** Grafana, Loki, Tempo, Prometheus.
  - **CI/CD:** GitHub Actions.
  - **Deploy:** Docker Compose.

## Objetivos Futuros
- Melhorar escalabilidade e confiabilidade.
- Adicionar novas funcionalidades (ex.: orçamento, relatórios detalhados).
- Aprimorar a experiência do usuário.
- Garantir alta segurança para dados financeiros.
- Engajar a comunidade open-source.

## Passos do Roadmap

### Fase 1: Orquestração de Containers
1. **Pesquisar e Decidir sobre a Ferramenta de Orquestração**
   - Comparar Docker Swarm e Kubernetes.
   - Decidir com base nas necessidades atuais e futuras.
2. **Configurar a Ferramenta Escolhida**
   - Se Docker Swarm: Instalar e configurar o Swarm.
   - Se Kubernetes: Configurar um cluster e instalar componentes necessários.
3. **Migrar o Aplicativo**
   - Adaptar os arquivos Docker Compose ou criar novos para o Swarm/Kubernetes.
   - Testar a migração.

### Fase 2: Novas Funcionalidades
1. **Implementar Ferramentas de Orçamento**
2. **Adicionar Relatórios Financeiros Detalhados**
3. **Aprimorar a Interface do Usuário**

### Fase 3: Aprimoramento da Observabilidade
1. **Adicionar Novos Dashboards no Grafana**
2. **Configurar Alertas**

### Fase 4: Melhorias de Segurança
1. **Implementar Criptografia de Dados**
2. **Realizar Auditorias de Segurança**

### Fase 5: Documentação e Engajamento da Comunidade
1. **Atualizar o README**
2. **Criar Diretrizes de Contribuição**
3. **Promover o Projeto**
