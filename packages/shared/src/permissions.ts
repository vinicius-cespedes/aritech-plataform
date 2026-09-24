/**
 * Catálogo de permissões da plataforma — convenção definida em
 * docs/adr/ADR-004-authentication-and-authorization.md §17 e
 * docs/domain/FINANCIAL_MODEL.md §53.
 *
 * Única fonte de verdade: usada pelo seed do banco (packages/database),
 * pelos guards do backend (apps/api) e pela UI do frontend (apps/web) para
 * habilitar/ocultar ações — lembrando que a UI nunca é o mecanismo de
 * segurança (ADR-004 §14): a validação real acontece sempre no backend.
 */
export const PERMISSIONS = [
  // Organização / cadastros
  "organization.customer.manage",
  "organization.supplier.manage",
  "organization.employee.manage",
  // Identidade
  "identity.user.manage",
  "identity.role.manage",
  // Financeiro — cadastros de suporte
  "financial.account.read",
  "financial.account.manage",
  // Contratos e projetos
  "financial.contract.read",
  "financial.contract.manage",
  // Contas a pagar
  "financial.payable.read",
  "financial.payable.create",
  "financial.payable.update",
  "financial.payable.approve",
  "financial.payable.cancel",
  // Pagamentos
  "financial.payment.create",
  "financial.payment.reverse",
  // Contas a receber
  "financial.receivable.read",
  "financial.receivable.create",
  "financial.receivable.update",
  "financial.receivable.approve",
  // Recebimentos
  "financial.receipt.create",
  "financial.receipt.reverse",
  // Banco / conciliação
  "financial.bank.import",
  "financial.bank.read",
  "financial.reconciliation.manage",
  "financial.reconciliation.reverse",
  // Transferências
  "financial.transfer.create",
  // Fechamento de período
  "financial.period.close",
  "financial.period.reopen",
  // Relatórios / auditoria
  "financial.report.read",
  "financial.audit.read",
  // Documentos
  "documents.manage",
] as const;

export type PermissionKey = (typeof PERMISSIONS)[number];

export interface RoleDefinition {
  key: string;
  name: string;
  permissions: readonly PermissionKey[];
}

export const ROLE_DEFINITIONS: readonly RoleDefinition[] = [
  {
    key: "ADMIN",
    name: "Administrador da Plataforma",
    permissions: PERMISSIONS,
  },
  {
    key: "DIRECTORSHIP",
    name: "Direção",
    permissions: [
      "financial.account.read",
      "financial.payable.read",
      "financial.payable.approve",
      "financial.receivable.read",
      "financial.receivable.approve",
      "financial.bank.read",
      "financial.reconciliation.manage",
      "financial.period.close",
      "financial.period.reopen",
      "financial.report.read",
      "financial.audit.read",
    ],
  },
  {
    key: "FINANCIAL",
    name: "Financeiro",
    permissions: [
      "organization.customer.manage",
      "organization.supplier.manage",
      "organization.employee.manage",
      "financial.account.read",
      "financial.account.manage",
      "financial.contract.read",
      "financial.contract.manage",
      "financial.payable.read",
      "financial.payable.create",
      "financial.payable.update",
      "financial.payable.cancel",
      "financial.payment.create",
      "financial.payment.reverse",
      "financial.receivable.read",
      "financial.receivable.create",
      "financial.receivable.update",
      "financial.receipt.create",
      "financial.receipt.reverse",
      "financial.bank.import",
      "financial.bank.read",
      "financial.reconciliation.manage",
      "financial.transfer.create",
      "financial.report.read",
      "documents.manage",
    ],
  },
  {
    key: "VIEWER",
    name: "Consulta",
    permissions: [
      "financial.account.read",
      "financial.contract.read",
      "financial.payable.read",
      "financial.receivable.read",
      "financial.bank.read",
      "financial.report.read",
    ],
  },
];
