export interface UserPreferences {
  theme: string;
  accentColor: string;
  language: string;
  reduceMotion: boolean;
  autoSave: boolean;
  compactLayout: boolean;
  volume: number;
}

export const defaultPreferences: UserPreferences = {
  theme: "dark",
  accentColor: "cyan",
  language: "en-US",
  reduceMotion: false,
  autoSave: true,
  compactLayout: false,
  volume: 0.8,
};

const STORAGE_KEY = "maxverse:identity:preferences";

function getStorage(): Storage | null {
  if (typeof window === "undefined" || !window.localStorage) {
    return null;
  }

  return window.localStorage;
}

export class PreferencesService {
  loadPreferences(userId: string): UserPreferences {
    const storage = getStorage();

    if (!storage) {
      return defaultPreferences;
    }

    const raw = storage.getItem(`${STORAGE_KEY}:${userId}`);

    if (!raw) {
      return defaultPreferences;
    }

    try {
      return {
        ...defaultPreferences,
        ...JSON.parse(raw),
      } as UserPreferences;
    } catch {
      return defaultPreferences;
    }
  }

  savePreferences(userId: string, prefs: Partial<UserPreferences>): UserPreferences {
    const storage = getStorage();
    const merged = {
      ...defaultPreferences,
      ...this.loadPreferences(userId),
      ...prefs,
    };

    if (storage) {
      storage.setItem(`${STORAGE_KEY}:${userId}`, JSON.stringify(merged));
    }

    return merged;
  }
}

export const preferencesService = new PreferencesService();
