import { useMemo } from "react";

import { identityRuntime } from "../identity/IdentityRuntime";

export type ThemePreference = "dark" | "light" | "neon" | "cyber" | "matrix";

export function applyThemePreference(theme: ThemePreference) {
  document.body.dataset.theme = theme;
  const profile = identityRuntime.getCurrentProfile();
  if (profile) {
    identityRuntime.applyPreferences({ theme });
  }
}

export function useCurrentTheme(): ThemePreference {
  return useMemo(() => {
    const profile = identityRuntime.getCurrentProfile();
    return (profile?.theme as ThemePreference) ?? "dark";
  }, [identityRuntime.getCurrentProfile()?.theme]);
}
