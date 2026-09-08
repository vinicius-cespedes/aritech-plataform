-- CreateEnum
CREATE TYPE "ActorType" AS ENUM ('USER', 'ADMIN', 'SERVICE_ACCOUNT', 'INTEGRATION', 'SCHEDULED_JOB', 'SYSTEM', 'MIGRATION');

-- CreateEnum
CREATE TYPE "AuditResult" AS ENUM ('SUCCESS', 'FAILURE', 'DENIED', 'PARTIAL', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'CLOSED');

-- CreateEnum
CREATE TYPE "ContractStatus" AS ENUM ('DRAFT', 'ACTIVE', 'SUSPENDED', 'CLOSED');

-- CreateEnum
CREATE TYPE "Currency" AS ENUM ('BRL', 'USD', 'EUR');

-- CreateEnum
CREATE TYPE "FinancialAccountType" AS ENUM ('CHECKING', 'SAVINGS', 'CASH', 'INVESTMENT', 'PAYMENT', 'DIGITAL_WALLET', 'INTERNATIONAL', 'OTHER');

-- CreateEnum
CREATE TYPE "FinancialAccountStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'CLOSED');

-- CreateEnum
CREATE TYPE "ManagementAccountNature" AS ENUM ('DEBIT', 'CREDIT', 'NEUTRAL');

-- CreateEnum
CREATE TYPE "ManagementAccountClassification" AS ENUM ('REVENUE', 'TAX_DEDUCTION', 'DIRECT_COST', 'INDIRECT_COST', 'OPERATING_EXPENSE', 'FINANCIAL_INCOME', 'FINANCIAL_EXPENSE', 'INVESTMENT', 'FINANCING', 'EQUITY', 'TRANSFER', 'OTHER');

-- CreateEnum
CREATE TYPE "ManagementAccountStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "CostCenterStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "ResultCenterStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "CounterpartyType" AS ENUM ('CUSTOMER', 'SUPPLIER', 'EMPLOYEE', 'GOVERNMENT', 'BANK', 'PARTNER', 'OTHER');

-- CreateEnum
CREATE TYPE "PayableSourceType" AS ENUM ('PURCHASE_ORDER', 'SUPPLIER_INVOICE', 'CONTRACT', 'PAYROLL', 'TAX', 'EXPENSE_REIMBURSEMENT', 'LOAN', 'RENT', 'MANUAL_ENTRY', 'OTHER');

