/**
 * Import branch and POS locations from Excel into JSON for the dashboard map.
 * Re-run when Excel files are updated: npm run import:locations
 *
 * Expects at repo root:
 *   - Branch Location.xlsx
 *   - Coop POS locations.xlsx
 */

import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import XLSX from "xlsx";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const DATA_DIR = join(ROOT, "data");

const BRANCH_XLSX = join(ROOT, "Branch Location.xlsx");
const POS_XLSX = join(ROOT, "Coop POS locations.xlsx");

const PIN_CLUSTER_RADIUS_DEG = 0.00008;

const ETHIOPIA_BOUNDS = { minLat: 3, maxLat: 15, minLng: 33, maxLng: 48 };

function normalizeBranchName(name) {
  if (!name || typeof name !== "string") return "";
  return name
    .toLowerCase()
    .replace(/\s+branch\s*$/i, "")
    .replace(/\s+/g, " ")
    .trim();
}

function isValidCoord(lat, lng) {
  return (
    typeof lat === "number" &&
    typeof lng === "number" &&
    !Number.isNaN(lat) &&
    !Number.isNaN(lng) &&
    lat >= ETHIOPIA_BOUNDS.minLat &&
    lat <= ETHIOPIA_BOUNDS.maxLat &&
    lng >= ETHIOPIA_BOUNDS.minLng &&
    lng <= ETHIOPIA_BOUNDS.maxLng
  );
}

function parseNumber(val) {
  if (typeof val === "number") return val;
  if (typeof val === "string") {
    const n = parseFloat(val.trim());
    return Number.isNaN(n) ? null : n;
  }
  return null;
}

function readSheet(path) {
  const wb = XLSX.readFile(path);
  const sheet = wb.Sheets[wb.SheetNames[0]];
  return XLSX.utils.sheet_to_json(sheet, { defval: "" });
}

function spreadAtBase(lat, lng, index, total) {
  if (total <= 1) return { lat, lng };
  const angle = (index / total) * 2 * Math.PI;
  return {
    lat: lat + PIN_CLUSTER_RADIUS_DEG * Math.cos(angle),
    lng: lng + PIN_CLUSTER_RADIUS_DEG * Math.sin(angle),
  };
}

function findBranchMatch(posBranchName, branchByNorm, branches) {
  const norm = normalizeBranchName(posBranchName);
  if (!norm) return null;

  if (branchByNorm.has(norm)) return branchByNorm.get(norm);

  // Fuzzy: check if one normalized name contains the other
  for (const b of branches) {
    const bNorm = normalizeBranchName(b.name);
    if (bNorm === norm) return b;
    if (bNorm.includes(norm) || norm.includes(bNorm)) return b;
  }

  // Common alias: "Bole Medanealem" vs "Bole M.Alem"
  const aliases = [
    ["bole medanealem", "bole m.alem"],
    ["bole medhanialem", "bole m.alem"],
    ["finfinne", "finfinne"],
  ];
  for (const [a, b] of aliases) {
    if (norm.includes(a) || norm.includes(b)) {
      for (const br of branches) {
        const bNorm = normalizeBranchName(br.name);
        if (bNorm.includes(a) || bNorm.includes(b)) return br;
      }
    }
  }

  return null;
}

function importBranches(rows) {
  const branches = [];
  for (const row of rows) {
    const type = String(row["Type (Branch/ATM)"] ?? "").trim();
    const status = String(row["Status (Active/Inactive)"] ?? "").trim();
    if (type !== "Branch" || status !== "Active") continue;

    const lat = parseNumber(row["Latitude"]);
    const lng = parseNumber(row["Longitude"]);
    if (!isValidCoord(lat, lng)) continue;

    const branchCode = String(row["Code"] ?? "").trim() || null;
    const name = String(row["Name"] ?? "").trim();
    if (!name) continue;

    branches.push({
      id: branchCode ? `${branchCode}-${name}` : name,
      branchCode,
      name,
      displayName: String(row["Display Name"] ?? "").trim() || name,
      address: String(row["Street Address"] ?? "").trim() || null,
      city: String(row["City"] ?? "").trim() || null,
      region: String(row["Region"] ?? "").trim() || null,
      phone: row["Phone Number"] != null ? String(row["Phone Number"]).trim() : null,
      lat,
      lng,
    });
  }
  return branches;
}

function importPos(rows, branches) {
  const branchByNorm = new Map();
  for (const b of branches) {
    branchByNorm.set(normalizeBranchName(b.name), b);
    if (b.displayName) branchByNorm.set(normalizeBranchName(b.displayName), b);
  }

  const posByBranch = new Map();
  const unmatched = [];

  for (const row of rows) {
    const branchName = String(row["Branch Name"] ?? "").trim();
    const terminalId = String(row["Terminal ID"] ?? "").trim();
    if (!terminalId) continue;

    const branch = findBranchMatch(branchName, branchByNorm, branches);
    if (!branch) {
      unmatched.push({ terminalId, branchName });
      continue;
    }

    const key = branch.id;
    if (!posByBranch.has(key)) posByBranch.set(key, []);
    posByBranch.get(key).push({
      terminalId,
      serialNo: String(row["Serial No"] ?? "").trim() || null,
      merchantId: String(row["Merchant Id"] ?? "").trim() || null,
      merchantName: String(row["Merchant Name"] ?? "").trim() || null,
      site: String(row["Site"] ?? "").trim() || null,
      address: String(row["Address"] ?? "").trim() || null,
      status: String(row["Status"] ?? "").trim() || null,
      district: String(row["District"] ?? "").trim() || null,
      branchName,
      branchCode: branch.branchCode,
      baseLat: branch.lat,
      baseLng: branch.lng,
    });
  }

  const pos = [];
  for (const [, group] of posByBranch) {
    group.forEach((p, i) => {
      const { lat, lng } = spreadAtBase(p.baseLat, p.baseLng, i, group.length);
      pos.push({
        id: p.terminalId,
        terminalId: p.terminalId,
        serialNo: p.serialNo,
        merchantId: p.merchantId,
        merchantName: p.merchantName,
        site: p.site,
        address: p.address,
        status: p.status,
        district: p.district,
        branchName: p.branchName,
        branchCode: p.branchCode,
        lat,
        lng,
      });
    });
  }

  return { pos, unmatched };
}

function main() {
  mkdirSync(DATA_DIR, { recursive: true });

  console.log("Reading", BRANCH_XLSX);
  const branchRows = readSheet(BRANCH_XLSX);
  const branches = importBranches(branchRows);
  console.log(`Branches: ${branches.length} active with valid coordinates`);

  console.log("Reading", POS_XLSX);
  const posRows = readSheet(POS_XLSX);
  const { pos, unmatched } = importPos(posRows, branches);
  console.log(`POS: ${pos.length} matched`);
  if (unmatched.length > 0) {
    console.warn(`POS unmatched: ${unmatched.length}`);
    const sample = unmatched.slice(0, 10);
    for (const u of sample) {
      console.warn(`  - ${u.terminalId}: "${u.branchName}"`);
    }
    if (unmatched.length > 10) console.warn(`  ... and ${unmatched.length - 10} more`);
  }

  writeFileSync(join(DATA_DIR, "branch-locations.json"), JSON.stringify(branches, null, 2));
  writeFileSync(join(DATA_DIR, "pos-locations.json"), JSON.stringify(pos, null, 2));
  console.log("Wrote data/branch-locations.json and data/pos-locations.json");
}

main();
