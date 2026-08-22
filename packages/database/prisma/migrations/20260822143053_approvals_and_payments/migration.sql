-- CreateEnum
CREATE TYPE "PayableApprovalDecision" AS ENUM ('APPROVED', 'REJECTED', 'INVALIDATED');

-- CreateEnum
CREATE TYPE "PaymentOrigin" AS ENUM ('MANUAL', 'RECONCILIATION');

-- AlterTable
ALTER TABLE "payments" ADD COLUMN     "origin" "PaymentOrigin" NOT NULL DEFAULT 'MANUAL',
ADD COLUMN     "reversal_reason" TEXT;

-- CreateTable
CREATE TABLE "payable_approvals" (
    "id" UUID NOT NULL,
    "payable_id" UUID NOT NULL,
    "payable_version" INTEGER NOT NULL,
    "decision" "PayableApprovalDecision" NOT NULL,
    "actor_id" UUID NOT NULL,
    "reason" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payable_approvals_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "payable_approvals_payable_id_payable_version_created_at_idx" ON "payable_approvals"("payable_id", "payable_version", "created_at");

-- CreateIndex
CREATE INDEX "payable_approvals_actor_id_created_at_idx" ON "payable_approvals"("actor_id", "created_at");

-- AddForeignKey
ALTER TABLE "payable_approvals" ADD CONSTRAINT "payable_approvals_payable_id_fkey" FOREIGN KEY ("payable_id") REFERENCES "payables"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
