-- CreateTable
CREATE TABLE "payment_terms" (
    "id" UUID NOT NULL,
    "code" VARCHAR(40) NOT NULL,
    "name" VARCHAR(160) NOT NULL,
    "description" TEXT,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "payment_terms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_term_installment_rules" (
    "id" UUID NOT NULL,
    "payment_term_id" UUID NOT NULL,
    "sequence" INTEGER NOT NULL,
    "days_after_base" INTEGER NOT NULL,
    "percentage" DECIMAL(9,6) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payment_term_installment_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "suppliers" (
    "id" UUID NOT NULL,
    "legal_entity_id" UUID NOT NULL,
    "legal_name" VARCHAR(200) NOT NULL,
    "trade_name" VARCHAR(200),
    "tax_document" VARCHAR(20) NOT NULL,
    "contact_name" VARCHAR(160),
    "contact_email" VARCHAR(200),
    "contact_phone" VARCHAR(40),
    "default_payment_term_id" UUID,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "notes" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "suppliers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "supplier_bank_accounts" (
    "id" UUID NOT NULL,
    "supplier_id" UUID NOT NULL,
    "bank_code" VARCHAR(20),
    "bank_name" VARCHAR(160) NOT NULL,
    "branch" VARCHAR(30),
    "account_number" VARCHAR(60) NOT NULL,
    "account_digit" VARCHAR(10),
    "holder_name" VARCHAR(200),
    "holder_document" VARCHAR(20),
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "supplier_bank_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "supplier_pix_keys" (
    "id" UUID NOT NULL,
    "supplier_id" UUID NOT NULL,
    "key_type" VARCHAR(30) NOT NULL,
    "key_value" VARCHAR(255) NOT NULL,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "supplier_pix_keys_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payable_approval_policies" (
    "id" UUID NOT NULL,
    "legal_entity_id" UUID NOT NULL,
    "approval_required_from" DECIMAL(19,4) NOT NULL DEFAULT 0,
    "updated_by" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "payable_approval_policies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payable_documents" (
    "id" UUID NOT NULL,
    "payable_id" UUID NOT NULL,
    "document_id" UUID NOT NULL,
    "type" "DocumentType",
    "label" VARCHAR(160),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payable_documents_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "payment_terms_code_key" ON "payment_terms"("code");

-- CreateIndex
CREATE INDEX "payment_term_installment_rules_payment_term_id_idx" ON "payment_term_installment_rules"("payment_term_id");

-- CreateIndex
CREATE UNIQUE INDEX "payment_term_installment_rules_payment_term_id_sequence_key" ON "payment_term_installment_rules"("payment_term_id", "sequence");

-- CreateIndex
CREATE INDEX "suppliers_legal_entity_id_status_idx" ON "suppliers"("legal_entity_id", "status");

-- CreateIndex
CREATE INDEX "suppliers_legal_name_idx" ON "suppliers"("legal_name");

-- CreateIndex
CREATE UNIQUE INDEX "suppliers_legal_entity_id_tax_document_key" ON "suppliers"("legal_entity_id", "tax_document");

-- CreateIndex
CREATE INDEX "supplier_bank_accounts_supplier_id_status_idx" ON "supplier_bank_accounts"("supplier_id", "status");

-- CreateIndex
CREATE INDEX "supplier_pix_keys_supplier_id_status_idx" ON "supplier_pix_keys"("supplier_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "supplier_pix_keys_supplier_id_key_value_key" ON "supplier_pix_keys"("supplier_id", "key_value");

-- CreateIndex
CREATE UNIQUE INDEX "payable_approval_policies_legal_entity_id_key" ON "payable_approval_policies"("legal_entity_id");

-- CreateIndex
CREATE INDEX "payable_documents_payable_id_idx" ON "payable_documents"("payable_id");

-- CreateIndex
CREATE UNIQUE INDEX "payable_documents_payable_id_document_id_key" ON "payable_documents"("payable_id", "document_id");

-- AddForeignKey
ALTER TABLE "payment_term_installment_rules" ADD CONSTRAINT "payment_term_installment_rules_payment_term_id_fkey" FOREIGN KEY ("payment_term_id") REFERENCES "payment_terms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "suppliers" ADD CONSTRAINT "suppliers_default_payment_term_id_fkey" FOREIGN KEY ("default_payment_term_id") REFERENCES "payment_terms"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supplier_bank_accounts" ADD CONSTRAINT "supplier_bank_accounts_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "suppliers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supplier_pix_keys" ADD CONSTRAINT "supplier_pix_keys_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "suppliers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payable_documents" ADD CONSTRAINT "payable_documents_payable_id_fkey" FOREIGN KEY ("payable_id") REFERENCES "payables"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payables" ADD CONSTRAINT "payables_payment_term_id_fkey" FOREIGN KEY ("payment_term_id") REFERENCES "payment_terms"("id") ON DELETE SET NULL ON UPDATE CASCADE;
