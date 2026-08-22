/*
  Warnings:

  - You are about to drop the column `cash_flow_group` on the `management_accounts` table. All the data in the column will be lost.
  - You are about to drop the column `classification` on the `management_accounts` table. All the data in the column will be lost.
  - You are about to drop the column `dre_group` on the `management_accounts` table. All the data in the column will be lost.
  - You are about to drop the column `cost_center_id` on the `payables` table. All the data in the column will be lost.
  - You are about to drop the column `management_account_id` on the `payables` table. All the data in the column will be lost.
  - You are about to drop the column `project_id` on the `payables` table. All the data in the column will be lost.
  - You are about to drop the column `cost_center_id` on the `receivables` table. All the data in the column will be lost.
  - You are about to drop the column `management_account_id` on the `receivables` table. All the data in the column will be lost.
  - You are about to drop the column `project_id` on the `receivables` table. All the data in the column will be lost.
  - You are about to drop the column `result_center_id` on the `receivables` table. All the data in the column will be lost.
  - You are about to drop the `result_centers` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `economic_nature` to the `management_accounts` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "EconomicNature" AS ENUM ('OPERATING_REVENUE', 'DIRECT_COST', 'OPERATING_EXPENSE', 'FINANCIAL_INCOME', 'FINANCIAL_EXPENSE', 'TAX', 'INVESTMENT', 'FINANCING', 'EQUITY', 'TRANSFER', 'ADJUSTMENT');

-- CreateEnum
CREATE TYPE "CostBehavior" AS ENUM ('FIXED', 'VARIABLE', 'SEMI_VARIABLE', 'CONTEXT_DEPENDENT', 'NOT_APPLICABLE');

-- CreateEnum
CREATE TYPE "CostDirectness" AS ENUM ('DIRECT', 'INDIRECT', 'CONTEXT_DEPENDENT', 'NOT_APPLICABLE');

-- CreateEnum
CREATE TYPE "FinancialAllocationSourceType" AS ENUM ('PAYABLE', 'RECEIVABLE');

-- DropForeignKey
ALTER TABLE "payables" DROP CONSTRAINT "payables_cost_center_id_fkey";

-- DropForeignKey
ALTER TABLE "payables" DROP CONSTRAINT "payables_management_account_id_fkey";

-- DropForeignKey
ALTER TABLE "receivables" DROP CONSTRAINT "receivables_cost_center_id_fkey";

-- DropForeignKey
ALTER TABLE "receivables" DROP CONSTRAINT "receivables_management_account_id_fkey";

-- DropForeignKey
ALTER TABLE "receivables" DROP CONSTRAINT "receivables_result_center_id_fkey";

-- DropForeignKey
ALTER TABLE "result_centers" DROP CONSTRAINT "result_centers_parent_id_fkey";

-- DropIndex
DROP INDEX "management_accounts_classification_status_idx";

-- DropIndex
DROP INDEX "payables_cost_center_id_idx";

-- DropIndex
DROP INDEX "payables_management_account_id_idx";

-- DropIndex
DROP INDEX "payables_project_id_idx";

-- DropIndex
DROP INDEX "receivables_cost_center_id_idx";

-- DropIndex
DROP INDEX "receivables_management_account_id_idx";

-- DropIndex
DROP INDEX "receivables_project_id_idx";

-- DropIndex
DROP INDEX "receivables_result_center_id_idx";

-- AlterTable
ALTER TABLE "management_accounts" DROP COLUMN "cash_flow_group",
DROP COLUMN "classification",
DROP COLUMN "dre_group",
ADD COLUMN     "cash_flow_group_id" UUID,
ADD COLUMN     "default_cost_behavior" "CostBehavior" NOT NULL DEFAULT 'NOT_APPLICABLE',
ADD COLUMN     "default_cost_directness" "CostDirectness" NOT NULL DEFAULT 'NOT_APPLICABLE',
ADD COLUMN     "dre_group_id" UUID,
ADD COLUMN     "economic_nature" "EconomicNature" NOT NULL;

-- AlterTable
ALTER TABLE "payables" DROP COLUMN "cost_center_id",
DROP COLUMN "management_account_id",
DROP COLUMN "project_id";

-- AlterTable
ALTER TABLE "receivables" DROP COLUMN "cost_center_id",
DROP COLUMN "management_account_id",
DROP COLUMN "project_id",
DROP COLUMN "result_center_id";

-- DropTable
DROP TABLE "result_centers";

-- DropEnum
DROP TYPE "ManagementAccountClassification";

-- CreateTable
CREATE TABLE "dre_groups" (
    "id" UUID NOT NULL,
    "code" VARCHAR(40) NOT NULL,
    "name" VARCHAR(180) NOT NULL,
    "parent_id" UUID,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "dre_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cash_flow_groups" (
    "id" UUID NOT NULL,
    "code" VARCHAR(40) NOT NULL,
    "name" VARCHAR(180) NOT NULL,
    "parent_id" UUID,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "cash_flow_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "business_lines" (
    "id" UUID NOT NULL,
    "code" VARCHAR(40) NOT NULL,
    "name" VARCHAR(180) NOT NULL,
    "parent_id" UUID,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "valid_from" DATE,
    "valid_until" DATE,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "business_lines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "financial_classification_allocations" (
    "id" UUID NOT NULL,
    "source_type" "FinancialAllocationSourceType" NOT NULL,
    "payable_id" UUID,
    "receivable_id" UUID,
    "management_account_id" UUID NOT NULL,
    "cost_center_id" UUID,
    "business_line_id" UUID,
    "project_id" UUID,
    "contract_id" UUID,
    "amount" DECIMAL(19,4) NOT NULL,
    "percentage" DECIMAL(9,6),
    "competence_date" DATE NOT NULL,
    "cost_behavior" "CostBehavior" NOT NULL,
    "cost_directness" "CostDirectness" NOT NULL,
    "notes" TEXT,
    "created_by" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "financial_classification_allocations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "dre_groups_code_key" ON "dre_groups"("code");

-- CreateIndex
CREATE INDEX "dre_groups_parent_id_idx" ON "dre_groups"("parent_id");

-- CreateIndex
CREATE INDEX "dre_groups_status_display_order_idx" ON "dre_groups"("status", "display_order");

-- CreateIndex
CREATE UNIQUE INDEX "cash_flow_groups_code_key" ON "cash_flow_groups"("code");

-- CreateIndex
CREATE INDEX "cash_flow_groups_parent_id_idx" ON "cash_flow_groups"("parent_id");

-- CreateIndex
CREATE INDEX "cash_flow_groups_status_display_order_idx" ON "cash_flow_groups"("status", "display_order");

-- CreateIndex
CREATE UNIQUE INDEX "business_lines_code_key" ON "business_lines"("code");

-- CreateIndex
CREATE INDEX "business_lines_parent_id_idx" ON "business_lines"("parent_id");

-- CreateIndex
CREATE INDEX "business_lines_status_idx" ON "business_lines"("status");

-- CreateIndex
CREATE INDEX "financial_classification_allocations_payable_id_idx" ON "financial_classification_allocations"("payable_id");

-- CreateIndex
CREATE INDEX "financial_classification_allocations_receivable_id_idx" ON "financial_classification_allocations"("receivable_id");

-- CreateIndex
CREATE INDEX "financial_classification_allocations_management_account_id_idx" ON "financial_classification_allocations"("management_account_id");

-- CreateIndex
CREATE INDEX "financial_classification_allocations_cost_center_id_idx" ON "financial_classification_allocations"("cost_center_id");

-- CreateIndex
CREATE INDEX "financial_classification_allocations_business_line_id_idx" ON "financial_classification_allocations"("business_line_id");

-- CreateIndex
CREATE INDEX "financial_classification_allocations_project_id_idx" ON "financial_classification_allocations"("project_id");

-- CreateIndex
CREATE INDEX "financial_classification_allocations_contract_id_idx" ON "financial_classification_allocations"("contract_id");

-- CreateIndex
CREATE INDEX "financial_classification_allocations_competence_date_idx" ON "financial_classification_allocations"("competence_date");

-- CreateIndex
CREATE INDEX "management_accounts_economic_nature_status_idx" ON "management_accounts"("economic_nature", "status");

-- CreateIndex
CREATE INDEX "management_accounts_dre_group_id_idx" ON "management_accounts"("dre_group_id");

-- CreateIndex
CREATE INDEX "management_accounts_cash_flow_group_id_idx" ON "management_accounts"("cash_flow_group_id");

-- CreateIndex
CREATE INDEX "payables_contract_id_idx" ON "payables"("contract_id");

-- CreateIndex
CREATE INDEX "payables_purchase_order_id_idx" ON "payables"("purchase_order_id");

-- CreateIndex
CREATE INDEX "receivables_contract_id_idx" ON "receivables"("contract_id");

-- CreateIndex
CREATE INDEX "receivables_billing_schedule_item_id_idx" ON "receivables"("billing_schedule_item_id");

-- CreateIndex
CREATE INDEX "receivables_measurement_id_idx" ON "receivables"("measurement_id");

-- AddForeignKey
ALTER TABLE "dre_groups" ADD CONSTRAINT "dre_groups_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "dre_groups"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cash_flow_groups" ADD CONSTRAINT "cash_flow_groups_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "cash_flow_groups"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "management_accounts" ADD CONSTRAINT "management_accounts_dre_group_id_fkey" FOREIGN KEY ("dre_group_id") REFERENCES "dre_groups"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "management_accounts" ADD CONSTRAINT "management_accounts_cash_flow_group_id_fkey" FOREIGN KEY ("cash_flow_group_id") REFERENCES "cash_flow_groups"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "business_lines" ADD CONSTRAINT "business_lines_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "business_lines"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "financial_classification_allocations" ADD CONSTRAINT "financial_classification_allocations_payable_id_fkey" FOREIGN KEY ("payable_id") REFERENCES "payables"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "financial_classification_allocations" ADD CONSTRAINT "financial_classification_allocations_receivable_id_fkey" FOREIGN KEY ("receivable_id") REFERENCES "receivables"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "financial_classification_allocations" ADD CONSTRAINT "financial_classification_allocations_management_account_id_fkey" FOREIGN KEY ("management_account_id") REFERENCES "management_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "financial_classification_allocations" ADD CONSTRAINT "financial_classification_allocations_cost_center_id_fkey" FOREIGN KEY ("cost_center_id") REFERENCES "cost_centers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "financial_classification_allocations" ADD CONSTRAINT "financial_classification_allocations_business_line_id_fkey" FOREIGN KEY ("business_line_id") REFERENCES "business_lines"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
