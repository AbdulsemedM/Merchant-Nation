-- AlterTable
ALTER TABLE "Lead" ADD COLUMN "inductionNote" TEXT,
ADD COLUMN "futureProductInterests" TEXT[] DEFAULT ARRAY[]::TEXT[];
