"use client";

import { Fragment } from "react";
import { Polygon, Marker } from "react-leaflet";
import L from "leaflet";
import { Polygon as GooglePolygon, Marker as GoogleMarker } from "@react-google-maps/api";
import type { NeighborBranchTerritory } from "@/app/actions/branch-territory";
import { polygonCentroid } from "@/lib/territoryNeighbors";

const NEIGHBOR_STROKE = "#64748b";
const NEIGHBOR_FILL_OPACITY = 0.06;

function createNeighborLabelIcon(Lib: typeof L, label: string) {
  const escaped = label.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  return Lib.divIcon({
    className: "neighbor-territory-label",
    html: `<div style="pointer-events:none;white-space:nowrap;padding:2px 8px;border-radius:4px;background:rgba(15,23,42,0.75);color:#e2e8f0;font-family:ui-monospace,monospace;font-size:11px;font-weight:600;border:1px dashed #64748b">${escaped}</div>`,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  });
}

export function NeighborTerritoryLayerLeaflet({
  neighbors,
  visible = true,
}: {
  neighbors: NeighborBranchTerritory[];
  visible?: boolean;
}) {
  if (!visible || neighbors.length === 0) return null;

  return (
    <>
      {neighbors.map((neighbor) => {
        if (neighbor.territoryBounds.length < 3) return null;
        const centroid = polygonCentroid(neighbor.territoryBounds);
        const positions = neighbor.territoryBounds.map(
          (p) => [p.lat, p.lng] as [number, number]
        );
        return (
          <Fragment key={neighbor.branchId}>
            <Polygon
              positions={positions}
              pathOptions={{
                color: NEIGHBOR_STROKE,
                weight: 2,
                dashArray: "8 8",
                fillColor: NEIGHBOR_STROKE,
                fillOpacity: NEIGHBOR_FILL_OPACITY,
                interactive: false,
              }}
            />
            {centroid && (
              <Marker
                position={[centroid.lat, centroid.lng]}
                icon={createNeighborLabelIcon(L, neighbor.branchName)}
                interactive={false}
                zIndexOffset={-100}
              />
            )}
          </Fragment>
        );
      })}
    </>
  );
}

export function NeighborTerritoryLayerGoogle({
  neighbors,
  visible = true,
}: {
  neighbors: NeighborBranchTerritory[];
  visible?: boolean;
}) {
  if (!visible || neighbors.length === 0) return null;

  return (
    <>
      {neighbors.map((neighbor) => {
        if (neighbor.territoryBounds.length < 3) return null;
        const centroid = polygonCentroid(neighbor.territoryBounds);
        const paths = neighbor.territoryBounds.map((p) => ({ lat: p.lat, lng: p.lng }));
        return (
          <Fragment key={neighbor.branchId}>
            <GooglePolygon
              paths={paths}
              options={{
                strokeColor: NEIGHBOR_STROKE,
                strokeWeight: 2,
                strokeOpacity: 0.85,
                fillColor: NEIGHBOR_STROKE,
                fillOpacity: NEIGHBOR_FILL_OPACITY,
                clickable: false,
                zIndex: 1,
              }}
            />
            {centroid && (
              <GoogleMarker
                position={centroid}
                clickable={false}
                label={{
                  text: neighbor.branchName,
                  color: "#e2e8f0",
                  fontSize: "11px",
                  fontWeight: "600",
                  className: "neighbor-territory-google-label",
                }}
                icon={{
                  path: google.maps.SymbolPath.CIRCLE,
                  scale: 0,
                  fillOpacity: 0,
                  strokeOpacity: 0,
                }}
                zIndex={1}
              />
            )}
          </Fragment>
        );
      })}
    </>
  );
}
