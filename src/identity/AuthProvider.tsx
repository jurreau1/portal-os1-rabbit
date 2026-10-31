import { useMemo, useState, type ReactNode } from "react";

import { AuthContext, type AuthContextValue } from "./AuthContext";
import type { UserProfile } from "./types/UserProfile";

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading: false,
      signIn: async () => {
        setUser({
          id: "guest-user",
          username: "guest",
          displayName: "Guest User",
          email: "guest@maxverse.local",
          avatar: "guest",
          bio: "Guest access",
          theme: "dark",
          roles: ["guest"],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      },
      signOut: async () => {
        setUser(null);
      },
      updateProfile: async (profile: Partial<UserProfile>) => {
        setUser((current) => {
          if (!current) {
            return current;
          }

          return {
            ...current,
            ...profile,
            updatedAt: new Date().toISOString(),
          };
        });
      },
    }),
    [user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
