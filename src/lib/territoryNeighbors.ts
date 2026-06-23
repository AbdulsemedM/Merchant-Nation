export type GeoPoint = { lat: number; lng: number };

/** Average of polygon vertices (simple centroid for territory bounds). */
export function polygonCentroid(points: GeoPoint[]): GeoPoint | null {
  if (!points || points.length === 0) return null;
  const sum = points.reduce(
    (acc, p) => ({ lat: acc.lat + p.lat, lng: acc.lng + p.lng }),
    { lat: 0, lng: 0 }
  );
  return { lat: sum.lat / points.length, lng: sum.lng / points.length };
}

const EARTH_RADIUS_KM = 6371;

/** Great-circle distance between two lat/lng points in kilometers. */
export function haversineDistanceKm(a: GeoPoint, b: GeoPoint): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(h));
}

/** Bounding box for a set of points. */
export function boundsFromPoints(points: GeoPoint[]): {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
} | null {
  if (!points || points.length === 0) return null;
  let minLat = points[0].lat;
  let maxLat = points[0].lat;
  let minLng = points[0].lng;
  let maxLng = points[0].lng;
  for (const p of points) {
    minLat = Math.min(minLat, p.lat);
    maxLat = Math.max(maxLat, p.lat);
    minLng = Math.min(minLng, p.lng);
    maxLng = Math.max(maxLng, p.lng);
  }
  return { minLat, maxLat, minLng, maxLng };
}

/** Merge multiple bounding boxes into one. */
export function mergeBounds(
  boxes: Array<{ minLat: number; maxLat: number; minLng: number; maxLng: number }>
): { minLat: number; maxLat: number; minLng: number; maxLng: number } | null {
  if (boxes.length === 0) return null;
  return boxes.reduce(
    (acc, b) => ({
      minLat: Math.min(acc.minLat, b.minLat),
      maxLat: Math.max(acc.maxLat, b.maxLat),
      minLng: Math.min(acc.minLng, b.minLng),
      maxLng: Math.max(acc.maxLng, b.maxLng),
    }),
    { ...boxes[0] }
  );
}
