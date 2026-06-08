/**
 * Push selected env vars from .env to the linked Vercel project.
 * Usage: node scripts/push-vercel-env.mjs
 */
import { readFileSync, existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = join(__dirname, "..", ".env");

const KEYS = [
  "NEXT_PUBLIC_APP_URL",
  "NEXTAUTH_URL",
  "VAPID_PUBLIC_KEY",
  "VAPID_PRIVATE_KEY",
  "NEXT_PUBLIC_VAPID_PUBLIC_KEY",
  "VAPID_SUBJECT",
  "NOTIFICATION_SCHEDULER_SECRET",
  "NEXT_PUBLIC_GOOGLE_MAPS_API_KEY",
  "WHATSAPP_API_TOKEN",
  "WHATSAPP_PHONE_NUMBER_ID",
  "RESEND_API_KEY",
  "RESEND_FROM_EMAIL",
];

function parseEnv(content) {
  const out = {};
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    out[key] = value;
  }
  return out;
}

function upsertVercelEnv(name, value, environments = ["production", "preview"]) {
  if (!value) {
    console.log(`skip ${name} (empty)`);
    return;
  }
  for (const env of environments) {
    const rm = spawnSync("npx", ["vercel", "env", "rm", name, env, "--yes"], {
      stdio: "ignore",
      shell: true,
    });
    void rm;
    const add = spawnSync(
      "npx",
      ["vercel", "env", "add", name, env],
      {
        input: value,
        encoding: "utf-8",
        shell: true,
      },
    );
    if (add.status !== 0) {
      console.error(`failed ${name} (${env}):`, add.stderr?.toString() ?? add.stdout?.toString());
      process.exitCode = 1;
    } else {
      console.log(`set ${name} → ${env}`);
    }
  }
}

if (!existsSync(envPath)) {
  console.error("Missing .env file");
  process.exit(1);
}

const env = parseEnv(readFileSync(envPath, "utf-8"));
for (const key of KEYS) {
  upsertVercelEnv(key, env[key]);
}

console.log("\nDone. Redeploy for NEXT_PUBLIC_* changes to take effect.");
