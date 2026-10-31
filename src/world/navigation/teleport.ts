import { useWorldState } from "../core/WorldState";

export function teleportTo(districtId: string) {
  useWorldState.getState().teleportTo(districtId);
  return districtId;
}
