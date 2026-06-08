"use client";

import { useState } from "react";
import { MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ErrorAlert } from "@/components/ui/error-alert";
import {
  requestUserLocation,
  setLocationPromptChoice,
  setStoredUserLocation,
} from "@/lib/user-location";

export function LocationPromptDialog({
  open,
  onComplete,
}: {
  open: boolean;
  onComplete: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAllow = async () => {
    setError(null);
    setLoading(true);
    try {
      const location = await requestUserLocation();
      if (location) {
        setStoredUserLocation(location);
        setLocationPromptChoice("granted");
        onComplete();
      } else {
        setError(
          "Could not get your location. Check browser permissions or try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    setLocationPromptChoice("skipped");
    onComplete();
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-md"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-mono">
            <MapPin className="size-5 text-primary" aria-hidden />
            Share your location
          </DialogTitle>
          <DialogDescription>
            Allow location access so the map can center on your position when you
            open the territory view. You can change this later in your browser
            settings.
          </DialogDescription>
        </DialogHeader>
        <ErrorAlert message={error} />
        <DialogFooter className="flex-col gap-2 sm:flex-col">
          <Button
            type="button"
            className="w-full font-mono"
            disabled={loading}
            onClick={handleAllow}
          >
            {loading ? "Getting location…" : "Allow location"}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="w-full font-mono"
            disabled={loading}
            onClick={handleSkip}
          >
            Continue without location
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
