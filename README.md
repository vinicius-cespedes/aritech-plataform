# aritech-plataform
README (Português)

Aritech Digital

Transformação Digital da Aritech Soluções Industriais

Sobre o projeto

O Aritech Digital é uma iniciativa estratégica para promover a transformação digital da Aritech Soluções Industriais por meio da integração de processos, automação de rotinas e aplicação de Inteligência Artificial na gestão empresarial.

Este projeto também constitui a base prática do Trabalho de Conclusão de Curso (TCC) do MBA em Gestão de Negócios Digitais e Inteligência Artificial, cujo objetivo é avaliar como a digitalização das diferentes áreas da empresa influencia seu desempenho operacional e seu valuation.

---

Objetivos

- Digitalizar os processos administrativos e operacionais.
- Centralizar as informações corporativas em uma plataforma única.
- Automatizar atividades repetitivas.
- Disponibilizar indicadores estratégicos em tempo real.
- Apoiar a tomada de decisão por meio de Inteligência Artificial.
- Mensurar o impacto financeiro das melhorias implementadas.

---

Módulos

- Financeiro
- Comercial (CRM)
- Compras
- Produção
- Engenharia
- Marketing
- Recursos Humanos
- Dashboard Executivo
- Inteligência Artificial

---

Funcionalidades previstas

- Fluxo de caixa
- Contas a pagar e receber
- Conciliação bancária
- Gestão de contratos
- Gestão de fornecedores
- Pipeline comercial
- Controle de produção
- Gestão documental
- Indicadores (KPIs e OKRs)
- Dashboards gerenciais
- Assistente de IA para apoio à gestão

---

Objetivo de longo prazo

Construir uma plataforma integrada capaz de conectar todas as áreas da empresa, permitindo crescimento sustentável, aumento de produtividade e decisões estratégicas baseadas em dados.

---

Licença

Projeto desenvolvido exclusivamente para a Aritech Soluções Industriais.
Todos os direitos reservados.

---

Desenvolvimento local

Esta seção descreve como rodar o monorepo do núcleo financeiro (primeira fase
do Aritech Digital, ver `docs/`) localmente. Para o contexto arquitetural
completo, leia `docs/architecture/`, `docs/adr/` e `docs/domain/` antes de
alterar regras de negócio.

Pré-requisitos

- Node.js 20+ e pnpm (`corepack enable` ou `npm i -g pnpm`).
- PostgreSQL 16/17 rodando localmente (via `infrastructure/docker-compose.yml`
  ou instalação nativa).

Estrutura

```text
apps/
  api/          NestJS — API REST em /api/v1, Swagger em /api/docs
  web/          Next.js — frontend (App Router)
packages/
  database/     schema.prisma, migrations, seed
  shared/       Money/arredondamento (ADR-007), permissões, erros de domínio
  validation/   schemas Zod compartilhados entre api e web
```

Passo a passo

```bash
# 1. Banco de dados local (ou use uma instância PostgreSQL já existente)
docker compose -f infrastructure/docker-compose.yml up -d

# 2. Instalar dependências
pnpm install

# 3. Configurar variáveis de ambiente
cp .env.example packages/database/.env   # ajuste DATABASE_URL se necessário
cp .env.example apps/api/.env            # ajuste segredos JWT em produção

# 4. Migrar e popular o banco
pnpm db:migrate
pnpm db:seed
# a saída do seed mostra o e-mail/senha inicial do usuário administrador

# 5. Rodar em desenvolvimento (dois terminais, ou `pnpm dev` na raiz via Turborepo)
pnpm --filter api dev     # http://localhost:3001/api/docs
pnpm --filter web dev     # http://localhost:3000
```

Outros comandos úteis: `pnpm build`, `pnpm test`, `pnpm lint`, `pnpm typecheck`
(todos via Turborepo, cascateando para os pacotes do workspace) e
`pnpm db:studio` para inspecionar o banco pelo Prisma Studio.

Escopo desta primeira iteração e o que ainda falta estão documentados no
histórico de commits e podem ser resumidos como: núcleo financeiro (cadastros,
contas a pagar/receber, pagamentos/recebimentos, conciliação bancária via OFX,
fechamento de período, fluxo de caixa) implementado e verificado ponta a
ponta; módulos de Contratos/Projetos/Compras completos, multi-empresa,
multimoeda, MFA e integrações bancárias diretas ficam para iterações
seguintes, conforme o roadmap em `docs/adr/`.

README (English)

Aritech Digital

Digital Transformation of Aritech Soluções Industriais

About

Aritech Digital is a strategic initiative designed to drive the digital transformation of Aritech Soluções Industriais by integrating business processes, automating workflows, and applying Artificial Intelligence to support business management.

The project also serves as the practical foundation for the author's MBA Final Project in Digital Business Management and Artificial Intelligence. Its main objective is to measure how the digital transformation of different business areas impacts operational performance and company valuation.

---

Objectives

- Digitize business and operational processes.
- Centralize corporate information on a single platform.
- Automate repetitive tasks.
- Provide real-time business indicators.
- Support decision-making through Artificial Intelligence.
- Measure the financial impact of implemented improvements.

---

System Modules

- Finance
- Sales (CRM)
- Procurement
- Production
- Engineering
- Marketing
- Human Resources
- Executive Dashboard
- Artificial Intelligence

---

Planned Features

- Cash Flow Management
- Accounts Payable and Receivable
- Bank Reconciliation
- Contract Management
- Supplier Management
- Sales Pipeline
- Production Control
- Document Management
- KPIs and OKRs
- Executive Dashboards
- AI Assistant for Business Management

---

Long-Term Vision

Build an integrated management platform that connects every department of the company, enabling sustainable growth, higher productivity, and data-driven strategic decision-making.

---

License

This project is proprietary software developed exclusively for Aritech Soluções Industriais.

All rights reserved.