-- CreateEnum
CREATE TYPE "PayableStatus" AS ENUM ('DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'OPEN', 'PARTIALLY_SETTLED', 'SETTLED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "EmployeeObligationType" AS ENUM ('SALARY', 'SALARY_ADVANCE', 'VACATION', 'THIRTEENTH_SALARY', 'REIMBURSEMENT', 'BENEFIT', 'SEVERANCE', 'PRO_LABORE', 'OTHER');

-- CreateEnum
CREATE TYPE "PayableInstallmentStatus" AS ENUM ('OPEN', 'PARTIALLY_SETTLED', 'SETTLED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('PIX', 'BANK_TRANSFER', 'BOLETO', 'CREDIT_CARD', 'DEBIT_CARD', 'CASH', 'DIRECT_DEBIT', 'CHECK', 'OTHER');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'CONFIRMED', 'RECONCILED', 'REVERSED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ReceivableSourceType" AS ENUM ('CONTRACT', 'BILLING_SCHEDULE', 'MEASUREMENT', 'SALES_ORDER', 'SERVICE_INVOICE', 'PRODUCT_INVOICE', 'ADVANCE_REQUEST', 'MANUAL_ENTRY', 'OTHER');

-- CreateEnum
CREATE TYPE "ReceivableStatus" AS ENUM ('DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'OPEN', 'PARTIALLY_SETTLED', 'SETTLED', 'CANCELLED', 'WRITTEN_OFF');

-- CreateEnum
CREATE TYPE "ReceivableCertaintyLevel" AS ENUM ('COMMITTED', 'FORECAST');

-- CreateEnum
CREATE TYPE "ReceivableInstallmentStatus" AS ENUM ('OPEN', 'PARTIALLY_SETTLED', 'SETTLED', 'CANCELLED', 'WRITTEN_OFF');

-- CreateEnum
CREATE TYPE "ReceiptStatus" AS ENUM ('PENDING', 'CONFIRMED', 'RECONCILED', 'REVERSED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "WithholdingType" AS ENUM ('IRRF', 'INSS', 'ISS', 'PIS', 'COFINS', 'CSLL', 'CONTRACTUAL_HOLDBACK', 'WARRANTY_RETENTION', 'OTHER');

-- CreateEnum
CREATE TYPE "WithholdingStatus" AS ENUM ('PENDING', 'SETTLED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "BankTransactionSource" AS ENUM ('MANUAL', 'OFX_IMPORT', 'CSV_IMPORT', 'BANK_API', 'OPEN_FINANCE', 'SYSTEM_GENERATED');

-- CreateEnum
CREATE TYPE "BankStatementImportStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'COMPLETED_WITH_ERRORS', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "BankTransactionDirection" AS ENUM ('CREDIT', 'DEBIT');

-- CreateEnum
CREATE TYPE "BankTransactionStatus" AS ENUM ('PENDING', 'POSTED', 'REVERSED', 'IGNORED');

-- CreateEnum
CREATE TYPE "BankTransactionReconciliationStatus" AS ENUM ('UNRECONCILED', 'SUGGESTED', 'PARTIALLY_RECONCILED', 'RECONCILED', 'DIVERGENT');

-- CreateEnum
CREATE TYPE "BankReconciliationStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'COMPLETED', 'REOPENED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ReconciliationMatchType" AS ENUM ('AUTOMATIC', 'MANUAL', 'RULE_BASED');

-- CreateEnum
CREATE TYPE "ReconciliationTargetType" AS ENUM ('PAYMENT', 'RECEIPT', 'TRANSFER', 'BANK_FEE', 'FINANCIAL_INCOME', 'ADVANCE', 'OTHER');

-- CreateEnum
CREATE TYPE "ReconciliationMatchStatus" AS ENUM ('ACTIVE', 'REVERSED');

-- CreateEnum
CREATE TYPE "FinancialTransferStatus" AS ENUM ('DRAFT', 'CONFIRMED', 'RECONCILED', 'REVERSED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "FinancialPeriodStatus" AS ENUM ('OPEN', 'CLOSING', 'CLOSED', 'REOPENED');

-- CreateEnum
CREATE TYPE "DocumentClassification" AS ENUM ('PUBLIC', 'INTERNAL', 'CONFIDENTIAL', 'RESTRICTED');

-- CreateEnum
CREATE TYPE "DocumentStatus" AS ENUM ('PENDING_VALIDATION', 'AVAILABLE', 'BLOCKED', 'REJECTED', 'QUARANTINED', 'ARCHIVED', 'DELETED');

-- CreateEnum
CREATE TYPE "FinancialDocumentRole" AS ENUM ('INVOICE', 'PAYMENT_SLIP', 'PAYMENT_PROOF', 'RECEIPT_PROOF', 'CONTRACT', 'PURCHASE_ORDER', 'MEASUREMENT', 'TAX_GUIDE', 'BANK_STATEMENT', 'OTHER');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "mustChangePassword" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roles" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "permissions" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_roles" (
    "userId" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,

    CONSTRAINT "user_roles_pkey" PRIMARY KEY ("userId","roleId")
);

-- CreateTable
CREATE TABLE "role_permissions" (
    "roleId" TEXT NOT NULL,
    "permissionId" TEXT NOT NULL,

    CONSTRAINT "role_permissions_pkey" PRIMARY KEY ("roleId","permissionId")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "replacedByTokenId" TEXT,
    "createdByIp" TEXT,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_events" (
    "id" TEXT NOT NULL,
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actorType" "ActorType" NOT NULL,
    "actorUserId" TEXT,
    "actorLabel" TEXT,
    "sessionId" TEXT,
    "requestId" TEXT,
    "module" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT,
    "companyId" TEXT,
    "projectId" TEXT,
    "source" TEXT NOT NULL,
    "result" "AuditResult" NOT NULL,
    "reason" TEXT,
    "previousValues" JSONB,
    "newValues" JSONB,
    "metadata" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,

    CONSTRAINT "audit_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "legal_entities" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "tradeName" TEXT,
    "taxId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "legal_entities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customers" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "tradeName" TEXT,
    "taxId" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "suppliers" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "tradeName" TEXT,
    "taxId" TEXT,
    "stateRegistration" TEXT,
    "municipalRegistration" TEXT,
    "website" TEXT,
    "businessArea" TEXT,
    "addressZip" TEXT,
    "addressStreet" TEXT,
    "addressNumber" TEXT,
    "addressComplement" TEXT,
    "addressDistrict" TEXT,
    "addressCity" TEXT,
    "addressState" TEXT,
    "addressCountry" TEXT DEFAULT 'BR',
    "contactName" TEXT,
    "contactEmail" TEXT,
    "contactPhoneDdi" TEXT,
    "contactPhone" TEXT,
    "notes" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "suppliers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employees" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "taxId" TEXT,
    "employmentType" TEXT,
    "role" TEXT,
    "costCenterId" TEXT,
    "admissionDate" TIMESTAMP(3),
    "pixKey" TEXT,
    "bankName" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "employees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "projects" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "contractId" TEXT,
    "status" "ProjectStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contracts" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "description" TEXT,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "amount" DECIMAL(19,4),
    "status" "ContractStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contracts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "financial_accounts" (
    "id" TEXT NOT NULL,
    "legalEntityId" TEXT,
    "name" TEXT NOT NULL,
    "type" "FinancialAccountType" NOT NULL,
    "institutionName" TEXT,
    "bankCode" TEXT,
    "branch" TEXT,
    "accountNumber" TEXT,
    "accountDigit" TEXT,
    "currency" "Currency" NOT NULL DEFAULT 'BRL',
    "openingBalance" DECIMAL(19,4) NOT NULL DEFAULT 0,
    "openingBalanceDate" TIMESTAMP(3),
    "status" "FinancialAccountStatus" NOT NULL DEFAULT 'ACTIVE',
    "allowsReconciliation" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "financial_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "management_accounts" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "parentId" TEXT,
    "nature" "ManagementAccountNature" NOT NULL,
    "classification" "ManagementAccountClassification" NOT NULL,
    "dreGroup" TEXT,
    "cashFlowGroup" TEXT,
    "allowsPosting" BOOLEAN NOT NULL DEFAULT true,
    "status" "ManagementAccountStatus" NOT NULL DEFAULT 'ACTIVE',
    "validFrom" TIMESTAMP(3),
    "validUntil" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "management_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cost_centers" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "parentId" TEXT,
    "status" "CostCenterStatus" NOT NULL DEFAULT 'ACTIVE',
    "validFrom" TIMESTAMP(3),
    "validUntil" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cost_centers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "result_centers" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "parentId" TEXT,
    "status" "ResultCenterStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "result_centers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payables" (
    "id" TEXT NOT NULL,
    "counterpartyType" "CounterpartyType" NOT NULL,
    "supplierId" TEXT,
    "employeeId" TEXT,
    "employeeObligationType" "EmployeeObligationType",
    "description" TEXT NOT NULL,
    "documentNumber" TEXT,
    "documentType" TEXT,
    "issueDate" TIMESTAMP(3),
    "competenceDate" TIMESTAMP(3) NOT NULL,
    "originalAmount" DECIMAL(19,4) NOT NULL,
    "currency" "Currency" NOT NULL DEFAULT 'BRL',
    "status" "PayableStatus" NOT NULL DEFAULT 'DRAFT',
    "sourceType" "PayableSourceType" NOT NULL DEFAULT 'MANUAL_ENTRY',
    "sourceId" TEXT,
    "isDirectCost" BOOLEAN NOT NULL DEFAULT false,
    "projectId" TEXT,
    "costCenterId" TEXT NOT NULL,
    "managementAccountId" TEXT NOT NULL,
    "contractId" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payables_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payable_installments" (
    "id" TEXT NOT NULL,
    "payableId" TEXT NOT NULL,
    "sequence" INTEGER NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "originalDueDate" TIMESTAMP(3),
    "originalAmount" DECIMAL(19,4) NOT NULL,
    "openAmount" DECIMAL(19,4) NOT NULL,
    "status" "PayableInstallmentStatus" NOT NULL DEFAULT 'OPEN',
    "expectedPaymentDate" TIMESTAMP(3),
    "paymentMethod" "PaymentMethod",
    "barcode" TEXT,
    "pixKey" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payable_installments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "paymentDate" TIMESTAMP(3) NOT NULL,
    "amount" DECIMAL(19,4) NOT NULL,
    "currency" "Currency" NOT NULL DEFAULT 'BRL',
    "financialAccountId" TEXT NOT NULL,
    "paymentMethod" "PaymentMethod" NOT NULL,
    "reference" TEXT,
    "status" "PaymentStatus" NOT NULL DEFAULT 'CONFIRMED',
    "reversedPaymentId" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_allocations" (
    "id" TEXT NOT NULL,
    "paymentId" TEXT NOT NULL,
    "payableInstallmentId" TEXT NOT NULL,
    "principalAmount" DECIMAL(19,4) NOT NULL,
    "interestAmount" DECIMAL(19,4) NOT NULL DEFAULT 0,
    "penaltyAmount" DECIMAL(19,4) NOT NULL DEFAULT 0,
    "discountAmount" DECIMAL(19,4) NOT NULL DEFAULT 0,
    "withholdingAmount" DECIMAL(19,4) NOT NULL DEFAULT 0,
    "allocatedAmount" DECIMAL(19,4) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payment_allocations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "receivables" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "documentNumber" TEXT,
    "documentType" TEXT,
    "issueDate" TIMESTAMP(3),
    "competenceDate" TIMESTAMP(3) NOT NULL,
    "originalAmount" DECIMAL(19,4) NOT NULL,
    "currency" "Currency" NOT NULL DEFAULT 'BRL',
    "status" "ReceivableStatus" NOT NULL DEFAULT 'DRAFT',
    "certaintyLevel" "ReceivableCertaintyLevel" NOT NULL DEFAULT 'COMMITTED',
    "sourceType" "ReceivableSourceType" NOT NULL DEFAULT 'MANUAL_ENTRY',
    "sourceId" TEXT,
    "projectId" TEXT,
    "resultCenterId" TEXT,
    "managementAccountId" TEXT NOT NULL,
    "contractId" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "receivables_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "receivable_installments" (
    "id" TEXT NOT NULL,
    "receivableId" TEXT NOT NULL,
    "sequence" INTEGER NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "originalDueDate" TIMESTAMP(3),
    "expectedReceiptDate" TIMESTAMP(3),
    "originalAmount" DECIMAL(19,4) NOT NULL,
    "openAmount" DECIMAL(19,4) NOT NULL,
    "status" "ReceivableInstallmentStatus" NOT NULL DEFAULT 'OPEN',
    "billingReference" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "receivable_installments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "receipts" (
    "id" TEXT NOT NULL,
    "receiptDate" TIMESTAMP(3) NOT NULL,
    "amount" DECIMAL(19,4) NOT NULL,
    "currency" "Currency" NOT NULL DEFAULT 'BRL',
    "financialAccountId" TEXT NOT NULL,
    "receiptMethod" "PaymentMethod" NOT NULL,
    "reference" TEXT,
    "status" "ReceiptStatus" NOT NULL DEFAULT 'CONFIRMED',
    "reversedReceiptId" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "receipts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "receipt_allocations" (
    "id" TEXT NOT NULL,
    "receiptId" TEXT NOT NULL,
    "receivableInstallmentId" TEXT NOT NULL,
    "principalAmount" DECIMAL(19,4) NOT NULL,
    "interestAmount" DECIMAL(19,4) NOT NULL DEFAULT 0,
    "penaltyAmount" DECIMAL(19,4) NOT NULL DEFAULT 0,
    "discountAmount" DECIMAL(19,4) NOT NULL DEFAULT 0,
    "withholdingAmount" DECIMAL(19,4) NOT NULL DEFAULT 0,
    "allocatedAmount" DECIMAL(19,4) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "receipt_allocations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "withholdings" (
    "id" TEXT NOT NULL,
    "type" "WithholdingType" NOT NULL,
    "taxCode" TEXT,
    "calculationBase" DECIMAL(19,4) NOT NULL,
    "rate" DECIMAL(9,6) NOT NULL,
    "amount" DECIMAL(19,4) NOT NULL,
    "responsibleParty" TEXT,
    "dueDate" TIMESTAMP(3),
    "status" "WithholdingStatus" NOT NULL DEFAULT 'PENDING',
    "payableId" TEXT,
    "receivableId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "withholdings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bank_statement_imports" (
    "id" TEXT NOT NULL,
    "financialAccountId" TEXT NOT NULL,
    "source" "BankTransactionSource" NOT NULL DEFAULT 'OFX_IMPORT',
    "fileName" TEXT NOT NULL,
    "fileHash" TEXT NOT NULL,
    "periodStart" TIMESTAMP(3),
    "periodEnd" TIMESTAMP(3),
    "status" "BankStatementImportStatus" NOT NULL DEFAULT 'PENDING',
    "totalRecords" INTEGER NOT NULL DEFAULT 0,
    "importedRecords" INTEGER NOT NULL DEFAULT 0,
    "duplicateRecords" INTEGER NOT NULL DEFAULT 0,
    "rejectedRecords" INTEGER NOT NULL DEFAULT 0,
    "documentId" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bank_statement_imports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bank_transactions" (
    "id" TEXT NOT NULL,
    "financialAccountId" TEXT NOT NULL,
    "externalId" TEXT,
    "transactionDate" TIMESTAMP(3) NOT NULL,
    "postingDate" TIMESTAMP(3),
    "amount" DECIMAL(19,4) NOT NULL,
    "direction" "BankTransactionDirection" NOT NULL,
    "currency" "Currency" NOT NULL DEFAULT 'BRL',
    "description" TEXT,
    "documentNumber" TEXT,
    "counterpartyName" TEXT,
    "counterpartyDocument" TEXT,
    "bankReference" TEXT,
    "source" "BankTransactionSource" NOT NULL DEFAULT 'OFX_IMPORT',
    "status" "BankTransactionStatus" NOT NULL DEFAULT 'POSTED',
    "reconciliationStatus" "BankTransactionReconciliationStatus" NOT NULL DEFAULT 'UNRECONCILED',
    "importBatchId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bank_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bank_reconciliations" (
    "id" TEXT NOT NULL,
    "financialAccountId" TEXT NOT NULL,
    "statementPeriodStart" TIMESTAMP(3) NOT NULL,
    "statementPeriodEnd" TIMESTAMP(3) NOT NULL,
    "status" "BankReconciliationStatus" NOT NULL DEFAULT 'OPEN',
    "startedById" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedById" TEXT,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "bank_reconciliations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reconciliation_matches" (
    "id" TEXT NOT NULL,
    "bankTransactionId" TEXT NOT NULL,
    "targetType" "ReconciliationTargetType" NOT NULL,
    "paymentId" TEXT,
    "receiptId" TEXT,
    "matchedAmount" DECIMAL(19,4) NOT NULL,
    "matchType" "ReconciliationMatchType" NOT NULL,
    "confidenceScore" INTEGER,
    "criteria" JSONB,
    "status" "ReconciliationMatchStatus" NOT NULL DEFAULT 'ACTIVE',
    "matchedById" TEXT,
    "matchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reversedById" TEXT,
    "reversedAt" TIMESTAMP(3),
    "reversalReason" TEXT,

    CONSTRAINT "reconciliation_matches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "financial_transfers" (
    "id" TEXT NOT NULL,
    "sourceAccountId" TEXT NOT NULL,
    "destinationAccountId" TEXT NOT NULL,
    "transferDate" TIMESTAMP(3) NOT NULL,
    "amount" DECIMAL(19,4) NOT NULL,
    "currency" "Currency" NOT NULL DEFAULT 'BRL',
    "feeAmount" DECIMAL(19,4) NOT NULL DEFAULT 0,
    "status" "FinancialTransferStatus" NOT NULL DEFAULT 'DRAFT',
    "outgoingBankTransactionId" TEXT,
    "incomingBankTransactionId" TEXT,
    "reference" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "financial_transfers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "financial_periods" (
    "id" TEXT NOT NULL,
    "legalEntityId" TEXT,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "status" "FinancialPeriodStatus" NOT NULL DEFAULT 'OPEN',
    "closedById" TEXT,
    "closedAt" TIMESTAMP(3),
    "reopenedById" TEXT,
    "reopenedAt" TIMESTAMP(3),
    "reopeningReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "financial_periods_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "financial_period_closings" (
    "id" TEXT NOT NULL,
    "financialPeriodId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "closedById" TEXT NOT NULL,
    "closedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL,
    "blockingIssues" JSONB,
    "warnings" JSONB,
    "metricsSnapshot" JSONB,
    "previousClosingId" TEXT,

    CONSTRAINT "financial_period_closings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documents" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "classification" "DocumentClassification" NOT NULL DEFAULT 'INTERNAL',
    "status" "DocumentStatus" NOT NULL DEFAULT 'PENDING_VALIDATION',
    "currentVersionId" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "document_versions" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "versionNumber" INTEGER NOT NULL,
    "storageDriver" TEXT NOT NULL,
    "storageKey" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "hash" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "description" TEXT,
    "status" "DocumentStatus" NOT NULL DEFAULT 'AVAILABLE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "document_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "financial_document_links" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "payableId" TEXT,
    "receivableId" TEXT,
    "role" "FinancialDocumentRole" NOT NULL,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "financial_document_links_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "roles_key_key" ON "roles"("key");

-- CreateIndex
CREATE UNIQUE INDEX "permissions_key_key" ON "permissions"("key");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_tokenHash_key" ON "refresh_tokens"("tokenHash");

-- CreateIndex
CREATE INDEX "refresh_tokens_userId_idx" ON "refresh_tokens"("userId");

-- CreateIndex
CREATE INDEX "audit_events_entityType_entityId_idx" ON "audit_events"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "audit_events_module_action_idx" ON "audit_events"("module", "action");

-- CreateIndex
CREATE INDEX "audit_events_occurredAt_idx" ON "audit_events"("occurredAt");

-- CreateIndex
CREATE UNIQUE INDEX "legal_entities_taxId_key" ON "legal_entities"("taxId");

-- CreateIndex
CREATE INDEX "customers_taxId_idx" ON "customers"("taxId");

-- CreateIndex
CREATE INDEX "suppliers_taxId_idx" ON "suppliers"("taxId");

-- CreateIndex
CREATE UNIQUE INDEX "projects_code_key" ON "projects"("code");

-- CreateIndex
CREATE UNIQUE INDEX "contracts_code_key" ON "contracts"("code");

-- CreateIndex
CREATE UNIQUE INDEX "management_accounts_code_key" ON "management_accounts"("code");

-- CreateIndex
CREATE UNIQUE INDEX "cost_centers_code_key" ON "cost_centers"("code");

-- CreateIndex
CREATE UNIQUE INDEX "result_centers_code_key" ON "result_centers"("code");

-- CreateIndex
CREATE INDEX "payables_competenceDate_idx" ON "payables"("competenceDate");

-- CreateIndex
CREATE INDEX "payables_status_idx" ON "payables"("status");

-- CreateIndex
CREATE INDEX "payables_supplierId_idx" ON "payables"("supplierId");

-- CreateIndex
CREATE INDEX "payables_employeeId_idx" ON "payables"("employeeId");

-- CreateIndex
CREATE INDEX "payable_installments_dueDate_idx" ON "payable_installments"("dueDate");

-- CreateIndex
CREATE INDEX "payable_installments_status_idx" ON "payable_installments"("status");

-- CreateIndex
CREATE UNIQUE INDEX "payable_installments_payableId_sequence_key" ON "payable_installments"("payableId", "sequence");

-- CreateIndex
CREATE UNIQUE INDEX "payments_reversedPaymentId_key" ON "payments"("reversedPaymentId");

-- CreateIndex
CREATE INDEX "payments_financialAccountId_idx" ON "payments"("financialAccountId");

-- CreateIndex
CREATE INDEX "payments_status_idx" ON "payments"("status");

-- CreateIndex
CREATE INDEX "payment_allocations_paymentId_idx" ON "payment_allocations"("paymentId");

-- CreateIndex
CREATE INDEX "payment_allocations_payableInstallmentId_idx" ON "payment_allocations"("payableInstallmentId");

-- CreateIndex
CREATE INDEX "receivables_competenceDate_idx" ON "receivables"("competenceDate");

-- CreateIndex
CREATE INDEX "receivables_status_idx" ON "receivables"("status");

-- CreateIndex
CREATE INDEX "receivables_customerId_idx" ON "receivables"("customerId");

-- CreateIndex
CREATE INDEX "receivable_installments_dueDate_idx" ON "receivable_installments"("dueDate");

-- CreateIndex
CREATE INDEX "receivable_installments_status_idx" ON "receivable_installments"("status");

-- CreateIndex
CREATE UNIQUE INDEX "receivable_installments_receivableId_sequence_key" ON "receivable_installments"("receivableId", "sequence");

-- CreateIndex
CREATE UNIQUE INDEX "receipts_reversedReceiptId_key" ON "receipts"("reversedReceiptId");

-- CreateIndex
CREATE INDEX "receipts_financialAccountId_idx" ON "receipts"("financialAccountId");

-- CreateIndex
CREATE INDEX "receipts_status_idx" ON "receipts"("status");

-- CreateIndex
CREATE INDEX "receipt_allocations_receiptId_idx" ON "receipt_allocations"("receiptId");

-- CreateIndex
CREATE INDEX "receipt_allocations_receivableInstallmentId_idx" ON "receipt_allocations"("receivableInstallmentId");

-- CreateIndex
CREATE UNIQUE INDEX "bank_statement_imports_financialAccountId_fileHash_key" ON "bank_statement_imports"("financialAccountId", "fileHash");

-- CreateIndex
CREATE INDEX "bank_transactions_financialAccountId_transactionDate_idx" ON "bank_transactions"("financialAccountId", "transactionDate");

-- CreateIndex
CREATE INDEX "bank_transactions_reconciliationStatus_idx" ON "bank_transactions"("reconciliationStatus");

-- CreateIndex
CREATE UNIQUE INDEX "bank_transactions_financialAccountId_externalId_key" ON "bank_transactions"("financialAccountId", "externalId");

-- CreateIndex
CREATE INDEX "reconciliation_matches_bankTransactionId_idx" ON "reconciliation_matches"("bankTransactionId");

-- CreateIndex
CREATE INDEX "reconciliation_matches_paymentId_idx" ON "reconciliation_matches"("paymentId");

-- CreateIndex
CREATE INDEX "reconciliation_matches_receiptId_idx" ON "reconciliation_matches"("receiptId");

-- CreateIndex
CREATE UNIQUE INDEX "financial_periods_legalEntityId_year_month_key" ON "financial_periods"("legalEntityId", "year", "month");

-- CreateIndex
CREATE UNIQUE INDEX "financial_period_closings_financialPeriodId_version_key" ON "financial_period_closings"("financialPeriodId", "version");

-- CreateIndex
CREATE UNIQUE INDEX "document_versions_documentId_versionNumber_key" ON "document_versions"("documentId", "versionNumber");

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_events" ADD CONSTRAINT "audit_events_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employees" ADD CONSTRAINT "employees_costCenterId_fkey" FOREIGN KEY ("costCenterId") REFERENCES "cost_centers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "contracts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contracts" ADD CONSTRAINT "contracts_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "financial_accounts" ADD CONSTRAINT "financial_accounts_legalEntityId_fkey" FOREIGN KEY ("legalEntityId") REFERENCES "legal_entities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "management_accounts" ADD CONSTRAINT "management_accounts_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "management_accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cost_centers" ADD CONSTRAINT "cost_centers_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "cost_centers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "result_centers" ADD CONSTRAINT "result_centers_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "result_centers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payables" ADD CONSTRAINT "payables_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "suppliers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payables" ADD CONSTRAINT "payables_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payables" ADD CONSTRAINT "payables_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payables" ADD CONSTRAINT "payables_costCenterId_fkey" FOREIGN KEY ("costCenterId") REFERENCES "cost_centers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payables" ADD CONSTRAINT "payables_managementAccountId_fkey" FOREIGN KEY ("managementAccountId") REFERENCES "management_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payables" ADD CONSTRAINT "payables_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "contracts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payable_installments" ADD CONSTRAINT "payable_installments_payableId_fkey" FOREIGN KEY ("payableId") REFERENCES "payables"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_financialAccountId_fkey" FOREIGN KEY ("financialAccountId") REFERENCES "financial_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_reversedPaymentId_fkey" FOREIGN KEY ("reversedPaymentId") REFERENCES "payments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_allocations" ADD CONSTRAINT "payment_allocations_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "payments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_allocations" ADD CONSTRAINT "payment_allocations_payableInstallmentId_fkey" FOREIGN KEY ("payableInstallmentId") REFERENCES "payable_installments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "receivables" ADD CONSTRAINT "receivables_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "receivables" ADD CONSTRAINT "receivables_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "receivables" ADD CONSTRAINT "receivables_resultCenterId_fkey" FOREIGN KEY ("resultCenterId") REFERENCES "result_centers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "receivables" ADD CONSTRAINT "receivables_managementAccountId_fkey" FOREIGN KEY ("managementAccountId") REFERENCES "management_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "receivables" ADD CONSTRAINT "receivables_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "contracts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "receivable_installments" ADD CONSTRAINT "receivable_installments_receivableId_fkey" FOREIGN KEY ("receivableId") REFERENCES "receivables"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "receipts" ADD CONSTRAINT "receipts_financialAccountId_fkey" FOREIGN KEY ("financialAccountId") REFERENCES "financial_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "receipts" ADD CONSTRAINT "receipts_reversedReceiptId_fkey" FOREIGN KEY ("reversedReceiptId") REFERENCES "receipts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "receipt_allocations" ADD CONSTRAINT "receipt_allocations_receiptId_fkey" FOREIGN KEY ("receiptId") REFERENCES "receipts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "receipt_allocations" ADD CONSTRAINT "receipt_allocations_receivableInstallmentId_fkey" FOREIGN KEY ("receivableInstallmentId") REFERENCES "receivable_installments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "withholdings" ADD CONSTRAINT "withholdings_payableId_fkey" FOREIGN KEY ("payableId") REFERENCES "payables"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "withholdings" ADD CONSTRAINT "withholdings_receivableId_fkey" FOREIGN KEY ("receivableId") REFERENCES "receivables"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bank_statement_imports" ADD CONSTRAINT "bank_statement_imports_financialAccountId_fkey" FOREIGN KEY ("financialAccountId") REFERENCES "financial_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bank_transactions" ADD CONSTRAINT "bank_transactions_financialAccountId_fkey" FOREIGN KEY ("financialAccountId") REFERENCES "financial_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bank_transactions" ADD CONSTRAINT "bank_transactions_importBatchId_fkey" FOREIGN KEY ("importBatchId") REFERENCES "bank_statement_imports"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bank_reconciliations" ADD CONSTRAINT "bank_reconciliations_financialAccountId_fkey" FOREIGN KEY ("financialAccountId") REFERENCES "financial_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reconciliation_matches" ADD CONSTRAINT "reconciliation_matches_bankTransactionId_fkey" FOREIGN KEY ("bankTransactionId") REFERENCES "bank_transactions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reconciliation_matches" ADD CONSTRAINT "reconciliation_matches_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "payments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reconciliation_matches" ADD CONSTRAINT "reconciliation_matches_receiptId_fkey" FOREIGN KEY ("receiptId") REFERENCES "receipts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "financial_transfers" ADD CONSTRAINT "financial_transfers_sourceAccountId_fkey" FOREIGN KEY ("sourceAccountId") REFERENCES "financial_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "financial_transfers" ADD CONSTRAINT "financial_transfers_destinationAccountId_fkey" FOREIGN KEY ("destinationAccountId") REFERENCES "financial_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "financial_periods" ADD CONSTRAINT "financial_periods_legalEntityId_fkey" FOREIGN KEY ("legalEntityId") REFERENCES "legal_entities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "financial_period_closings" ADD CONSTRAINT "financial_period_closings_financialPeriodId_fkey" FOREIGN KEY ("financialPeriodId") REFERENCES "financial_periods"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_versions" ADD CONSTRAINT "document_versions_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "documents"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "financial_document_links" ADD CONSTRAINT "financial_document_links_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "documents"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "financial_document_links" ADD CONSTRAINT "financial_document_links_payableId_fkey" FOREIGN KEY ("payableId") REFERENCES "payables"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "financial_document_links" ADD CONSTRAINT "financial_document_links_receivableId_fkey" FOREIGN KEY ("receivableId") REFERENCES "receivables"("id") ON DELETE SET NULL ON UPDATE CASCADE;
