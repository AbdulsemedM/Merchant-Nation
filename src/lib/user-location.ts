export type UserLocation = { lat: number; lng: number };

export type LocationPromptChoice = "granted" | "skipped";

const LOCATION_KEY = "mn_user_location";
const CHOICE_KEY = "mn_location_prompt_choice";

function canUseSessionStorage(): boolean {
  return typeof window !== "undefined" && typeof window.sessionStorage !== "undefined";
}

export function getStoredUserLocation(): UserLocation | null {
  if (!canUseSessionStorage()) return null;
  try {
    const raw = sessionStorage.getItem(LOCATION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as UserLocation;
    if (typeof parsed.lat === "number" && typeof parsed.lng === "number") {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

export function setStoredUserLocation(location: UserLocation): void {
  if (!canUseSessionStorage()) return;
  sessionStorage.setItem(LOCATION_KEY, JSON.stringify(location));
}

export function clearStoredUserLocation(): void {
  if (!canUseSessionStorage()) return;
  sessionStorage.removeItem(LOCATION_KEY);
}

export function getLocationPromptChoice(): LocationPromptChoice | null {
  if (!canUseSessionStorage()) return null;
  const value = sessionStorage.getItem(CHOICE_KEY);
  if (value === "granted" || value === "skipped") return value;
  return null;
}

export function setLocationPromptChoice(choice: LocationPromptChoice): void {
  if (!canUseSessionStorage()) return;
  sessionStorage.setItem(CHOICE_KEY, choice);
}

export function requestUserLocation(): Promise<UserLocation | null> {
  return new Promise((resolve) => {
    if (!navigator?.geolocation) {
      resolve(null);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      () => resolve(null),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  });
}

/** Pan/zoom map implementations that listen for this event. */
export function dispatchMapCenterOn(location: UserLocation): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("map-center-on", { detail: location }));
}
