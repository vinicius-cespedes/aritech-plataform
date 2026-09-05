ALTER TABLE "payables"
ADD COLUMN IF NOT EXISTS "obligation_type" VARCHAR(60);

CREATE INDEX IF NOT EXISTS "payables_obligation_type_idx"
ON "payables" ("obligation_type");
