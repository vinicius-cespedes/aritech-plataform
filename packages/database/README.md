# Database package

This package owns the Prisma schema and database client for the Aritech Platform.

## Financial schema v1

The initial financial schema implements the first coherent persistence slice described in `docs/domain/FINANCIAL_MODEL.md` and related ADRs:

- financial accounts;
- management accounts;
- cost and result centers;
- financial periods;
- payables and installments;
- payments and allocations;
- receivables and installments;
- receipts and allocations;
- bank statement imports;
- bank transactions;
- reconciliation matches;
- transfers.

## Module boundaries

References to entities owned by other modules are intentionally stored as UUID scalar fields for now, including `legalEntityId`, `projectId`, `customerId`, `counterpartyId`, `contractId`, `purchaseOrderId` and user identifiers. Foreign-key relations will only be introduced after the owning modules exist and their public boundaries are defined.

## Important invariants

Prisma models persistence structure, not every domain invariant. Rules such as installment totals matching their parent obligation, non-negative open balances, financial-period locks and reconciliation totals must also be enforced in the domain/application layer and, where useful, by database constraints introduced in migrations.

## Commands

```bash
pnpm --filter @aritech/database validate
pnpm --filter @aritech/database generate
pnpm --filter @aritech/database migrate:dev
pnpm --filter @aritech/database studio
```
