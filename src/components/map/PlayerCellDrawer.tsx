"use client";

import { useState, useEffect } from "react";
import type { MapZoneStatus } from "@/lib/zoneStatusColors";
import type { TerritoryCellWithCoords, TerritoryCellWithBranchName } from "@/app/actions/branch-territory";
import { getMyTaskForCell } from "@/app/actions/mission";
import { PlayerCellHero } from "./player-cell/PlayerCellHero";
import { PlayerMissionCard } from "./player-cell/PlayerMissionCard";
import { PlayerCellActions } from "./player-cell/PlayerCellActions";
import { PlayerMerchantsIntel } from "./player-cell/PlayerMerchantsIntel";

export function PlayerCellDrawer({
  cell,
  zoneId: _zoneId,
  cellStatus,
  branchId: branchIdProp,
  onClose: _onClose,
  onScout,
  onInduct,
}: {
  cell: TerritoryCellWithCoords | TerritoryCellWithBranchName;
  zoneId: string | null;
  cellStatus: MapZoneStatus;
  /** Branch that owns this cell (from map context when cell has no branchId). */
  branchId?: string | null;
  onClose: () => void;
  onScout: () => void;
  onInduct?: () => void;
}) {
  const [taskForCell, setTaskForCell] = useState<{ id: string; title: string; mission: { id: string; name: string } } | null>(null);

  useEffect(() => {
    getMyTaskForCell(cell.id).then((t) => {
      if (t) setTaskForCell({ id: t.id, title: t.title, mission: t.mission });
      else setTaskForCell(null);
    }).catch(() => setTaskForCell(null));
  }, [cell.id]);

  return (
    <>
      <PlayerCellHero zoneCode={cell.code} status={cellStatus ?? "UNSEEN"} />
      <div className="flex flex-col gap-5 px-4 pb-6 pt-4">
        {taskForCell && <PlayerMissionCard task={taskForCell} />}
        <PlayerCellActions onScout={onScout} onInduct={onInduct} />
        <PlayerMerchantsIntel
          zoneCode={cell.code}
          branchId={("branchId" in cell ? cell.branchId : branchIdProp) ?? undefined}
          cellCoordinates={cell.coordinates}
        />
      </div>
    </>
  );
}
