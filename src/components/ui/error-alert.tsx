import { AlertCircle } from "lucide-react";

export function ErrorAlert({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div
      className="flex items-center gap-2.5 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
      role="alert"
    >
      <AlertCircle className="size-4 shrink-0" aria-hidden />
      <span>{message}</span>
    </div>
  );
}
