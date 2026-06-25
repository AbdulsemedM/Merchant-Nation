-- AlterEnum: add TEAM_LEAD to Role
ALTER TYPE "Role" ADD VALUE 'TEAM_LEAD';

-- CreateEnum
CREATE TYPE "BranchPermission" AS ENUM ('MANAGE_USERS', 'MANAGE_TEAMS', 'MANAGE_MISSIONS', 'MANAGE_TERRITORY', 'VIEW_REPORTS');

-- CreateTable
CREATE TABLE "UserPermissionGrant" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "permission" "BranchPermission" NOT NULL,
    "grantedById" TEXT NOT NULL,
    "teamScopeKey" TEXT NOT NULL DEFAULT '',
    "expiresAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserPermissionGrant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserBranchTransfer" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fromBranchId" TEXT,
    "toBranchId" TEXT NOT NULL,
    "initiatedById" TEXT NOT NULL,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserBranchTransfer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserPermissionGrant_userId_branchId_permission_teamScopeKey_key" ON "UserPermissionGrant"("userId", "branchId", "permission", "teamScopeKey");

-- CreateIndex
CREATE INDEX "UserPermissionGrant_userId_branchId_idx" ON "UserPermissionGrant"("userId", "branchId");

-- CreateIndex
CREATE INDEX "UserBranchTransfer_userId_createdAt_idx" ON "UserBranchTransfer"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "UserPermissionGrant" ADD CONSTRAINT "UserPermissionGrant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPermissionGrant" ADD CONSTRAINT "UserPermissionGrant_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPermissionGrant" ADD CONSTRAINT "UserPermissionGrant_grantedById_fkey" FOREIGN KEY ("grantedById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserBranchTransfer" ADD CONSTRAINT "UserBranchTransfer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserBranchTransfer" ADD CONSTRAINT "UserBranchTransfer_initiatedById_fkey" FOREIGN KEY ("initiatedById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
