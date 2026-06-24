-- Backfill missing national IDs before enforcing NOT NULL + unique
UPDATE "Merchant"
SET "nationalIdNumber" = 'LEGACY-' || "id"
WHERE "nationalIdNumber" IS NULL OR trim("nationalIdNumber") = '';

-- CreateIndex
CREATE UNIQUE INDEX "Merchant_nationalIdNumber_key" ON "Merchant"("nationalIdNumber");

-- AlterTable
ALTER TABLE "Merchant" ALTER COLUMN "nationalIdNumber" SET NOT NULL;
