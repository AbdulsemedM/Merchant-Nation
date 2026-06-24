export const nationalIdDuplicateMessage =
  "A merchant with this National ID is already registered.";

export const nationalIdRequiredMessage = "National ID is required.";

/** Trim and collapse internal whitespace for consistent uniqueness checks. */
export function normalizeNationalId(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

export function validateNationalId(
  value: string
): { ok: true; value: string } | { ok: false; error: string } {
  const normalized = normalizeNationalId(value);
  if (!normalized) {
    return { ok: false, error: nationalIdRequiredMessage };
  }
  return { ok: true, value: normalized };
}

export function isNationalIdDuplicateError(error: unknown): boolean {
  if (error && typeof error === "object" && "code" in error) {
    if ((error as { code?: string }).code === "P2002") return true;
  }
  const message =
    error instanceof Error
      ? error.message
      : typeof error === "object" && error && "message" in error
        ? String((error as { message?: unknown }).message ?? "")
        : "";
  return message.includes("P2002") || message.includes("Unique constraint");
}
