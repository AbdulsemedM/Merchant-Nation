"use server";

import { readFileSync } from "fs";
import { join } from "path";
import { authorize } from "@/lib/auth";

export type BranchLocationPin = {
  id: string;
  branchCode: string | null;
  name: string;
  displayName: string;
  address: string | null;
  city: string | null;
  region: string | null;
  phone: string | null;
  lat: number;
  lng: number;
};

export type PosLocationPin = {
  id: string;
  terminalId: string;
  serialNo: string | null;
  merchantId: string | null;
  merchantName: string | null;
  site: string | null;
  address: string | null;
  status: string | null;
  district: string | null;
  branchName: string;
  branchCode: string | null;
  lat: number;
  lng: number;
};

export type InfrastructurePinsResult = {
  branches: BranchLocationPin[];
  pos: PosLocationPin[];
};

let cachedBranches: BranchLocationPin[] | null = null;
let cachedPos: PosLocationPin[] | null = null;

function loadJson<T>(filename: string): T[] {
  try {
    const path = join(process.cwd(), "data", filename);
    const raw = readFileSync(path, "utf-8");
    const data = JSON.parse(raw) as T[];
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function getBranchLocations(): BranchLocationPin[] {
  if (cachedBranches) return cachedBranches;
  cachedBranches = loadJson<BranchLocationPin>("branch-locations.json");
  return cachedBranches;
}

function getPosLocations(): PosLocationPin[] {
  if (cachedPos) return cachedPos;
  cachedPos = loadJson<PosLocationPin>("pos-locations.json");
  return cachedPos;
}

/** Coop branch and POS machine locations for the dashboard map. Visible to all authorized map roles nationwide. */
export async function getInfrastructurePins(): Promise<InfrastructurePinsResult> {
  await authorize(["ADMIN", "BRANCH_MANAGER", "PLAYER"], "getInfrastructurePins");
  return {
    branches: getBranchLocations(),
    // POS machines hidden for now — re-enable with getPosLocations()
    pos: [] as PosLocationPin[], // getPosLocations(),
  };
}
