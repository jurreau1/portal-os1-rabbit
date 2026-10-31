export const THEME_NAMES = [
  "dark",
  "light",
  "neon",
  "cyber",
  "matrix",
] as const;

export type ThemeName = (typeof THEME_NAMES)[number];
