import { createContext, useContext } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { Agent, MaxversePlayer, PortalNode, WorldDistrict, WorldModule } from "./WorldState";
import { defaultAgents, defaultDistricts, defaultModules, defaultPlayer, defaultPortals } from "./WorldRegistry";

export type WorldContextValue = {
  districts: WorldDistrict[];
  portals: PortalNode[];
  player: MaxversePlayer;
  modules: WorldModule[];
  agents: Agent[];
  currentDistrict: string;
  setCurrentDistrict: Dispatch<SetStateAction<string>>;
  navigateToDistrict: (districtId: string) => void;
  launchModule: (moduleId: string) => void;
};

export const WorldContext = createContext<WorldContextValue | null>(null);

export function useWorld() {
  const context = useContext(WorldContext);

  if (!context) {
    throw new Error("useWorld must be used within WorldProvider");
  }

  return context;
}

export const worldDistricts = defaultDistricts;
export const worldPortals = defaultPortals;
export const worldPlayer = defaultPlayer;
export const worldModules = defaultModules;
export const worldAgents = defaultAgents;
