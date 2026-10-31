import { useWorldMode } from "../state/worldMode";
import { useWorldState } from "../world/core/WorldState";

export function resetStores() {
  useWorldMode.setState({
    worldEnabled: false,
  });

  useWorldState.setState({
    currentDistrict: "nexus",
  });
}
