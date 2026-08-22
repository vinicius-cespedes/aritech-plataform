/*
  Warnings:

  - Added the required column `economic_nature` to the `financial_classification_allocations` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "financial_classification_allocations" ADD COLUMN     "cash_flow_group_id" UUID,
ADD COLUMN     "dre_group_id" UUID,
ADD COLUMN     "economic_nature" "EconomicNature" NOT NULL;

-- CreateIndex
CREATE INDEX "financial_classification_allocations_economic_nature_idx" ON "financial_classification_allocations"("economic_nature");

-- CreateIndex
CREATE INDEX "financial_classification_allocations_dre_group_id_idx" ON "financial_classification_allocations"("dre_group_id");

-- CreateIndex
CREATE INDEX "financial_classification_allocations_cash_flow_group_id_idx" ON "financial_classification_allocations"("cash_flow_group_id");

-- AddForeignKey
ALTER TABLE "financial_classification_allocations" ADD CONSTRAINT "financial_classification_allocations_dre_group_id_fkey" FOREIGN KEY ("dre_group_id") REFERENCES "dre_groups"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "financial_classification_allocations" ADD CONSTRAINT "financial_classification_allocations_cash_flow_group_id_fkey" FOREIGN KEY ("cash_flow_group_id") REFERENCES "cash_flow_groups"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
