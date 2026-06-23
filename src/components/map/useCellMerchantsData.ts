"use client";

import { useState, useEffect } from "react";
import {
  getLeadsAndMerchantsByZoneCode,
  getLeadsAndMerchantsByCell,
} from "@/app/actions/leads-list";

export type CellLeadRow = {
  id: string;
  businessName: string;
  category: string;
  estimatedVolume: string;
  scoutedBy: { id: string; name: string };
  createdAt: Date;
};

export type CellMerchantRow = {
  id: string;
  ownerName: string;
  phoneNumber: string;
  lead: { businessName: string; category: string } | null;
  inductedBy: { id: string; name: string };
  onboardingDate: Date;
};

export type CellMerchantsData = {
  leads: CellLeadRow[];
  merchants: CellMerchantRow[];
};

export function useCellMerchantsData({
  zoneCode,
  branchId,
  cellCoordinates,
}: {
  zoneCode: string;
  branchId?: string | null;
  cellCoordinates?: { lat: number; lng: number }[] | null;
}) {
  const [data, setData] = useState<CellMerchantsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const coords = cellCoordinates && cellCoordinates.length >= 3 ? cellCoordinates : null;
    if (branchId && coords) {
      getLeadsAndMerchantsByCell(branchId, coords)
        .then(setData)
        .catch(() => setData({ leads: [], merchants: [] }))
        .finally(() => setLoading(false));
    } else {
      getLeadsAndMerchantsByZoneCode(zoneCode)
        .then(setData)
        .catch(() => setData({ leads: [], merchants: [] }))
        .finally(() => setLoading(false));
    }
  }, [zoneCode, branchId, cellCoordinates]);

  return {
    leads: data?.leads ?? [],
    merchants: data?.merchants ?? [],
    loading,
  };
}
