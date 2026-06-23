/**
 * Reset operational data on the connected database, keeping seed + reference tables.
 *
 * Preserves: seed users, branches, scout categories, ranks, external banks, deployment assets.
 * Deletes: leads, merchants, missions, zones, territory cells, gamification, non-seed users, etc.
 *
 * Usage (PowerShell):
 *   $env:CONFIRM_NEON_RESET="yes"; npm run db:reset-to-seed
 *
 * Usage (bash):
 *   CONFIRM_NEON_RESET=yes npm run db:reset-to-seed
 */

import { PrismaClient } from "@prisma/client";
import { execSync } from "child_process";
import { existsSync, readFileSync } from "fs";
import { join } from "path";

/** Load .env when run outside Prisma CLI (e.g. npm run db:reset-to-seed). */
function loadEnvFile() {
  const envPath = join(process.cwd(), ".env");
  if (!existsSync(envPath)) return;
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    if (process.env[key] !== undefined) continue;
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    process.env[key] = value;
  }
}

loadEnvFile();

const SEED_EMAILS = [
  "player@example.com",
  "manager@example.com",
  "admin@example.com",
];

const prisma = new PrismaClient({
  datasources: {
    db: {
      // Prefer direct connection for multi-step maintenance scripts on Neon.
      url: process.env.DIRECT_URL || process.env.DATABASE_URL,
    },
  },
});

function maskDatabaseUrl(url) {
  if (!url) return "(not set)";
  try {
    const u = new URL(url);
    const user = u.username ? `${u.username.slice(0, 2)}***` : "";
    return `${u.protocol}//${user}@${u.hostname}${u.pathname}`;
  } catch {
    return "(invalid DATABASE_URL)";
  }
}

function assertSafetyGuards() {
  const hasConfirmFlag = process.argv.includes("--confirm");
  const hasEnvConfirm = process.env.CONFIRM_NEON_RESET === "yes";

  if (!hasConfirmFlag || !hasEnvConfirm) {
    console.error(
      "Refusing to run without explicit confirmation.\n" +
        "  Required: CONFIRM_NEON_RESET=yes and --confirm\n" +
        "  Example: CONFIRM_NEON_RESET=yes npm run db:reset-to-seed -- --confirm"
    );
    process.exit(1);
  }

  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is not set.");
    process.exit(1);
  }
}

async function findHeadOfficeBranch(client) {
  return (
    (await client.branch.findFirst({ where: { externalId: 1 } })) ??
    (await client.branch.findFirst({ where: { branchCode: "ET0010001" } })) ??
    (await client.branch.findFirst())
  );
}

async function findSeedAlphaTeam(client, headOfficeBranchId) {
  if (!headOfficeBranchId) return null;
  return client.team.findFirst({
    where: { branchId: headOfficeBranchId, name: "Alpha" },
  });
}

