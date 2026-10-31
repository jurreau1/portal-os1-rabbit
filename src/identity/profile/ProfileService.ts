import type { UserProfile } from "../types/UserProfile";

export interface ProfileDraft {
  username?: string;
  displayName?: string;
  email?: string;
  bio?: string;
  avatar?: string;
  theme?: string;
  roles?: string[];
}

const STORAGE_KEY = "maxverse:identity:profile";

function getStorage(): Storage | null {
  if (typeof window === "undefined" || !window.localStorage) {
    return null;
  }

  return window.localStorage;
}

export class ProfileService {
  loadProfile(userId: string): UserProfile | null {
    const storage = getStorage();

    if (!storage) {
      return null;
    }

    const raw = storage.getItem(STORAGE_KEY);

    if (!raw) {
      return null;
    }

    try {
      const profile = JSON.parse(raw) as UserProfile;

      if (profile.id !== userId) {
        return null;
      }

      return profile;
    } catch {
      return null;
    }
  }

  createGuestProfile(): UserProfile {
    const profile: UserProfile = {
      id: `guest-${Date.now()}`,
      username: "guest",
      displayName: "Guest User",
      email: "guest@maxverse.local",
      avatar: "guest",
      bio: "Guest access",
      theme: "dark",
      roles: ["guest"],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.saveProfile(profile);

    return profile;
  }

  saveProfile(profile: UserProfile): UserProfile {
    const storage = getStorage();

    if (storage) {
      storage.setItem(STORAGE_KEY, JSON.stringify(profile));
    }

    return profile;
  }

  updateProfile(userId: string, profilePatch: Partial<UserProfile>): UserProfile {
    const existing = this.loadProfile(userId);

    if (!existing) {
      throw new Error("Profile not found for user");
    }

    const nextProfile: UserProfile = {
      ...existing,
      ...profilePatch,
      id: existing.id,
      updatedAt: new Date().toISOString(),
    };

    return this.saveProfile(nextProfile);
  }
}

export const profileService = new ProfileService();
