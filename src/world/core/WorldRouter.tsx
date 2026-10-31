import { useMemo, useState, type ReactNode } from "react";
import { WorldContext, worldAgents, worldDistricts, worldModules, worldPlayer, worldPortals } from "./WorldRegistry";

export function WorldProvider({ children }: { children: ReactNode }) {
  const [currentDistrict, setCurrentDistrict] = useState(worldPlayer.district);

  const value = useMemo(
    () => ({
      districts: worldDistricts,
      portals: worldPortals,
      player: worldPlayer,
      modules: worldModules,
      agents: worldAgents,
      currentDistrict,
      setCurrentDistrict,
      navigateToDistrict: (districtId: string) => setCurrentDistrict(districtId),
      launchModule: (moduleId: string) => {
        const match = worldModules.find((module) => module.id === moduleId);
        if (match) {
          setCurrentDistrict(match.district);
          window.location.hash = match.route;
        }
      },
    }),
    [currentDistrict],
  );

  return <WorldContext.Provider value={value}>{children}</WorldContext.Provider>;
}
