import { createContext } from "react";

import type { UserProfile } from "./types/UserProfile";

export interface AuthContextValue {
  user: UserProfile | null;
  loading: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (profile: Partial<UserProfile>) => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
