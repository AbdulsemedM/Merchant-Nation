import { redirect } from "next/navigation";
import { getServerAuthSession } from "@/lib/auth";
import { canAccessAdminPath } from "@/lib/admin-page-access";

/** Redirect to home if the user cannot access an admin route. */
export async function requireAdminPageAccess(pathname: string): Promise<NonNullable<Awaited<ReturnType<typeof getServerAuthSession>>>> {
  const session = await getServerAuthSession();
  if (!session) redirect("/login");
  const allowed = await canAccessAdminPath(session, pathname);
  if (!allowed) redirect("/");
  return session;
}
