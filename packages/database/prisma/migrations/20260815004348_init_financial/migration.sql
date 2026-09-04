-- CreateEnum
CREATE TYPE "Currency" AS ENUM ('BRL', 'USD', 'EUR');

-- CreateEnum
CREATE TYPE "RecordStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "FinancialAccountType" AS ENUM ('CHECKING', 'SAVINGS', 'CASH', 'INVESTMENT', 'PAYMENT', 'DIGITAL_WALLET', 'INTERNATIONAL', 'OTHER');

-- CreateEnum
CREATE TYPE "FinancialAccountStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'CLOSED');

-- CreateEnum
CREATE TYPE "ManagementAccountNature" AS ENUM ('DEBIT', 'CREDIT', 'NEUTRAL');

-- CreateEnum
CREATE TYPE "ManagementAccountClassification" AS ENUM ('REVENUE', 'TAX_DEDUCTION', 'DIRECT_COST', 'INDIRECT_COST', 'OPERATING_EXPENSE', 'FINANCIAL_INCOME', 'FINANCIAL_EXPENSE', 'INVESTMENT', 'FINANCING', 'EQUITY', 'TRANSFER', 'OTHER');

-- CreateEnum
CREATE TYPE "CounterpartyType" AS ENUM ('CUSTOMER', 'SUPPLIER', 'EMPLOYEE', 'GOVERNMENT', 'BANK', 'PARTNER', 'OTHER');

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('INVOICE', 'SERVICE_INVOICE', 'PRODUCT_INVOICE', 'RECEIPT', 'CONTRACT', 'TAX_GUIDE', 'PAYROLL', 'PURCHASE_ORDER', 'OTHER');

-- CreateEnum
CREATE TYPE "PayableSourceType" AS ENUM ('PURCHASE_ORDER', 'SUPPLIER_INVOICE', 'CONTRACT', 'PAYROLL', 'TAX', 'EXPENSE_REIMBURSEMENT', 'LOAN', 'RENT', 'MANUAL_ENTRY', 'OTHER');

-- CreateEnum
CREATE TYPE "ReceivableSourceType" AS ENUM ('CONTRACT', 'BILLING_SCHEDULE', 'MEASUREMENT', 'SALES_ORDER', 'SERVICE_INVOICE', 'PRODUCT_INVOICE', 'ADVANCE_REQUEST', 'MANUAL_ENTRY', 'OTHER');

