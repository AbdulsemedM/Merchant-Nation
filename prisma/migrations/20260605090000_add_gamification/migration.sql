-- AlterTable
ALTER TABLE "Notification" ADD COLUMN "channel" TEXT NOT NULL DEFAULT 'IN_APP';
ALTER TABLE "Notification" ADD COLUMN "metadata" JSONB;
ALTER TABLE "Notification" ADD COLUMN "priority" TEXT NOT NULL DEFAULT 'NORMAL';

-- CreateTable
CREATE TABLE "Achievement" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "xpReward" INTEGER NOT NULL DEFAULT 0,
    "unlockedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB,

    CONSTRAINT "Achievement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScratchCard" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "rewardType" TEXT NOT NULL,
    "rewardValue" INTEGER NOT NULL,
    "revealed" BOOLEAN NOT NULL DEFAULT false,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revealedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ScratchCard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyChallenge" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetValue" INTEGER NOT NULL,
    "currentValue" INTEGER NOT NULL DEFAULT 0,
    "xpReward" INTEGER NOT NULL,
    "bonusReward" TEXT,
    "date" DATE NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DailyChallenge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserStreak" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "currentStreak" INTEGER NOT NULL DEFAULT 0,
    "longestStreak" INTEGER NOT NULL DEFAULT 0,
    "lastActionDate" DATE NOT NULL,
    "freezeShields" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserStreak_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FlashMission" (
    "id" TEXT NOT NULL,
    "zoneId" TEXT,
    "branchId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "xpMultiplier" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "bonusReward" INTEGER NOT NULL DEFAULT 0,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3) NOT NULL,
    "maxClaims" INTEGER NOT NULL DEFAULT 10,
    "currentClaims" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FlashMission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserFlashMissionClaim" (
    "id" TEXT NOT NULL,
    "flashMissionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "claimedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "UserFlashMissionClaim_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserNotificationPreference" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "motivationType" TEXT NOT NULL DEFAULT 'ACHIEVER',
    "maxPerDay" INTEGER NOT NULL DEFAULT 5,
    "quietHoursStart" TEXT NOT NULL DEFAULT '20:00',
    "quietHoursEnd" TEXT NOT NULL DEFAULT '07:00',
    "channels" JSONB NOT NULL DEFAULT '{"IN_APP": true, "TELEGRAM": false, "WEB_PUSH": true, "WHATSAPP": false}',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserNotificationPreference_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Achievement_userId_type_idx" ON "Achievement"("userId", "type");

-- CreateIndex
CREATE UNIQUE INDEX "Achievement_userId_code_key" ON "Achievement"("userId", "code");

-- CreateIndex
CREATE INDEX "ScratchCard_userId_revealed_expiresAt_idx" ON "ScratchCard"("userId", "revealed", "expiresAt");

-- CreateIndex
CREATE INDEX "DailyChallenge_userId_date_idx" ON "DailyChallenge"("userId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "DailyChallenge_userId_date_title_key" ON "DailyChallenge"("userId", "date", "title");

-- CreateIndex
CREATE UNIQUE INDEX "UserStreak_userId_key" ON "UserStreak"("userId");

-- CreateIndex
CREATE INDEX "UserStreak_currentStreak_idx" ON "UserStreak"("currentStreak");

-- CreateIndex
CREATE INDEX "FlashMission_branchId_active_endsAt_idx" ON "FlashMission"("branchId", "active", "endsAt");

-- CreateIndex
CREATE INDEX "UserFlashMissionClaim_userId_completed_idx" ON "UserFlashMissionClaim"("userId", "completed");

-- CreateIndex
CREATE UNIQUE INDEX "UserFlashMissionClaim_flashMissionId_userId_key" ON "UserFlashMissionClaim"("flashMissionId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserNotificationPreference_userId_key" ON "UserNotificationPreference"("userId");

-- AddForeignKey
ALTER TABLE "Achievement" ADD CONSTRAINT "Achievement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScratchCard" ADD CONSTRAINT "ScratchCard_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyChallenge" ADD CONSTRAINT "DailyChallenge_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserStreak" ADD CONSTRAINT "UserStreak_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FlashMission" ADD CONSTRAINT "FlashMission_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FlashMission" ADD CONSTRAINT "FlashMission_zoneId_fkey" FOREIGN KEY ("zoneId") REFERENCES "Zone"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserFlashMissionClaim" ADD CONSTRAINT "UserFlashMissionClaim_flashMissionId_fkey" FOREIGN KEY ("flashMissionId") REFERENCES "FlashMission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserFlashMissionClaim" ADD CONSTRAINT "UserFlashMissionClaim_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserNotificationPreference" ADD CONSTRAINT "UserNotificationPreference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
