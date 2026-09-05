CREATE TABLE "employees" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "legal_entity_id" UUID NOT NULL,
  "name" VARCHAR(200) NOT NULL,
  "tax_document" VARCHAR(20),
  "employment_type" VARCHAR(60),
  "job_title" VARCHAR(120),
  "cost_center_id" UUID,
  "admission_date" DATE,
  "bank_name" VARCHAR(160),
  "branch" VARCHAR(30),
  "account_number" VARCHAR(60),
  "pix_key" VARCHAR(255),
  "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
  "notes" TEXT,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "employees_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "employees_legal_entity_id_status_idx" ON "employees"("legal_entity_id", "status");
CREATE INDEX "employees_legal_entity_id_tax_document_idx" ON "employees"("legal_entity_id", "tax_document");
CREATE INDEX "employees_name_idx" ON "employees"("name");
CREATE UNIQUE INDEX "employees_legal_entity_id_tax_document_present_key"
  ON "employees"("legal_entity_id", "tax_document")
  WHERE "tax_document" IS NOT NULL;
