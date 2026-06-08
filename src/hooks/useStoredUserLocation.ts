"use client";

import { useEffect, useState } from "react";
import { getStoredUserLocation, type UserLocation } from "@/lib/user-location";

export function useStoredUserLocation(): UserLocation | null {
  const [location, setLocation] = useState<UserLocation | null>(null);

  useEffect(() => {
    setLocation(getStoredUserLocation());
  }, []);

  return location;
}