async function wipeOperationalData() {
  const counts = {};
  const db = prisma;

  // Run deletes sequentially (not one long interactive transaction).
  // Neon + Prisma interactive txs often hit P2028 after the default 5s timeout.
  counts.merchantDeploymentAsset = (await db.merchantDeploymentAsset.deleteMany()).count;
  counts.merchant = (await db.merchant.deleteMany()).count;
  counts.userFlashMissionClaim = (await db.userFlashMissionClaim.deleteMany()).count;
  counts.flashMission = (await db.flashMission.deleteMany()).count;
  counts.inductionDraft = (await db.inductionDraft.deleteMany()).count;
  counts.lead = (await db.lead.deleteMany()).count;
  counts.missionTask = (await db.missionTask.deleteMany()).count;
  counts.missionGoal = (await db.missionGoal.deleteMany()).count;
  counts.mission = (await db.mission.deleteMany()).count;
  counts.dailyReport = (await db.dailyReport.deleteMany()).count;
  counts.notification = (await db.notification.deleteMany()).count;
  counts.achievement = (await db.achievement.deleteMany()).count;
  counts.scratchCard = (await db.scratchCard.deleteMany()).count;
  counts.dailyChallenge = (await db.dailyChallenge.deleteMany()).count;
  counts.userStreak = (await db.userStreak.deleteMany()).count;
  counts.userNotificationPreference = (await db.userNotificationPreference.deleteMany()).count;
  counts.activityLog = (await db.activityLog.deleteMany()).count;

  await db.zone.updateMany({ data: { ownerId: null } });
  counts.zone = (await db.zone.deleteMany()).count;
  counts.territoryCell = (await db.territoryCell.deleteMany()).count;
  counts.branchTerritoryBoundsCleared = (
    await db.branch.updateMany({ data: { territoryBounds: null } })
  ).count;

  counts.nonSeedUsers = (
    await db.user.deleteMany({
      where: {
        OR: [{ email: null }, { email: { notIn: SEED_EMAILS } }],
      },
    })
  ).count;

  const headOffice = await findHeadOfficeBranch(db);
  const alphaTeam = headOffice ? await findSeedAlphaTeam(db, headOffice.id) : null;

  if (alphaTeam) {
    counts.extraTeams = (
      await db.team.deleteMany({
        where: { id: { not: alphaTeam.id } },
      })
    ).count;
  } else {
    counts.extraTeams = (await db.team.deleteMany()).count;
  }

  counts.seedUsersReset = (
    await db.user.updateMany({
      where: { email: { in: SEED_EMAILS } },
      data: {
        xp: 0,
        rank: "CADET",
        mustChangePassword: false,
      },
    })
  ).count;

  return counts;
}

async function countPreserved() {
  const [users, ranks, externalBanks, deploymentAssets, branches, scoutCategories, teams] =
    await Promise.all([
      prisma.user.count(),
      prisma.rank.count(),
      prisma.externalBank.count(),
      prisma.deploymentAsset.count(),
      prisma.branch.count(),
      prisma.scoutCategory.count(),
      prisma.team.count(),
    ]);

  return { users, ranks, externalBanks, deploymentAssets, branches, scoutCategories, teams };
}

async function main() {
  assertSafetyGuards();

  console.log("Target database:", maskDatabaseUrl(process.env.DATABASE_URL));
  console.log("Starting reset to seeded state...\n");

  const deleted = await wipeOperationalData();
  console.log("Deleted rows:");
  for (const [table, count] of Object.entries(deleted)) {
    console.log(`  ${table}: ${count}`);
  }

  console.log("\nRe-running prisma db seed...");
  execSync("npx prisma db seed", { stdio: "inherit", cwd: process.cwd() });

  const preserved = await countPreserved();
  console.log("\nPreserved / post-seed counts:");
  console.log(`  users: ${preserved.users}`);
  console.log(`  teams: ${preserved.teams}`);
  console.log(`  branches: ${preserved.branches}`);
  console.log(`  scoutCategories: ${preserved.scoutCategories}`);
  console.log(`  ranks: ${preserved.ranks}`);
  console.log(`  externalBanks: ${preserved.externalBanks}`);
  console.log(`  deploymentAssets: ${preserved.deploymentAssets}`);

  const operational = await Promise.all([
    prisma.lead.count(),
    prisma.merchant.count(),
    prisma.mission.count(),
    prisma.zone.count(),
    prisma.territoryCell.count(),
    prisma.notification.count(),
  ]);

  console.log("\nOperational data (should all be 0):");
  console.log(`  leads: ${operational[0]}, merchants: ${operational[1]}, missions: ${operational[2]}`);
  console.log(`  zones: ${operational[3]}, territoryCells: ${operational[4]}, notifications: ${operational[5]}`);

  console.log("\nReset complete. Login with:");
  console.log("  player@example.com / DevPassword1!");
  console.log("  manager@example.com / DevPassword1!");
  console.log("  admin@example.com / DevPassword1!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
