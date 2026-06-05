"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
} from "@/components/ui/drawer";
import { PortalLoadingInline } from "@/components/ui/portal-loading";
import { X } from "lucide-react";
import type { MapPinScouted } from "@/app/actions/map-pins";
import type { BranchLocationPin, PosLocationPin } from "@/app/actions/infrastructure-pins";
import type { MerchantDetail } from "@/app/actions/merchants";
import { MerchantDetailView } from "@/components/merchant-detail/MerchantDetailView";

export type SelectedMapPin =
  | { type: "scouted"; data: MapPinScouted }
  | { type: "inducted"; id: string }
  | { type: "branch"; data: BranchLocationPin }
  | { type: "pos"; data: PosLocationPin };

function ImageFullscreen({
  src,
  alt,
  caption,
  onClose,
}: {
  src: string;
  alt: string;
  caption?: string;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/95 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={caption ?? "Image fullscreen"}
    >
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-2 top-2 z-10 rounded-full bg-white/10 text-white hover:bg-white/20"
        onClick={onClose}
        aria-label="Close"
      >
        <X className="size-5" />
      </Button>
      <button
        type="button"
        className="flex max-h-full max-w-full flex-col items-center justify-center focus:outline-none"
        onClick={onClose}
      >
        <img
          src={src}
          alt={alt}
          className="max-h-[85vh] max-w-full object-contain"
          onClick={(e) => e.stopPropagation()}
        />
        {caption && (
          <span className="mt-2 text-sm text-white/80">{caption}</span>
        )}
      </button>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null;
  return (
    <div className="flex flex-col gap-0.5 py-2">
      <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-foreground">{value}</span>
    </div>
  );
}

export function MapPinDetailDrawer({
  selectedPin,
  merchantDetail,
  loading,
  onClose,
}: {
  selectedPin: SelectedMapPin;
  merchantDetail: MerchantDetail | null;
  loading: boolean;
  onClose: () => void;
}) {
  const [photoFullscreen, setPhotoFullscreen] = useState(false);

  const title =
    selectedPin.type === "scouted"
      ? "Scouted lead"
      : selectedPin.type === "inducted"
        ? "Inducted merchant"
        : selectedPin.type === "branch"
          ? "Coop branch"
          : "POS terminal";

  return (
    <div className="flex flex-col gap-4 p-4">
      <DrawerHeader className="flex flex-row items-center justify-between gap-4 p-0 text-left">
        <DrawerTitle className="font-mono text-lg font-semibold text-foreground">
          {title}
        </DrawerTitle>
        <DrawerClose asChild>
          <Button variant="ghost" size="icon" aria-label="Close">
            <X className="size-5" />
          </Button>
        </DrawerClose>
      </DrawerHeader>
      {selectedPin.type === "scouted" && (
        <Card className="border-border bg-card">
          <CardContent className="pt-4">
            {selectedPin.data.photoUrl && (
              <div className="mb-4">
                {photoFullscreen && (
                  <ImageFullscreen
                    src={selectedPin.data.photoUrl}
                    alt={selectedPin.data.businessName}
                    caption={selectedPin.data.businessName}
                    onClose={() => setPhotoFullscreen(false)}
                  />
                )}
                <button
                  type="button"
                  onClick={() => setPhotoFullscreen(true)}
                  className="cursor-zoom-in w-full rounded-lg border border-border transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <img
                    src={selectedPin.data.photoUrl}
                    alt={selectedPin.data.businessName}
                    className="h-32 w-full rounded-lg object-cover"
                  />
                </button>
              </div>
            )}
            <div className="space-y-0">
              <DetailRow label="Business" value={selectedPin.data.businessName} />
              <DetailRow label="Category" value={selectedPin.data.category} />
              <DetailRow label="Volume" value={selectedPin.data.estimatedVolume} />
              <DetailRow
                label="Location"
                value={`${selectedPin.data.locationLat.toFixed(5)}, ${selectedPin.data.locationLng.toFixed(5)}`}
              />
              <DetailRow label="Scouted by" value={selectedPin.data.scoutedBy.name} />
              <DetailRow
                label="Date"
                value={new Date(selectedPin.data.createdAt).toLocaleString()}
              />
            </div>
          </CardContent>
        </Card>
      )}
      {selectedPin.type === "inducted" && (
        <>
          {loading ? (
            <div className="min-h-[120px]">
              <PortalLoadingInline className="min-h-[120px]" />
            </div>
          ) : merchantDetail ? (
            <MerchantDetailView detail={merchantDetail} fullDeploymentAssets />
          ) : (
            <p className="font-mono text-sm text-muted-foreground">Merchant not found.</p>
          )}
        </>
      )}
      {selectedPin.type === "branch" && (
        <Card className="border-border bg-card">
          <CardContent className="pt-4">
            <div className="space-y-0">
              <DetailRow label="Name" value={selectedPin.data.name} />
              <DetailRow label="Display name" value={selectedPin.data.displayName} />
              <DetailRow label="Branch code" value={selectedPin.data.branchCode ?? undefined} />
              <DetailRow label="Address" value={selectedPin.data.address ?? undefined} />
              <DetailRow label="City" value={selectedPin.data.city ?? undefined} />
              <DetailRow label="Region" value={selectedPin.data.region ?? undefined} />
              <DetailRow label="Phone" value={selectedPin.data.phone ?? undefined} />
              <DetailRow
                label="Coordinates"
                value={`${selectedPin.data.lat.toFixed(5)}, ${selectedPin.data.lng.toFixed(5)}`}
              />
            </div>
          </CardContent>
        </Card>
      )}
      {selectedPin.type === "pos" && (
        <Card className="border-border bg-card">
          <CardContent className="pt-4">
            <div className="space-y-0">
              <DetailRow label="Terminal ID" value={selectedPin.data.terminalId} />
              <DetailRow label="Merchant" value={selectedPin.data.merchantName ?? undefined} />
              <DetailRow label="Site" value={selectedPin.data.site ?? undefined} />
              <DetailRow label="Address" value={selectedPin.data.address ?? undefined} />
              <DetailRow label="Branch" value={selectedPin.data.branchName} />
              <DetailRow label="District" value={selectedPin.data.district ?? undefined} />
              <DetailRow label="Status" value={selectedPin.data.status ?? undefined} />
              <DetailRow
                label="Coordinates"
                value={`${selectedPin.data.lat.toFixed(5)}, ${selectedPin.data.lng.toFixed(5)}`}
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
