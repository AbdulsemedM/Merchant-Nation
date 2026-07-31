/**
 * Backfill Coop Merchant Platform globalMerchantId for existing merchants.
 *
 * Idempotent per (MERCHANTNATION, Merchant.id) via find-or-create.
 *
 * Usage:
 *   node scripts/backfill-global-merchant-ids.mjs
 *   node scripts/backfill-global-merchant-ids.mjs --dry-run
 *   node scripts/backfill-global-merchant-ids.mjs --limit 50
 *
 * Requires MERCHANT_DIRECTORY_URL and MERCHANT_DIRECTORY_API_KEY in .env
 */

import { PrismaClient } from "@prisma/client";
import { existsSync, readFileSync } from "fs";
import { join } from "path";

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

const prisma = new PrismaClient();

const dryRun = process.argv.includes("--dry-run");
const limitArg = process.argv.find((a) => a.startsWith("--limit="));
const limit = limitArg ? Math.max(1, parseInt(limitArg.split("=")[1], 10) || 0) : null;

const baseUrl = (process.env.MERCHANT_DIRECTORY_URL ?? "").replace(/\/$/, "");
const apiKey = process.env.MERCHANT_DIRECTORY_API_KEY ?? "";
const appCode = process.env.MERCHANT_DIRECTORY_APP_CODE ?? "MERCHANTNATION";

async function findOrCreate(payload) {
  const res = await fetch(`${baseUrl}/api/v1/merchants/find-or-create`, {
    method: "POST",
    headers: {
      "X-API-Key": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Directory POST find-or-create -> ${res.status} ${detail}`);
  }
  return res.json();
}

async function main() {
  if (!baseUrl || !apiKey) {
    console.error(
      "Missing MERCHANT_DIRECTORY_URL or MERCHANT_DIRECTORY_API_KEY. Set them in .env."
    );
    process.exit(1);
  }

  const merchants = await prisma.merchant.findMany({
    where: { globalMerchantId: null },
    include: { lead: { select: { businessName: true } } },
    orderBy: { createdAt: "asc" },
    ...(limit ? { take: limit } : {}),
  });

  console.log(
    `Found ${merchants.length} merchant(s) without globalMerchantId` +
      (dryRun ? " (dry-run)" : "")
  );

  let ok = 0;
  let failed = 0;

  for (const m of merchants) {
    const businessName = m.lead?.businessName ?? m.ownerName;
    const accountNumber = m.merchantAccountNumber?.trim() || undefined;
    const payload = {
      appCode,
      externalId: m.id,
      businessName,
      ownerName: m.ownerName,
      phone: m.phoneNumber,
      tinNumber: m.tinNumber ?? undefined,
      accountNumber,
      accountHolderName: businessName,
      verifiedAgainstBank: Boolean(accountNumber),
    };

    console.log(`- ${m.id} (${businessName})`);

    if (dryRun) {
      ok++;
      continue;
    }

    try {
      const created = await findOrCreate(payload);
      if (!created?.id) {
        throw new Error("find-or-create returned no id");
      }
      await prisma.merchant.update({
        where: { id: m.id },
        data: {
          globalMerchantId: created.id,
          directorySyncedAt: new Date(),
          directoryVerificationStatus: created.verificationStatus ?? null,
        },
      });
      console.log(`  -> ${created.id}`);
      ok++;
    } catch (e) {
      failed++;
      console.error(`  FAILED: ${e instanceof Error ? e.message : e}`);
    }
  }

  console.log(`Done. ok=${ok} failed=${failed}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
