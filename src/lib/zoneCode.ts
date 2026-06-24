/** Branch-scoped Zone.code value (Zone.code is globally unique; territory cells repeat per branch). */
export function zoneStorageCode(
  branchId: string | null | undefined,
  displayCode: string
): string {
  if (!branchId) return displayCode;
  return `${branchId}::${displayCode}`;
}

/** Resolve a map territory cell code to a Zone id from branch-scoped zone rows. */
export function resolveZoneIdForCell(
  zones: { id: string; code: string }[],
  branchId: string | null | undefined,
  cellCode: string
): string | null {
  if (zones.length === 0) return null;
  const storageCode = zoneStorageCode(branchId, cellCode);
  const match = zones.find(
    (z) => z.code === storageCode || z.code === cellCode
  );
  return match?.id ?? null;
}
