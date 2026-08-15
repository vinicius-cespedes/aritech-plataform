# Implementation Roadmap

## Phase 0 — Foundation

- pnpm workspace + Turborepo
- Next.js web application
- NestJS API
- PostgreSQL development database
- Prisma ORM package
- shared package boundary
- environment template
- Docker Compose for local PostgreSQL

## Phase 1 — Financial Core

The first vertical slice will be derived from the accepted financial documentation in `docs/domain` and the financial ADRs. The implementation should start with the smallest coherent set of entities required to register financial accounts, obligations/receivables, payments/receipts and their audit trail.

## Phase 2 — Bank Reconciliation

Implement OFX statement import, bank transactions, reconciliation suggestions and user-confirmed matches according to ADR-009.

## Phase 3 — Closing and Management Views

Implement financial-period closing controls and management reporting, then expose reliable data for the company's initial valuation baseline.

## Architecture rule

The codebase starts as a modular monolith. Module boundaries should remain explicit so domains can evolve independently without introducing distributed-system complexity prematurely.
