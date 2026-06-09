const PLACEHOLDER_KEYS = new Set([
  "your-google-maps-api-key",
  "your_google_maps_api_key",
  "xxx",
  "changeme",
]);

/** True only when a real Google Maps API key is configured (not a placeholder). */
export function isGoogleMapsConfigured(): boolean {
  const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY?.trim();
  if (!key) return false;
  if (PLACEHOLDER_KEYS.has(key.toLowerCase())) return false;
  // Google API keys are typically 39 chars; avoid treating short placeholders as valid.
  if (key.length < 20) return false;
  return true;
}

export function getGoogleMapsApiKey(): string | undefined {
  return isGoogleMapsConfigured()
    ? process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY?.trim()
    : undefined;
}