-- CreateEnum
CREATE TYPE "PayableStatus" AS ENUM ('DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'OPEN', 'PARTIALLY_SETTLED', 'SETTLED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PayableInstallmentStatus" AS ENUM ('OPEN', 'PARTIALLY_SETTLED', 'SETTLED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ReceivableStatus" AS ENUM ('DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'OPEN', 'PARTIALLY_SETTLED', 'SETTLED', 'CANCELLED', 'WRITTEN_OFF');

-- CreateEnum
CREATE TYPE "ReceivableInstallmentStatus" AS ENUM ('OPEN', 'PARTIALLY_SETTLED', 'SETTLED', 'CANCELLED', 'WRITTEN_OFF');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('PIX', 'BANK_TRANSFER', 'BOLETO', 'CREDIT_CARD', 'DEBIT_CARD', 'CASH', 'DIRECT_DEBIT', 'CHECK', 'OTHER');

-- CreateEnum
CREATE TYPE "SettlementStatus" AS ENUM ('PENDING', 'CONFIRMED', 'RECONCILED', 'REVERSED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "FinancialPeriodStatus" AS ENUM ('OPEN', 'CLOSING', 'CLOSED', 'REOPENED');

-- CreateEnum
CREATE TYPE "BankTransactionDirection" AS ENUM ('CREDIT', 'DEBIT');

-- CreateEnum
CREATE TYPE "BankTransactionSource" AS ENUM ('MANUAL', 'OFX_IMPORT', 'CSV_IMPORT', 'BANK_API', 'OPEN_FINANCE', 'SYSTEM_GENERATED');

-- CreateEnum
CREATE TYPE "BankStatementSource" AS ENUM ('OFX_IMPORT', 'CSV_IMPORT', 'BANK_API', 'OPEN_FINANCE');

-- CreateEnum
CREATE TYPE "BankTransactionStatus" AS ENUM ('PENDING', 'POSTED', 'REVERSED', 'IGNORED');

-- CreateEnum
CREATE TYPE "ReconciliationStatus" AS ENUM ('UNRECONCILED', 'SUGGESTED', 'PARTIALLY_RECONCILED', 'RECONCILED', 'DIVERGENT');

-- CreateEnum
CREATE TYPE "BankStatementImportStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'COMPLETED_WITH_ERRORS', 'FAILED', 'CANCELLED');

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

-- CreateTable
CREATE TABLE "financial_accounts" (
    "id" UUID NOT NULL,
    "legal_entity_id" UUID NOT NULL,
    "name" VARCHAR(160) NOT NULL,
    "type" "FinancialAccountType" NOT NULL,
    "institution_name" VARCHAR(160),
    "bank_code" VARCHAR(20),
    "branch" VARCHAR(30),
    "account_number" VARCHAR(60),
    "account_digit" VARCHAR(10),
    "currency" "Currency" NOT NULL DEFAULT 'BRL',
    "opening_balance" DECIMAL(19,4) NOT NULL,
    "opening_balance_date" DATE NOT NULL,
    "status" "FinancialAccountStatus" NOT NULL DEFAULT 'ACTIVE',
    "allows_reconciliation" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "financial_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "management_accounts" (
    "id" UUID NOT NULL,
    "code" VARCHAR(40) NOT NULL,
    "name" VARCHAR(180) NOT NULL,
    "parent_id" UUID,
    "nature" "ManagementAccountNature" NOT NULL,
    "classification" "ManagementAccountClassification" NOT NULL,
    "dre_group" VARCHAR(100),
    "cash_flow_group" VARCHAR(100),
    "allows_posting" BOOLEAN NOT NULL DEFAULT true,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "valid_from" DATE,
    "valid_until" DATE,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "management_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cost_centers" (
    "id" UUID NOT NULL,
    "code" VARCHAR(40) NOT NULL,
    "name" VARCHAR(180) NOT NULL,
    "parent_id" UUID,
    "manager_id" UUID,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "valid_from" DATE,
    "valid_until" DATE,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "cost_centers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "result_centers" (
    "id" UUID NOT NULL,
    "code" VARCHAR(40) NOT NULL,
    "name" VARCHAR(180) NOT NULL,
    "parent_id" UUID,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "valid_from" DATE,
    "valid_until" DATE,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "result_centers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "financial_periods" (
    "id" UUID NOT NULL,
    "legal_entity_id" UUID NOT NULL,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "status" "FinancialPeriodStatus" NOT NULL DEFAULT 'OPEN',
    "closed_by" UUID,
    "closed_at" TIMESTAMPTZ(6),
    "reopened_by" UUID,
    "reopened_at" TIMESTAMPTZ(6),
    "reopening_reason" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "financial_periods_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payables" (
    "id" UUID NOT NULL,
    "legal_entity_id" UUID NOT NULL,
    "counterparty_id" UUID NOT NULL,
    "counterparty_type" "CounterpartyType" NOT NULL,
    "description" TEXT NOT NULL,
    "document_number" VARCHAR(100),
    "document_type" "DocumentType",
    "issue_date" DATE,
    "competence_date" DATE NOT NULL,
    "original_amount" DECIMAL(19,4) NOT NULL,
    "currency" "Currency" NOT NULL DEFAULT 'BRL',
    "status" "PayableStatus" NOT NULL DEFAULT 'DRAFT',
    "source_type" "PayableSourceType" NOT NULL,
    "source_id" UUID,
    "project_id" UUID,
    "cost_center_id" UUID,
    "management_account_id" UUID NOT NULL,
    "contract_id" UUID,
    "purchase_order_id" UUID,
    "payment_term_id" UUID,
    "created_by" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "payables_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payable_installments" (
    "id" UUID NOT NULL,
    "payable_id" UUID NOT NULL,
    "sequence" INTEGER NOT NULL,
    "due_date" DATE NOT NULL,
    "original_due_date" DATE NOT NULL,
    "expected_payment_date" DATE,
    "original_amount" DECIMAL(19,4) NOT NULL,
    "open_amount" DECIMAL(19,4) NOT NULL,
    "status" "PayableInstallmentStatus" NOT NULL DEFAULT 'OPEN',
    "payment_method" "PaymentMethod",
    "barcode" VARCHAR(255),
    "pix_key" VARCHAR(255),
    "notes" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "payable_installments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" UUID NOT NULL,
    "legal_entity_id" UUID NOT NULL,
    "payment_date" DATE NOT NULL,
    "amount" DECIMAL(19,4) NOT NULL,
    "currency" "Currency" NOT NULL DEFAULT 'BRL',
    "financial_account_id" UUID NOT NULL,
    "payment_method" "PaymentMethod" NOT NULL,
    "reference" VARCHAR(255),
    "status" "SettlementStatus" NOT NULL DEFAULT 'PENDING',
    "reverses_payment_id" UUID,
    "created_by" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_allocations" (
    "id" UUID NOT NULL,
    "payment_id" UUID NOT NULL,
    "payable_installment_id" UUID NOT NULL,
    "principal_amount" DECIMAL(19,4) NOT NULL DEFAULT 0,
    "interest_amount" DECIMAL(19,4) NOT NULL DEFAULT 0,
    "penalty_amount" DECIMAL(19,4) NOT NULL DEFAULT 0,
    "discount_amount" DECIMAL(19,4) NOT NULL DEFAULT 0,
    "withholding_amount" DECIMAL(19,4) NOT NULL DEFAULT 0,
    "allocated_amount" DECIMAL(19,4) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payment_allocations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "receivables" (
    "id" UUID NOT NULL,
    "legal_entity_id" UUID NOT NULL,
    "customer_id" UUID NOT NULL,
    "description" TEXT NOT NULL,
    "document_number" VARCHAR(100),
    "document_type" "DocumentType",
    "issue_date" DATE,
    "competence_date" DATE NOT NULL,
    "original_amount" DECIMAL(19,4) NOT NULL,
    "currency" "Currency" NOT NULL DEFAULT 'BRL',
    "status" "ReceivableStatus" NOT NULL DEFAULT 'DRAFT',
    "source_type" "ReceivableSourceType" NOT NULL,
    "source_id" UUID,
    "project_id" UUID,
    "cost_center_id" UUID,
    "result_center_id" UUID,
    "management_account_id" UUID NOT NULL,
    "contract_id" UUID,
    "billing_schedule_item_id" UUID,
    "measurement_id" UUID,
    "created_by" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "receivables_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "receivable_installments" (
    "id" UUID NOT NULL,
    "receivable_id" UUID NOT NULL,
    "sequence" INTEGER NOT NULL,
    "due_date" DATE NOT NULL,
    "original_due_date" DATE NOT NULL,
    "expected_receipt_date" DATE,
    "original_amount" DECIMAL(19,4) NOT NULL,
    "open_amount" DECIMAL(19,4) NOT NULL,
    "status" "ReceivableInstallmentStatus" NOT NULL DEFAULT 'OPEN',
    "billing_reference" VARCHAR(255),
    "collection_status" VARCHAR(80),
    "notes" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "receivable_installments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "receipts" (
    "id" UUID NOT NULL,
    "legal_entity_id" UUID NOT NULL,
    "receipt_date" DATE NOT NULL,
    "amount" DECIMAL(19,4) NOT NULL,
    "currency" "Currency" NOT NULL DEFAULT 'BRL',
    "financial_account_id" UUID NOT NULL,
    "receipt_method" "PaymentMethod" NOT NULL,
    "reference" VARCHAR(255),
    "status" "SettlementStatus" NOT NULL DEFAULT 'PENDING',
    "reverses_receipt_id" UUID,
    "created_by" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "receipts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "receipt_allocations" (
    "id" UUID NOT NULL,
    "receipt_id" UUID NOT NULL,
    "receivable_installment_id" UUID NOT NULL,
    "principal_amount" DECIMAL(19,4) NOT NULL DEFAULT 0,
    "interest_amount" DECIMAL(19,4) NOT NULL DEFAULT 0,
    "penalty_amount" DECIMAL(19,4) NOT NULL DEFAULT 0,
    "discount_amount" DECIMAL(19,4) NOT NULL DEFAULT 0,
    "withholding_amount" DECIMAL(19,4) NOT NULL DEFAULT 0,
    "allocated_amount" DECIMAL(19,4) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "receipt_allocations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bank_statement_imports" (
    "id" UUID NOT NULL,
    "financial_account_id" UUID NOT NULL,
    "source" "BankStatementSource" NOT NULL,
    "document_id" UUID,
    "file_name" VARCHAR(255) NOT NULL,
    "file_hash" VARCHAR(128) NOT NULL,
    "period_start" DATE NOT NULL,
    "period_end" DATE NOT NULL,
    "status" "BankStatementImportStatus" NOT NULL DEFAULT 'PENDING',
    "total_records" INTEGER NOT NULL DEFAULT 0,
    "imported_records" INTEGER NOT NULL DEFAULT 0,
    "duplicate_records" INTEGER NOT NULL DEFAULT 0,
    "rejected_records" INTEGER NOT NULL DEFAULT 0,
    "created_by" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bank_statement_imports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bank_transactions" (
    "id" UUID NOT NULL,
    "financial_account_id" UUID NOT NULL,
    "import_batch_id" UUID,
    "external_id" VARCHAR(255),
    "transaction_date" DATE NOT NULL,
    "posting_date" DATE,
    "amount" DECIMAL(19,4) NOT NULL,
    "direction" "BankTransactionDirection" NOT NULL,
    "currency" "Currency" NOT NULL DEFAULT 'BRL',
    "description" TEXT,
    "document_number" VARCHAR(100),
    "counterparty_name" VARCHAR(255),
    "counterparty_document" VARCHAR(40),
    "bank_reference" VARCHAR(255),
    "source" "BankTransactionSource" NOT NULL,
    "status" "BankTransactionStatus" NOT NULL DEFAULT 'POSTED',
    "reconciliation_status" "ReconciliationStatus" NOT NULL DEFAULT 'UNRECONCILED',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bank_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bank_reconciliations" (
    "id" UUID NOT NULL,
    "financial_account_id" UUID NOT NULL,
    "statement_period_start" DATE NOT NULL,
    "statement_period_end" DATE NOT NULL,
    "status" "BankReconciliationStatus" NOT NULL DEFAULT 'OPEN',
    "started_by" UUID NOT NULL,
    "completed_by" UUID,
    "started_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "bank_reconciliations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reconciliation_matches" (
    "id" UUID NOT NULL,
    "reconciliation_id" UUID NOT NULL,
    "bank_transaction_id" UUID NOT NULL,
    "target_type" "ReconciliationTargetType" NOT NULL,
    "payment_id" UUID,
    "receipt_id" UUID,
    "transfer_id" UUID,
    "external_target_id" UUID,
    "matched_amount" DECIMAL(19,4) NOT NULL,
    "match_type" "ReconciliationMatchType" NOT NULL,
    "confidence_score" DECIMAL(5,2),
    "criteria" JSONB,
    "status" "ReconciliationMatchStatus" NOT NULL DEFAULT 'ACTIVE',
    "matched_by" UUID NOT NULL,
    "matched_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reversed_by" UUID,
    "reversed_at" TIMESTAMPTZ(6),
    "reversal_reason" TEXT,

    CONSTRAINT "reconciliation_matches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "financial_transfers" (
    "id" UUID NOT NULL,
    "source_account_id" UUID NOT NULL,
    "destination_account_id" UUID NOT NULL,
    "transfer_date" DATE NOT NULL,
    "amount" DECIMAL(19,4) NOT NULL,
    "currency" "Currency" NOT NULL DEFAULT 'BRL',
    "fee_amount" DECIMAL(19,4) NOT NULL DEFAULT 0,
    "status" "FinancialTransferStatus" NOT NULL DEFAULT 'DRAFT',
    "outgoing_bank_transaction_id" UUID,
    "incoming_bank_transaction_id" UUID,
    "reference" VARCHAR(255),
    "created_by" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "financial_transfers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "financial_accounts_legal_entity_id_status_idx" ON "financial_accounts"("legal_entity_id", "status");

-- CreateIndex
CREATE INDEX "financial_accounts_legal_entity_id_type_idx" ON "financial_accounts"("legal_entity_id", "type");

-- CreateIndex
CREATE UNIQUE INDEX "management_accounts_code_key" ON "management_accounts"("code");

-- CreateIndex
CREATE INDEX "management_accounts_parent_id_idx" ON "management_accounts"("parent_id");

-- CreateIndex
CREATE INDEX "management_accounts_classification_status_idx" ON "management_accounts"("classification", "status");

-- CreateIndex
CREATE UNIQUE INDEX "cost_centers_code_key" ON "cost_centers"("code");

-- CreateIndex
CREATE INDEX "cost_centers_parent_id_idx" ON "cost_centers"("parent_id");

-- CreateIndex
CREATE INDEX "cost_centers_status_idx" ON "cost_centers"("status");

-- CreateIndex
CREATE UNIQUE INDEX "result_centers_code_key" ON "result_centers"("code");

-- CreateIndex
CREATE INDEX "result_centers_parent_id_idx" ON "result_centers"("parent_id");

-- CreateIndex
CREATE INDEX "result_centers_status_idx" ON "result_centers"("status");

-- CreateIndex
CREATE INDEX "financial_periods_legal_entity_id_status_idx" ON "financial_periods"("legal_entity_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "financial_periods_legal_entity_id_year_month_key" ON "financial_periods"("legal_entity_id", "year", "month");

-- CreateIndex
CREATE INDEX "payables_legal_entity_id_status_idx" ON "payables"("legal_entity_id", "status");

-- CreateIndex
CREATE INDEX "payables_counterparty_id_status_idx" ON "payables"("counterparty_id", "status");

-- CreateIndex
CREATE INDEX "payables_competence_date_idx" ON "payables"("competence_date");

-- CreateIndex
CREATE INDEX "payables_project_id_idx" ON "payables"("project_id");

-- CreateIndex
CREATE INDEX "payables_cost_center_id_idx" ON "payables"("cost_center_id");

-- CreateIndex
CREATE INDEX "payables_management_account_id_idx" ON "payables"("management_account_id");

-- CreateIndex
CREATE INDEX "payables_document_number_idx" ON "payables"("document_number");

-- CreateIndex
CREATE INDEX "payable_installments_due_date_status_idx" ON "payable_installments"("due_date", "status");

-- CreateIndex
CREATE UNIQUE INDEX "payable_installments_payable_id_sequence_key" ON "payable_installments"("payable_id", "sequence");

-- CreateIndex
CREATE UNIQUE INDEX "payments_reverses_payment_id_key" ON "payments"("reverses_payment_id");

-- CreateIndex
CREATE INDEX "payments_legal_entity_id_payment_date_idx" ON "payments"("legal_entity_id", "payment_date");

-- CreateIndex
CREATE INDEX "payments_financial_account_id_payment_date_idx" ON "payments"("financial_account_id", "payment_date");

-- CreateIndex
CREATE INDEX "payments_status_idx" ON "payments"("status");

-- CreateIndex
CREATE INDEX "payment_allocations_payable_installment_id_idx" ON "payment_allocations"("payable_installment_id");

-- CreateIndex
CREATE UNIQUE INDEX "payment_allocations_payment_id_payable_installment_id_key" ON "payment_allocations"("payment_id", "payable_installment_id");

-- CreateIndex
CREATE INDEX "receivables_legal_entity_id_status_idx" ON "receivables"("legal_entity_id", "status");

-- CreateIndex
CREATE INDEX "receivables_customer_id_status_idx" ON "receivables"("customer_id", "status");

-- CreateIndex
CREATE INDEX "receivables_competence_date_idx" ON "receivables"("competence_date");

-- CreateIndex
CREATE INDEX "receivables_project_id_idx" ON "receivables"("project_id");

-- CreateIndex
CREATE INDEX "receivables_cost_center_id_idx" ON "receivables"("cost_center_id");

-- CreateIndex
CREATE INDEX "receivables_result_center_id_idx" ON "receivables"("result_center_id");

-- CreateIndex
CREATE INDEX "receivables_management_account_id_idx" ON "receivables"("management_account_id");

-- CreateIndex
CREATE INDEX "receivables_document_number_idx" ON "receivables"("document_number");

-- CreateIndex
CREATE INDEX "receivable_installments_due_date_status_idx" ON "receivable_installments"("due_date", "status");

-- CreateIndex
CREATE UNIQUE INDEX "receivable_installments_receivable_id_sequence_key" ON "receivable_installments"("receivable_id", "sequence");

-- CreateIndex
CREATE UNIQUE INDEX "receipts_reverses_receipt_id_key" ON "receipts"("reverses_receipt_id");

-- CreateIndex
CREATE INDEX "receipts_legal_entity_id_receipt_date_idx" ON "receipts"("legal_entity_id", "receipt_date");

-- CreateIndex
CREATE INDEX "receipts_financial_account_id_receipt_date_idx" ON "receipts"("financial_account_id", "receipt_date");

-- CreateIndex
CREATE INDEX "receipts_status_idx" ON "receipts"("status");

-- CreateIndex
CREATE INDEX "receipt_allocations_receivable_installment_id_idx" ON "receipt_allocations"("receivable_installment_id");

-- CreateIndex
CREATE UNIQUE INDEX "receipt_allocations_receipt_id_receivable_installment_id_key" ON "receipt_allocations"("receipt_id", "receivable_installment_id");

-- CreateIndex
CREATE INDEX "bank_statement_imports_financial_account_id_period_start_pe_idx" ON "bank_statement_imports"("financial_account_id", "period_start", "period_end");

-- CreateIndex
CREATE UNIQUE INDEX "bank_statement_imports_financial_account_id_file_hash_key" ON "bank_statement_imports"("financial_account_id", "file_hash");

-- CreateIndex
CREATE INDEX "bank_transactions_financial_account_id_transaction_date_idx" ON "bank_transactions"("financial_account_id", "transaction_date");

-- CreateIndex
CREATE INDEX "bank_transactions_financial_account_id_reconciliation_statu_idx" ON "bank_transactions"("financial_account_id", "reconciliation_status");

-- CreateIndex
CREATE INDEX "bank_transactions_import_batch_id_idx" ON "bank_transactions"("import_batch_id");

-- CreateIndex
CREATE UNIQUE INDEX "bank_transactions_financial_account_id_external_id_key" ON "bank_transactions"("financial_account_id", "external_id");

-- CreateIndex
CREATE INDEX "bank_reconciliations_financial_account_id_statement_period__idx" ON "bank_reconciliations"("financial_account_id", "statement_period_start", "statement_period_end");

-- CreateIndex
CREATE INDEX "bank_reconciliations_status_idx" ON "bank_reconciliations"("status");

-- CreateIndex
CREATE INDEX "reconciliation_matches_reconciliation_id_idx" ON "reconciliation_matches"("reconciliation_id");

-- CreateIndex
CREATE INDEX "reconciliation_matches_bank_transaction_id_status_idx" ON "reconciliation_matches"("bank_transaction_id", "status");

-- CreateIndex
CREATE INDEX "reconciliation_matches_payment_id_idx" ON "reconciliation_matches"("payment_id");

-- CreateIndex
CREATE INDEX "reconciliation_matches_receipt_id_idx" ON "reconciliation_matches"("receipt_id");

-- CreateIndex
CREATE INDEX "reconciliation_matches_transfer_id_idx" ON "reconciliation_matches"("transfer_id");

-- CreateIndex
CREATE UNIQUE INDEX "financial_transfers_outgoing_bank_transaction_id_key" ON "financial_transfers"("outgoing_bank_transaction_id");

-- CreateIndex
CREATE UNIQUE INDEX "financial_transfers_incoming_bank_transaction_id_key" ON "financial_transfers"("incoming_bank_transaction_id");

-- CreateIndex
CREATE INDEX "financial_transfers_source_account_id_transfer_date_idx" ON "financial_transfers"("source_account_id", "transfer_date");

-- CreateIndex
CREATE INDEX "financial_transfers_destination_account_id_transfer_date_idx" ON "financial_transfers"("destination_account_id", "transfer_date");

-- CreateIndex
CREATE INDEX "financial_transfers_status_idx" ON "financial_transfers"("status");

-- AddForeignKey
ALTER TABLE "management_accounts" ADD CONSTRAINT "management_accounts_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "management_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cost_centers" ADD CONSTRAINT "cost_centers_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "cost_centers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "result_centers" ADD CONSTRAINT "result_centers_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "result_centers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payables" ADD CONSTRAINT "payables_cost_center_id_fkey" FOREIGN KEY ("cost_center_id") REFERENCES "cost_centers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payables" ADD CONSTRAINT "payables_management_account_id_fkey" FOREIGN KEY ("management_account_id") REFERENCES "management_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payable_installments" ADD CONSTRAINT "payable_installments_payable_id_fkey" FOREIGN KEY ("payable_id") REFERENCES "payables"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_financial_account_id_fkey" FOREIGN KEY ("financial_account_id") REFERENCES "financial_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_reverses_payment_id_fkey" FOREIGN KEY ("reverses_payment_id") REFERENCES "payments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_allocations" ADD CONSTRAINT "payment_allocations_payment_id_fkey" FOREIGN KEY ("payment_id") REFERENCES "payments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_allocations" ADD CONSTRAINT "payment_allocations_payable_installment_id_fkey" FOREIGN KEY ("payable_installment_id") REFERENCES "payable_installments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "receivables" ADD CONSTRAINT "receivables_cost_center_id_fkey" FOREIGN KEY ("cost_center_id") REFERENCES "cost_centers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "receivables" ADD CONSTRAINT "receivables_result_center_id_fkey" FOREIGN KEY ("result_center_id") REFERENCES "result_centers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "receivables" ADD CONSTRAINT "receivables_management_account_id_fkey" FOREIGN KEY ("management_account_id") REFERENCES "management_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "receivable_installments" ADD CONSTRAINT "receivable_installments_receivable_id_fkey" FOREIGN KEY ("receivable_id") REFERENCES "receivables"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "receipts" ADD CONSTRAINT "receipts_financial_account_id_fkey" FOREIGN KEY ("financial_account_id") REFERENCES "financial_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "receipts" ADD CONSTRAINT "receipts_reverses_receipt_id_fkey" FOREIGN KEY ("reverses_receipt_id") REFERENCES "receipts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "receipt_allocations" ADD CONSTRAINT "receipt_allocations_receipt_id_fkey" FOREIGN KEY ("receipt_id") REFERENCES "receipts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "receipt_allocations" ADD CONSTRAINT "receipt_allocations_receivable_installment_id_fkey" FOREIGN KEY ("receivable_installment_id") REFERENCES "receivable_installments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bank_statement_imports" ADD CONSTRAINT "bank_statement_imports_financial_account_id_fkey" FOREIGN KEY ("financial_account_id") REFERENCES "financial_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bank_transactions" ADD CONSTRAINT "bank_transactions_financial_account_id_fkey" FOREIGN KEY ("financial_account_id") REFERENCES "financial_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bank_transactions" ADD CONSTRAINT "bank_transactions_import_batch_id_fkey" FOREIGN KEY ("import_batch_id") REFERENCES "bank_statement_imports"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bank_reconciliations" ADD CONSTRAINT "bank_reconciliations_financial_account_id_fkey" FOREIGN KEY ("financial_account_id") REFERENCES "financial_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reconciliation_matches" ADD CONSTRAINT "reconciliation_matches_reconciliation_id_fkey" FOREIGN KEY ("reconciliation_id") REFERENCES "bank_reconciliations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reconciliation_matches" ADD CONSTRAINT "reconciliation_matches_bank_transaction_id_fkey" FOREIGN KEY ("bank_transaction_id") REFERENCES "bank_transactions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reconciliation_matches" ADD CONSTRAINT "reconciliation_matches_payment_id_fkey" FOREIGN KEY ("payment_id") REFERENCES "payments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reconciliation_matches" ADD CONSTRAINT "reconciliation_matches_receipt_id_fkey" FOREIGN KEY ("receipt_id") REFERENCES "receipts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reconciliation_matches" ADD CONSTRAINT "reconciliation_matches_transfer_id_fkey" FOREIGN KEY ("transfer_id") REFERENCES "financial_transfers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "financial_transfers" ADD CONSTRAINT "financial_transfers_source_account_id_fkey" FOREIGN KEY ("source_account_id") REFERENCES "financial_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "financial_transfers" ADD CONSTRAINT "financial_transfers_destination_account_id_fkey" FOREIGN KEY ("destination_account_id") REFERENCES "financial_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "financial_transfers" ADD CONSTRAINT "financial_transfers_outgoing_bank_transaction_id_fkey" FOREIGN KEY ("outgoing_bank_transaction_id") REFERENCES "bank_transactions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "financial_transfers" ADD CONSTRAINT "financial_transfers_incoming_bank_transaction_id_fkey" FOREIGN KEY ("incoming_bank_transaction_id") REFERENCES "bank_transactions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
