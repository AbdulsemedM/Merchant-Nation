"use client";

import { useEffect, useState } from "react";
import {
  getStoredUserLocation,
  USER_LOCATION_UPDATED_EVENT,
  type UserLocation,
} from "@/lib/user-location";

export function useStoredUserLocation(): UserLocation | null {
  const [location, setLocation] = useState<UserLocation | null>(null);

  useEffect(() => {
    setLocation(getStoredUserLocation());

    const sync = (event?: Event) => {
      if (event instanceof CustomEvent && event.detail) {
        const detail = event.detail as UserLocation;
        if (typeof detail.lat === "number" && typeof detail.lng === "number") {
          setLocation(detail);
          return;
        }
      }
      setLocation(getStoredUserLocation());
    };

    window.addEventListener(USER_LOCATION_UPDATED_EVENT, sync);
    window.addEventListener("map-center-on", sync);
    return () => {
      window.removeEventListener(USER_LOCATION_UPDATED_EVENT, sync);
      window.removeEventListener("map-center-on", sync);
    };
  }, []);

  return location;
}
