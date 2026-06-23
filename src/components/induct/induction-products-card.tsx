"use client";

import { useState } from "react";
import { ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { INDUCTION_PRODUCTS, type InductionProductKey } from "@/lib/induction-products";
import {
  updateLeadFutureProductInterests,
  updateLeadRegisteredProductInterests,
} from "@/app/actions/leads";

function filterProductKeys(values: string[]): InductionProductKey[] {
  return values.filter((k): k is InductionProductKey =>
    INDUCTION_PRODUCTS.some((p) => p.key === k)
  );
}

function ProductCheckbox({
  id,
  label,
  checked,
  disabled,
  onChange,
}: {
  id: string;
  label: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label
      htmlFor={id}
      className="flex min-h-[36px] cursor-pointer items-center gap-2 text-xs sm:text-sm"
    >
      <input
        id={id}
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 shrink-0 rounded border-border"
      />
      <span className="text-muted-foreground">{label}</span>
    </label>
  );
}

export interface InductionProductsCardProps {
  leadId: string;
  initialInterests: string[];
  initialRegistered: string[];
}

export function InductionProductsCard({
  leadId,
  initialInterests,
  initialRegistered,
}: InductionProductsCardProps) {
  const [interests, setInterests] = useState<InductionProductKey[]>(() =>
    filterProductKeys(initialInterests)
  );
  const [registered, setRegistered] = useState<InductionProductKey[]>(() =>
    filterProductKeys(initialRegistered)
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

  const toggleRegistered = async (key: InductionProductKey, checked: boolean) => {
    const previous = registered;
    const next = checked ? [...registered, key] : registered.filter((k) => k !== key);
    setRegistered(next);
    setError(null);
    setSaving(true);
    const result = await updateLeadRegisteredProductInterests(leadId, next);
    setSaving(false);
    if (!result.ok) {
      setError(result.error ?? "Failed to save");
      setRegistered(previous);
    }
  };

  return (
    <Card className="mb-6 border-primary/30 bg-primary/5">
      <CardContent className="p-4">
        <p className="mb-1 font-mono text-sm font-medium text-foreground">
          Open an account — Cooperative Bank of Oromia
        </p>
        <p className="mb-4 text-xs text-muted-foreground">
          Mark what the merchant already has or may want later. Registration links open in a new tab.
        </p>

        {/* Wide layout: compact table uses horizontal space */}
        <div className="hidden lg:block overflow-x-auto rounded-md border border-border bg-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
                <th className="px-4 py-3 font-medium">Product</th>
                <th className="px-4 py-3 font-medium">Already registered</th>
                <th className="px-4 py-3 font-medium">Interested for future</th>
                <th className="px-4 py-3 font-medium">Register</th>
              </tr>
            </thead>
            <tbody>
              {INDUCTION_PRODUCTS.map((product) => {
                const Icon = product.icon;
                const isRegistered = registered.includes(product.key);
                const isInterested = interests.includes(product.key);
                return (
                  <tr
                    key={product.key}
                    className={cn(
                      "border-b border-border last:border-0",
                      (isRegistered || isInterested) && "bg-primary/5"
                    )}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 font-mono font-medium text-foreground">
                        <Icon className="size-4 shrink-0" aria-hidden />
                        {product.label}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <ProductCheckbox
                        id={`${product.key}-registered-lg`}
                        label="Yes"
                        checked={isRegistered}
                        disabled={saving}
                        onChange={(checked) => toggleRegistered(product.key, checked)}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <ProductCheckbox
                        id={`${product.key}-future-lg`}
                        label="Yes"
                        checked={isInterested}
                        disabled={saving}
                        onChange={(checked) => toggleInterest(product.key, checked)}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <a
                        href={product.registrationUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 font-mono text-sm text-foreground underline-offset-4 hover:underline"
                      >
                        Open
                        <ExternalLink className="size-3.5 shrink-0" aria-hidden />
                      </a>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Narrow layout: stacked cards */}
        <div className="grid gap-3 sm:grid-cols-2 lg:hidden">
          {INDUCTION_PRODUCTS.map((product) => {
            const Icon = product.icon;
            const isRegistered = registered.includes(product.key);
            const isInterested = interests.includes(product.key);
            return (
              <div
                key={product.key}
                className={cn(
                  "flex flex-col gap-3 rounded-md border border-border bg-card p-4",
                  (isRegistered || isInterested) && "border-primary/50 ring-1 ring-primary/30"
                )}
              >
                <div className="flex items-center gap-2 font-mono text-sm font-medium text-foreground">
                  <Icon className="size-4 shrink-0" aria-hidden />
                  {product.label}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <ProductCheckbox
                    id={`${product.key}-registered-sm`}
                    label="Already registered"
                    checked={isRegistered}
                    disabled={saving}
                    onChange={(checked) => toggleRegistered(product.key, checked)}
                  />
                  <ProductCheckbox
                    id={`${product.key}-future-sm`}
                    label="Interested for future"
                    checked={isInterested}
                    disabled={saving}
                    onChange={(checked) => toggleInterest(product.key, checked)}
                  />
                </div>
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
          <p className="mt-3 text-xs text-muted-foreground">Saving…</p>
        )}
        {error && (
          <p className="mt-3 text-xs text-destructive">{error}</p>
        )}
      </CardContent>
    </Card>
  );
}
