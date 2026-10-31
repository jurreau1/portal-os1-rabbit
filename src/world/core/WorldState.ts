import { create } from "zustand";

export interface WorldState {
  currentDistrict: string;
  setCurrentDistrict: (district: string) => void;
  teleportTo: (district: string) => void;
}

export const useWorldState = create<WorldState>((set) => ({
  currentDistrict: "nexus",
  setCurrentDistrict: (district: string) => set({ currentDistrict: district }),
  teleportTo: (district: string) => set({ currentDistrict: district }),
}));
