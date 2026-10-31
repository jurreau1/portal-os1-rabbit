import { create } from "zustand";

import { WORLD_DISTRICTS } from "./WorldRegistry";

export interface WorldState {
  currentDistrict: string;
  setCurrentDistrict: (district: string) => void;
  teleportTo: (district: string) => void;
}

const VALID_DISTRICTS = new Set<string>(WORLD_DISTRICTS);

export const useWorldState = create<WorldState>((set) => ({
  currentDistrict: "nexus",
  setCurrentDistrict: (district: string) => {
    if (!VALID_DISTRICTS.has(district)) {
      throw new Error(`Unknown district: ${district}`);
    }

    set({ currentDistrict: district });
  },
  teleportTo: (district: string) => {
    if (!VALID_DISTRICTS.has(district)) {
      throw new Error(`Unknown district: ${district}`);
    }

    set({ currentDistrict: district });
  },
}));
