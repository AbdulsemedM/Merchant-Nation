import { getServerAuthSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ChangePasswordForm } from "./ChangePasswordForm";
import { homePathForRole } from "@/lib/home-path";

export const dynamic = "force-dynamic";

export default async function ChangePasswordPage() {
  const session = await getServerAuthSession();
  if (!session) redirect("/login");
  if (!session.mustChangePassword) redirect(homePathForRole());
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-background px-4 py-8">
      <div className="w-full max-w-md flex flex-col gap-6">
        <header className="text-center">
          <h1 className="font-mono text-xl font-semibold text-foreground">
            Change your password
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            You must set a new password before continuing. Enter the temporary password you were given in the current password field.
          </p>
        </header>
        <ChangePasswordForm />
      </div>
    </div>
  );
}
