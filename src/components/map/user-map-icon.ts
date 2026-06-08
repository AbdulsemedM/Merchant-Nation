/** Blue "you are here" marker for the signed-in user's GPS position. */

const USER_LOCATION_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28">
  <circle cx="14" cy="14" r="12" fill="#3b82f6" fill-opacity="0.25"/>
  <circle cx="14" cy="14" r="7" fill="#2563eb" stroke="#ffffff" stroke-width="2.5"/>
</svg>`;

export function createGoogleUserLocationIcon(
  maps: typeof google.maps
): google.maps.Icon {
  return {
    url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(USER_LOCATION_SVG)}`,
    scaledSize: new maps.Size(28, 28),
    anchor: new maps.Point(14, 14),
  };
}

export function createLeafletUserLocationIcon(
  L: typeof import("leaflet")
): import("leaflet").DivIcon {
  return L.divIcon({
    className: "pin-icon-user-location",
    html: `<div style="display:flex;align-items:center;justify-content:center;width:28px;height:28px;pointer-events:none;filter:drop-shadow(0 1px 3px rgba(0,0,0,0.4))">${USER_LOCATION_SVG}</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
}
