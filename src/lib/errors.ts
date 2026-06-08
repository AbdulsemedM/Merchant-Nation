function messageFromUnknown(error: unknown): string | null {
  if (error == null) return null;
  if (typeof error === "string") return error.trim() || null;
  if (error instanceof Error) return error.message.trim() || null;
  if (typeof error === "object" && "message" in error) {
    const msg = String((error as { message?: unknown }).message ?? "").trim();
    return msg || null;
  }
  return null;
}

function prismaCode(error: unknown): string | null {
  if (error && typeof error === "object" && "code" in error) {
    const code = (error as { code?: unknown }).code;
    return typeof code === "string" ? code : null;
  }
  return null;
}

function isNextRedirect(error: unknown): boolean {
  if (error && typeof error === "object" && "digest" in error) {
    const digest = String((error as { digest?: unknown }).digest ?? "");
    return digest.startsWith("NEXT_REDIRECT");
  }
  return false;
}

function isOpaqueServerError(message: string): boolean {
  return (
    message.includes("An error occurred in the Server Components render") ||
    message.includes("Server Components render") ||
    /^digest:/i.test(message) ||
    message.includes("Invariant:")
  );
}

/** Map thrown errors and action failures to plain-language UI copy. */
export function getUserFacingErrorMessage(error: unknown, fallback: string): string {
  if (isNextRedirect(error)) {
    return fallback;
  }

  if (error && typeof error === "object") {
    if ("error" in error && typeof (error as { error?: unknown }).error === "string") {
      const nested = (error as { error: string }).error.trim();
      if (nested) return nested;
    }
    if ("ok" in error && (error as { ok?: boolean }).ok === false && "error" in error) {
      const nested = String((error as { error?: unknown }).error ?? "").trim();
      if (nested) return nested;
    }
  }

  if (error instanceof Error && error.name === "UnauthorizedError") {
    const msg = error.message.trim();
    if (msg && msg !== "Unauthorized") return msg;
    return "You are not signed in or you do not have permission to do that.";
  }

  const code = prismaCode(error);
  if (code === "P2002") {
    return "That value is already in use. Please try a different one.";
  }
  if (code === "P1001" || code === "P1000") {
    return "Cannot reach the database right now. Please try again shortly.";
  }

  const message = messageFromUnknown(error);
  if (!message) return fallback;

  if (
    message.includes("P1001") ||
    message.includes("P1000") ||
    message.includes("Can't reach database") ||
    message.toLowerCase().includes("prismaclientinitialization")
  ) {
    return "Cannot reach the database right now. Please try again shortly.";
  }

  if (message.includes("P2002") || message.includes("Unique constraint")) {
    return "That value is already in use. Please try a different one.";
  }

  if (message.includes("JWT_SECRET") || message.includes("NEXTAUTH_SECRET")) {
    return "This deployment is missing an auth secret. Contact your administrator.";
  }

  if (isOpaqueServerError(message)) {
    return fallback;
  }

  return message;
}

/** True when a server action threw `redirect()` (not a real failure). */
export function isRedirectError(error: unknown): boolean {
  return isNextRedirect(error);
}
