"use server";

import { authorize } from "@/lib/auth";
import branchLocationsData from "../../../data/branch-locations.json";

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

const branchLocations = branchLocationsData as BranchLocationPin[];

/** Coop branch and POS machine locations for the dashboard map. Visible to all authorized map roles nationwide. */
export async function getInfrastructurePins(): Promise<InfrastructurePinsResult> {
  await authorize(["ADMIN", "BRANCH_MANAGER", "PLAYER"], "getInfrastructurePins");
  return {
    branches: branchLocations,
    // POS machines hidden for now — re-enable when needed
    pos: [] as PosLocationPin[],
  };
}
