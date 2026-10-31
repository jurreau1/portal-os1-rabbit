import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

import type {
  Agent,
  MaxversePlayer,
  PortalNode,
  WorldDistrict,
  WorldModule,
} from "./WorldState";

import {
  defaultAgents,
  defaultDistricts,
  defaultModules,
  defaultPlayer,
  defaultPortals,
} from "./WorldRegistry";

export type WorldContextValue = {
  districts: WorldDistrict[];
  portals: PortalNode[];
  player: MaxversePlayer;
  modules: WorldModule[];
  agents: Agent[];
  currentDistrict: string;
  setCurrentDistrict: React.Dispatch<React.SetStateAction<string>>;
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

export function WorldProvider({ children }: { children?: ReactNode }) {
  const [currentDistrict, setCurrentDistrict] = useState(defaultPlayer.district);

  const value = useMemo<WorldContextValue>(
    () => ({
      districts: defaultDistricts,
      portals: defaultPortals,
      player: defaultPlayer,
      modules: defaultModules,
      agents: defaultAgents,
      currentDistrict,
      setCurrentDistrict,
      navigateToDistrict: (districtId: string) => setCurrentDistrict(districtId),
      launchModule: (moduleId: string) => {
        const match = defaultModules.find((module) => module.id === moduleId);
        if (!match) return;
        setCurrentDistrict(match.district);
        if (typeof window !== "undefined") {
          window.location.hash = match.route;
        }
      },
    }),
    [currentDistrict],
  );

  return <WorldContext.Provider value={value}>{children}</WorldContext.Provider>;
}
