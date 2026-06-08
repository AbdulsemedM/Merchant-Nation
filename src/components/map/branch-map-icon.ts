/** Shared bank-style marker for Coop branch locations on the map. */

const BRANCH_BANK_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 30 30">
  <circle cx="15" cy="15" r="13" fill="#b45309" stroke="#ffffff" stroke-width="2"/>
  <path fill="#ffffff" d="M15 8.5 21.5 13.5H8.5L15 8.5Z"/>
  <rect fill="#ffffff" x="9" y="13.5" width="12" height="7.5"/>
  <rect fill="#b45309" x="10.5" y="14.5" width="1.4" height="5.5"/>
  <rect fill="#b45309" x="14.3" y="14.5" width="1.4" height="5.5"/>
  <rect fill="#b45309" x="18.1" y="14.5" width="1.4" height="5.5"/>
  <rect fill="#ffffff" x="8" y="21" width="14" height="1.8"/>
</svg>`;

export function createGoogleBranchIcon(
  maps: typeof google.maps
): google.maps.Icon {
  return {
    url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(BRANCH_BANK_SVG)}`,
    scaledSize: new maps.Size(30, 30),
    anchor: new maps.Point(15, 15),
  };
}

export function createLeafletBranchIcon(
  L: typeof import("leaflet")
): import("leaflet").DivIcon {
  return L.divIcon({
    className: "pin-icon-branch-bank",
    html: `<div style="display:flex;align-items:center;justify-content:center;width:30px;height:30px;cursor:pointer;filter:drop-shadow(0 1px 2px rgba(0,0,0,0.35))">${BRANCH_BANK_SVG}</div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });
}