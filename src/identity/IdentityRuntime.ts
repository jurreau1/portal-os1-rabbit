import { achievementService } from "../achievements/AchievementsService";
import { libraryService } from "../library/LibraryService";
import { preferencesService } from "../preferences/PreferencesService";
import { profileService } from "../profile/ProfileService";
import { sessionRestoreService } from "../session/SessionRestoreService";
import type { Achievement } from "../achievements/AchievementsService";
import type { LibraryItem } from "../library/LibraryService";
import type { UserPreferences } from "../preferences/PreferencesService";
import type { UserProfile } from "../types/UserProfile";

export interface IdentityRuntimeSnapshot {
  userId: string;
  profile: UserProfile;
  preferences: UserPreferences;
  library: LibraryItem[];
  achievements: Achievement[];
  updatedAt: string;
}

export class IdentityRuntime {
  private currentProfile: UserProfile | null = null;
  private currentPreferences: UserPreferences = {
    theme: "dark",
    accentColor: "cyan",
    language: "en-US",
    reduceMotion: false,
    autoSave: true,
    compactLayout: false,
    volume: 0.8,
  };
  private currentLibrary: LibraryItem[] = [];
  private currentAchievements: Achievement[] = [];

  signInGuest(): UserProfile {
    const profile = profileService.createGuestProfile();
    this.currentProfile = profile;
    this.currentPreferences = preferencesService.savePreferences(profile.id, this.currentPreferences);
    this.currentLibrary = libraryService.loadLibrary(profile.id);
    this.currentAchievements = achievementService.seedDefaultAchievements(profile.id);
    this.persist();
    return profile;
  }

  restoreSession(userId: string): IdentityRuntimeSnapshot | null {
    const snapshot = sessionRestoreService.restoreSession(userId);

    if (!snapshot) {
      return null;
    }

    this.currentProfile = snapshot.profile;
    this.currentPreferences = snapshot.preferences;
    this.currentLibrary = snapshot.library;
    this.currentAchievements = snapshot.achievements;
    return this.getSnapshot();
  }

  loadProfile(userId: string): UserProfile | null {
    const profile = profileService.loadProfile(userId);
    this.currentProfile = profile;
    return profile;
  }

  updateProfile(profilePatch: Partial<UserProfile>): UserProfile {
    if (!this.currentProfile) {
      throw new Error("No user is signed in");
    }

    const nextProfile = profileService.updateProfile(this.currentProfile.id, profilePatch);
    this.currentProfile = nextProfile;
    this.persist();
    return nextProfile;
  }

  applyPreferences(prefs: Partial<UserPreferences>): UserPreferences {
    if (!this.currentProfile) {
      throw new Error("No user is signed in");
    }

    const nextPreferences = preferencesService.savePreferences(this.currentProfile.id, prefs);
    this.currentPreferences = nextPreferences;
    this.persist();
    return nextPreferences;
  }

  getPreferences(): UserPreferences {
    if (!this.currentProfile) {
      return this.currentPreferences;
    }

    this.currentPreferences = preferencesService.loadPreferences(this.currentProfile.id);
    return this.currentPreferences;
  }

  addLibraryItem(item: Omit<LibraryItem, "userId" | "installedAt">): LibraryItem {
    if (!this.currentProfile) {
      throw new Error("No user is signed in");
    }

    const nextItem = libraryService.addItem(this.currentProfile.id, item);
    this.currentLibrary = libraryService.loadLibrary(this.currentProfile.id);
    this.persist();

    const achievements = this.currentAchievements.length === 0 ? achievementService.seedDefaultAchievements(this.currentProfile.id) : this.currentAchievements;
    if (achievements.some((achievement) => achievement.id === "library-first-install" && !achievement.unlocked)) {
      this.currentAchievements = achievements.map((achievement) =>
        achievement.id === "library-first-install"
          ? { ...achievement, unlocked: true, progress: achievement.target, unlockedAt: new Date().toISOString() }
          : achievement,
      );
      if (typeof window !== "undefined" && window.localStorage) {
        window.localStorage.setItem(
          `maxverse:identity:achievements:${this.currentProfile.id}`,
          JSON.stringify(this.currentAchievements),
        );
      }
    }

    return nextItem;
  }

  getLibrary(): LibraryItem[] {
    if (!this.currentProfile) {
      return this.currentLibrary;
    }

    this.currentLibrary = libraryService.loadLibrary(this.currentProfile.id);
    return this.currentLibrary;
  }

  getCurrentProfile(): UserProfile | null {
    return this.currentProfile;
  }

  getAchievements(): Achievement[] {
    if (!this.currentProfile) {
      return this.currentAchievements;
    }

    this.currentAchievements = achievementService.loadAchievements(this.currentProfile.id);
    return this.currentAchievements;
  }

  unlockAchievement(achievementId: string): Achievement {
    if (!this.currentProfile) {
      throw new Error("No user is signed in");
    }

    const updated = achievementService.updateProgress(this.currentProfile.id, achievementId, 1);
    this.currentAchievements = achievementService.loadAchievements(this.currentProfile.id);
    this.persist();
    return updated;
  }

  persist(): void {
    if (!this.currentProfile) {
      return;
    }

    const snapshot: IdentityRuntimeSnapshot = {
      userId: this.currentProfile.id,
      profile: this.currentProfile,
      preferences: this.currentPreferences,
      library: this.currentLibrary,
      achievements: this.currentAchievements,
      updatedAt: new Date().toISOString(),
    };

    sessionRestoreService.saveSession({
      ...snapshot,
      userId: this.currentProfile.id,
    });
  }

  getSnapshot(): IdentityRuntimeSnapshot {
    if (!this.currentProfile) {
      throw new Error("No user is signed in");
    }

    return {
      userId: this.currentProfile.id,
      profile: this.currentProfile,
      preferences: this.currentPreferences,
      library: this.currentLibrary,
      achievements: this.currentAchievements,
      updatedAt: new Date().toISOString(),
    };
  }
}

export const identityRuntime = new IdentityRuntime();
