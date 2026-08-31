ALTER TABLE "suppliers" ALTER COLUMN "legal_name" DROP NOT NULL;
ALTER TABLE "suppliers" ALTER COLUMN "tax_document" DROP NOT NULL;
ALTER TABLE "suppliers" ADD COLUMN "industry" VARCHAR(100);
ALTER TABLE "suppliers" ADD COLUMN "contact_phone_country_code" VARCHAR(8);
DROP INDEX IF EXISTS "suppliers_legal_entity_id_tax_document_key";
CREATE INDEX IF NOT EXISTS "suppliers_legal_entity_id_tax_document_idx" ON "suppliers"("legal_entity_id", "tax_document");
CREATE UNIQUE INDEX IF NOT EXISTS "suppliers_legal_entity_id_tax_document_not_null_key" ON "suppliers"("legal_entity_id", "tax_document") WHERE "tax_document" IS NOT NULL;
