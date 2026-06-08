"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { changePassword } from "@/app/actions/auth";
import { ErrorAlert } from "@/components/ui/error-alert";
import { getUserFacingErrorMessage, isRedirectError } from "@/lib/errors";

export function ChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (newPassword !== confirmPassword) {
      setError("New password and confirmation do not match.");
      return;
    }
    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await changePassword(currentPassword, newPassword, { redirect: true });
      if (!res.ok) {
        setError(res.error ?? "Failed to change password.");
      }
    } catch (e) {
      if (isRedirectError(e)) return;
      setError(getUserFacingErrorMessage(e, "Failed to change password. Please try again."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-xl border border-border bg-card p-6">
      <ErrorAlert message={error} />
      <div className="grid gap-2">
        <Label htmlFor="current">Current password</Label>
        <Input
          id="current"
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          placeholder="Temporary or current password"
          required
          className="font-mono"
          autoComplete="current-password"
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="new">New password</Label>
        <Input
          id="new"
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="At least 6 characters"
          required
          minLength={6}
          className="font-mono"
          autoComplete="new-password"
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="confirm">Confirm new password</Label>
        <Input
          id="confirm"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Confirm new password"
          required
          minLength={6}
          className="font-mono"
          autoComplete="new-password"
        />
      </div>
      <Button type="submit" disabled={submitting} className="font-mono">
        {submitting ? "Updating…" : "Change password"}
      </Button>
    </form>
  );
}
