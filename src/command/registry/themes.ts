export const THEMES = {
  dark: { id: "dark", label: "Dark" },
  light: { id: "light", label: "Light" },
  neon: { id: "neon", label: "Neon" },
  cyber: { id: "cyber", label: "Cyber" },
  matrix: { id: "matrix", label: "Matrix" },
} as const;

export type ThemeName = keyof typeof THEMES;
