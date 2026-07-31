-- AlterTable
ALTER TABLE "Merchant" ADD COLUMN "globalMerchantId" TEXT;
ALTER TABLE "Merchant" ADD COLUMN "directorySyncedAt" TIMESTAMP(3);
ALTER TABLE "Merchant" ADD COLUMN "directoryVerificationStatus" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Merchant_globalMerchantId_key" ON "Merchant"("globalMerchantId");
