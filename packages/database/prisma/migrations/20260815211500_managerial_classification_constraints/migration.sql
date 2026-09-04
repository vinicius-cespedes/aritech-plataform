-- Financial classification allocations must reference exactly one source.
ALTER TABLE "financial_classification_allocations"
ADD CONSTRAINT "financial_classification_allocations_single_source_check"
CHECK (
  ("source_type" = 'PAYABLE' AND "payable_id" IS NOT NULL AND "receivable_id" IS NULL)
  OR
  ("source_type" = 'RECEIVABLE' AND "receivable_id" IS NOT NULL AND "payable_id" IS NULL)
);

-- Allocation amounts are always represented as positive monetary values.
ALTER TABLE "financial_classification_allocations"
ADD CONSTRAINT "financial_classification_allocations_amount_positive_check"
CHECK ("amount" > 0);

-- Percentages are optional, but when present must be within the business range.
ALTER TABLE "financial_classification_allocations"
ADD CONSTRAINT "financial_classification_allocations_percentage_range_check"
CHECK ("percentage" IS NULL OR ("percentage" > 0 AND "percentage" <= 100));
