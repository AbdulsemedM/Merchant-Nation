"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { MapPin, Smartphone, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { updateLeadLocation, updateLeadInductionNote } from "@/app/actions/leads";

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
  if (value == null || value === "") return null;
  return (
    <div className="flex flex-col gap-0.5 py-2">
      <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-foreground">{value}</span>
    </div>
  );
}

function formatVolume(volume: string): string {
  const labels: Record<string, string> = {
    LOW: "Low",
    MEDIUM: "Medium",
    HIGH: "High",
  };
  return labels[volume] ?? volume;
}

export interface VerifyStepProps {
  leadId: string;
  lead: {
    businessName: string;
    category: string;
    locationLat: number;
    locationLng: number;
    zone?: { code: string } | null;
    estimatedVolume: string;
    photoUrl?: string | null;
    externalBankNames: string[];
    scoutedByName: string;
    scoutedAt: string;
    taskReportType?: string | null;
    inductionNote?: string | null;
  };
  onContinue: () => void;
  /** When provided, show "Save and continue later" (saves progress and leaves). */
  onSaveProgress?: () => void | Promise<void>;
  /** When true, disable Save and continue later (e.g. while saving). */
  saving?: boolean;
}

type LocationChoice = "map" | "device" | null;

export function VerifyStep({ leadId, lead, onContinue, onSaveProgress, saving }: VerifyStepProps) {
  const [locationChoice, setLocationChoice] = useState<LocationChoice>(null);
  const [deviceLocation, setDeviceLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [loadingGeo, setLoadingGeo] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [note, setNote] = useState(lead.inductionNote ?? "");
  const [noteSaving, setNoteSaving] = useState(false);
  const [noteSaved, setNoteSaved] = useState(false);
  const [noteError, setNoteError] = useState<string | null>(null);
  const [photoFullscreen, setPhotoFullscreen] = useState(false);

  useEffect(() => {
    if (locationChoice !== "device") return;
    setLoadingGeo(true);
    setGeoError(null);
    if (!navigator?.geolocation) {
      setGeoError("Geolocation not supported");
      setLoadingGeo(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setDeviceLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLoadingGeo(false);
      },
      () => {
        setGeoError("Location blocked or unavailable");
        setLoadingGeo(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, [locationChoice]);

  const persistNote = async (): Promise<boolean> => {
    setNoteSaving(true);
    setNoteError(null);
    setNoteSaved(false);
    try {
      const result = await updateLeadInductionNote(leadId, note);
      if (!result.ok) {
        setNoteError(result.error ?? "Failed to save note");
        return false;
      }
      setNoteSaved(true);
      return true;
    } catch {
      setNoteError("Failed to save note");
      return false;
    } finally {
      setNoteSaving(false);
    }
  };

  const handleSaveNote = async () => {
    await persistNote();
  };

  const handleContinue = async () => {
    await persistNote();

    if (locationChoice === "device" && deviceLocation) {
      setSubmitting(true);
      try {
        const result = await updateLeadLocation(leadId, deviceLocation.lat, deviceLocation.lng);
        if (!result.ok) {
          setGeoError(result.error ?? "Failed to update location");
          setSubmitting(false);
          return;
        }
      } catch {
        setGeoError("Failed to update location");
        setSubmitting(false);
        return;
      }
      setSubmitting(false);
    }
    onContinue();
  };

  const handleSaveProgress = async () => {
    await persistNote();
    await onSaveProgress?.();
  };

  const canContinue =
    locationChoice === "map" || (locationChoice === "device" && deviceLocation != null && !loadingGeo);

  const otherServices =
    lead.externalBankNames.length > 0 ? lead.externalBankNames.join(", ") : "None";

  return (
    <Card>
      <CardHeader>
        <CardTitle>Verify business details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        {lead.photoUrl && (
          <div>
            {photoFullscreen && (
              <ImageFullscreen
                src={lead.photoUrl}
                alt={lead.businessName}
                caption={lead.businessName}
                onClose={() => setPhotoFullscreen(false)}
              />
            )}
            <button
              type="button"
              onClick={() => setPhotoFullscreen(true)}
              className="cursor-zoom-in w-full rounded-lg border border-border transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <img
                src={lead.photoUrl}
                alt={lead.businessName}
                className="h-32 w-full rounded-lg object-cover"
              />
            </button>
          </div>
        )}

        <div className="rounded-md border border-border bg-muted/30 p-3">
          <DetailRow label="Business name" value={lead.businessName} />
          <DetailRow label="Category" value={lead.category} />
          <DetailRow label="Zone" value={lead.zone?.code ?? "—"} />
          <DetailRow label="Estimated volume" value={formatVolume(lead.estimatedVolume)} />
          <DetailRow
            label="Coordinates"
            value={`${lead.locationLat.toFixed(5)}, ${lead.locationLng.toFixed(5)}`}
          />
          <DetailRow label="Other services used" value={otherServices} />
          <DetailRow label="Scouted by" value={lead.scoutedByName} />
          <DetailRow label="Scout date" value={lead.scoutedAt} />
          {lead.taskReportType && (
            <DetailRow label="Mission report type" value={lead.taskReportType} />
          )}
        </div>

        <div className="space-y-2">
          <p className="font-medium text-foreground">Lead note</p>
          <p className="text-muted-foreground text-xs">
            Save context about this merchant for later.
          </p>
          <Textarea
            value={note}
            onChange={(e) => {
              setNote(e.target.value);
              setNoteSaved(false);
            }}
            placeholder="Add a lead or note about this merchant…"
            className="min-h-24"
          />
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleSaveNote}
              disabled={noteSaving || submitting || saving}
            >
              {noteSaving ? "Saving…" : "Save note"}
            </Button>
            {noteSaved && (
              <span className="text-xs text-muted-foreground">Note saved</span>
            )}
          </div>
          {noteError && (
            <p className="text-destructive text-xs">{noteError}</p>
          )}
        </div>

        <div className="space-y-3">
          <p className="font-medium text-foreground">Where should we record this merchant&apos;s location?</p>
          <p className="text-muted-foreground text-xs">
            Choose the location that will be shown on the map for this merchant.
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            <Button
              type="button"
              variant="outline"
              className={cn(
                "h-auto flex-col items-start gap-1 p-4 text-left",
                locationChoice === "map" && "border-primary ring-2 ring-primary"
              )}
              onClick={() => setLocationChoice("map")}
            >
              <span className="flex items-center gap-2 font-medium">
                <MapPin className="size-4 shrink-0" />
                Use location from the map
              </span>
              <span className="text-muted-foreground text-xs font-normal">
                The place I pressed when I scouted (or the scout location)
              </span>
              {locationChoice === "map" && (
                <span className="mt-1 font-mono text-xs">
                  {lead.locationLat.toFixed(5)}, {lead.locationLng.toFixed(5)}
                </span>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              className={cn(
                "h-auto flex-col items-start gap-1 p-4 text-left",
                locationChoice === "device" && "border-primary ring-2 ring-primary"
              )}
              onClick={() => setLocationChoice("device")}
              disabled={loadingGeo}
            >
              <span className="flex items-center gap-2 font-medium">
                <Smartphone className="size-4 shrink-0" />
                Use my current location
              </span>
              <span className="text-muted-foreground text-xs font-normal">
                GPS from this device right now
              </span>
              {loadingGeo && (
                <span className="mt-1 text-muted-foreground text-xs">Getting location…</span>
              )}
              {locationChoice === "device" && deviceLocation && !loadingGeo && (
                <span className="mt-1 font-mono text-xs">
                  {deviceLocation.lat.toFixed(5)}, {deviceLocation.lng.toFixed(5)}
                </span>
              )}
            </Button>
          </div>
          {locationChoice === "map" && (
            <p className="text-muted-foreground text-xs">
              Current scout/map location: {lead.locationLat.toFixed(5)}, {lead.locationLng.toFixed(5)}
            </p>
          )}
          {geoError && (
            <p className="text-destructive text-xs">{geoError}</p>
          )}
        </div>

        <Button
          type="button"
          onClick={handleContinue}
          className="min-h-[44px] w-full"
          disabled={!canContinue || submitting || noteSaving}
        >
          {submitting ? "Saving…" : "Looks good, continue"}
        </Button>
        {onSaveProgress && (
          <Button
            type="button"
            variant="outline"
            className="min-h-[44px] w-full"
            onClick={handleSaveProgress}
            disabled={saving || submitting || noteSaving}
          >
            {saving ? "Saving…" : "Save and continue later"}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
