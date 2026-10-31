import { create } from "zustand";

type WorldModeState = {
  worldEnabled: boolean;
  enterWorld: () => void;
  exitWorld: () => void;
  toggleWorld: (value?: boolean) => void;
};

export const useWorldMode = create<WorldModeState>((set) => ({
  worldEnabled: false,

  enterWorld: () => set({ worldEnabled: true }),
  exitWorld: () => set({ worldEnabled: false }),

  toggleWorld: (value?: boolean) =>
    set((state) => ({
      worldEnabled: value ?? !state.worldEnabled,
    })),
}));
