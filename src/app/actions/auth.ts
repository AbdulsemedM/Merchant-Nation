"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import {
  AUTH_COOKIE_NAME,
  IDLE_TIMEOUT_SECONDS,
  isAuthSecretConfigured,
  type AuthSession,
} from "@/lib/auth";
import { changePassword as changePasswordService, loginWithPassword } from "@/backend/services/auth-service";
import { getUserFacingErrorMessage, isRedirectError } from "@/lib/errors";
import { homePathForRole } from "@/lib/home-path";

export async function login(email: string, password: string) {
  if (!isAuthSecretConfigured()) {
    return {
      error:
        "Server misconfiguration: add JWT_SECRET or NEXTAUTH_SECRET in Vercel → Environment Variables, then redeploy.",
    };
  }
  try {
    const result = await loginWithPassword(email, password);
    if ("error" in result) return { error: result.error };

    const cookieStore = await cookies();
    const secureCookie =
      process.env.NODE_ENV === "production" || process.env.VERCEL === "1";
    cookieStore.set(AUTH_COOKIE_NAME, result.token, {
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      secure: secureCookie,
      maxAge: IDLE_TIMEOUT_SECONDS,
    });
    const redirectTo = result.mustChangePassword ? "/change-password" : homePathForRole();
    return { ok: true as const, redirectTo };
  } catch (e) {
    console.error("[login] server action error:", e);
    return { error: getUserFacingErrorMessage(e, "Sign in failed. Please try again.") };
  }
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.set(AUTH_COOKIE_NAME, "", { path: "/", maxAge: 0 });
  redirect("/login");
}

/** Change password for the current user. Verifies current password, sets new one, clears mustChangePassword, and refreshes session cookie. */
export async function changePassword(
  currentPassword: string,
  newPassword: string,
  options?: { redirect?: boolean; redirectTo?: string }
): Promise<{ ok: boolean; error?: string; redirectTo?: string }> {
  try {
    const { getServerAuthSession } = await import("@/lib/auth");
    const session = await getServerAuthSession();
    if (!session) return { ok: false, error: "Not authenticated" };

    const result = await changePasswordService(session as AuthSession, {
      currentPassword,
      newPassword,
    });
    if (!result.ok) return { ok: false, error: result.error };

    const cookieStore = await cookies();
    const secureCookie =
      process.env.NODE_ENV === "production" || process.env.VERCEL === "1";
    cookieStore.set(AUTH_COOKIE_NAME, result.token, {
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      secure: secureCookie,
      maxAge: IDLE_TIMEOUT_SECONDS,
    });

    const redirectTo = options?.redirectTo ?? homePathForRole();
    if (options?.redirect || options?.redirectTo) {
      return { ok: true, redirectTo };
    }

    return { ok: true };
  } catch (e) {
    if (isRedirectError(e)) throw e;
    console.error("[changePassword] server action error:", e);
    return { ok: false, error: getUserFacingErrorMessage(e, "Failed to change password. Please try again.") };
  }
}
