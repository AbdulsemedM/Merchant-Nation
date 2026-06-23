-- AlterTable
ALTER TABLE "Lead" ADD COLUMN "registeredProductInterests" TEXT[] DEFAULT ARRAY[]::TEXT[];
