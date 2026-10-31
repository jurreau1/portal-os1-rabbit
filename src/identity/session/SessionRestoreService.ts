import type { Achievement } from "./AchievementsService";
import type { LibraryItem } from "../library/LibraryService";
import type { UserPreferences } from "../preferences/PreferencesService";
import type { UserProfile } from "../types/UserProfile";

export interface IdentitySessionSnapshot {
  userId: string;
  profile: UserProfile;
  preferences: UserPreferences;
  library: LibraryItem[];
  achievements: Achievement[];
  updatedAt: string;
}

const STORAGE_KEY = "maxverse:identity:session";

function getStorage(): Storage | null {
  if (typeof window === "undefined" || !window.localStorage) {
    return null;
  }

  return window.localStorage;
}

export class SessionRestoreService {
  saveSession(snapshot: IdentitySessionSnapshot): IdentitySessionSnapshot {
    const storage = getStorage();

    if (storage) {
      storage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
    }

    return snapshot;
  }

  restoreSession(userId: string): IdentitySessionSnapshot | null {
    const storage = getStorage();

    if (!storage) {
      return null;
    }

    const raw = storage.getItem(STORAGE_KEY);

    if (!raw) {
      return null;
    }

    try {
      const snapshot = JSON.parse(raw) as IdentitySessionSnapshot;

      if (snapshot.userId !== userId) {
        return null;
      }

      return snapshot;
    } catch {
      return null;
    }
  }
}

export const sessionRestoreService = new SessionRestoreService();
