-- AlterTable
ALTER TABLE "contracts" ADD COLUMN     "resultCenterId" TEXT;

-- AlterTable
ALTER TABLE "cost_centers" ADD COLUMN     "contractId" TEXT;

-- CreateIndex
CREATE INDEX "contracts_resultCenterId_idx" ON "contracts"("resultCenterId");

-- CreateIndex
CREATE UNIQUE INDEX "cost_centers_contractId_key" ON "cost_centers"("contractId");

-- AddForeignKey
ALTER TABLE "contracts" ADD CONSTRAINT "contracts_resultCenterId_fkey" FOREIGN KEY ("resultCenterId") REFERENCES "result_centers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cost_centers" ADD CONSTRAINT "cost_centers_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "contracts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

