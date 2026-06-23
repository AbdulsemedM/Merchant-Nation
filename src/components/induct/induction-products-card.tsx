"use client";

import { useState } from "react";
import { ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { INDUCTION_PRODUCTS, type InductionProductKey } from "@/lib/induction-products";
import { updateLeadFutureProductInterests } from "@/app/actions/leads";

export interface InductionProductsCardProps {
  leadId: string;
  initialInterests: string[];
}

export function InductionProductsCard({ leadId, initialInterests }: InductionProductsCardProps) {
  const [interests, setInterests] = useState<InductionProductKey[]>(() =>
    initialInterests.filter((k): k is InductionProductKey =>
      INDUCTION_PRODUCTS.some((p) => p.key === k)
    )
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleInterest = async (key: InductionProductKey, checked: boolean) => {
    const previous = interests;
    const next = checked ? [...interests, key] : interests.filter((k) => k !== key);
    setInterests(next);
    setError(null);
    setSaving(true);
    const result = await updateLeadFutureProductInterests(leadId, next);
    setSaving(false);
    if (!result.ok) {
      setError(result.error ?? "Failed to save");
      setInterests(previous);
    }
  };

  return (
    <Card className="mb-6 border-primary/30 bg-primary/5">
      <CardContent className="p-4">
        <p className="mb-3 font-mono text-sm font-medium text-foreground">
          Open an account — Cooperative Bank of Oromia
        </p>
        <p className="mb-4 text-xs text-muted-foreground">
          Tick products the merchant may want in the future. Registration links open in a new tab.
        </p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {INDUCTION_PRODUCTS.map((product) => {
            const Icon = product.icon;
            const checked = interests.includes(product.key);
            return (
              <div
                key={product.key}
                className={cn(
                  "flex flex-col gap-3 rounded-md border border-border bg-card p-4",
                  checked && "border-primary/50 ring-1 ring-primary/30"
                )}
              >
                <div className="flex items-center gap-2 font-mono text-sm font-medium text-foreground">
                  <Icon className="size-4 shrink-0" aria-hidden />
                  {product.label}
                </div>
                <label className="flex min-h-[44px] cursor-pointer items-center gap-3 text-sm">
                  <input
                    type="checkbox"
                    checked={checked}
                    disabled={saving}
                    onChange={(e) => toggleInterest(product.key, e.target.checked)}
                    className="h-4 w-4 shrink-0 rounded border-border"
                  />
                  <span className="text-muted-foreground">Interested for future</span>
                </label>
                <a
                  href={product.registrationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-md border border-border bg-muted/50 px-3 py-2 font-mono text-sm text-foreground transition-colors hover:bg-muted"
                >
                  Register
                  <ExternalLink className="size-3.5 shrink-0" aria-hidden />
                </a>
              </div>
            );
          })}
        </div>
        {saving && (
          <p className="mt-3 text-xs text-muted-foreground">Saving interests…</p>
        )}
        {error && (
          <p className="mt-3 text-xs text-destructive">{error}</p>
        )}
      </CardContent>
    </Card>
  );
}
