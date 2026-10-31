export interface Achievement {
  id: string;
  title: string;
  description: string;
  unlocked: boolean;
  progress: number;
  target: number;
  unlockedAt?: string;
}

const STORAGE_KEY = "maxverse:identity:achievements";

function getStorage(): Storage | null {
  if (typeof window === "undefined" || !window.localStorage) {
    return null;
  }

  return window.localStorage;
}

export class AchievementService {
  loadAchievements(userId: string): Achievement[] {
    const storage = getStorage();

    if (!storage) {
      return [];
    }

    const raw = storage.getItem(`${STORAGE_KEY}:${userId}`);

    if (!raw) {
      return [];
    }

    try {
      return JSON.parse(raw) as Achievement[];
    } catch {
      return [];
    }
  }

  updateProgress(userId: string, achievementId: string, progress: number): Achievement {
    const achievements = this.loadAchievements(userId);
    const existing = achievements.find((achievement) => achievement.id === achievementId);

    if (!existing) {
      throw new Error(`Achievement ${achievementId} not found`);
    }

    const nextProgress = Math.min(Math.max(progress, 0), existing.target);
    const unlocked = nextProgress >= existing.target;
    const nextAchievement: Achievement = {
      ...existing,
      progress: nextProgress,
      unlocked,
      unlockedAt: unlocked ? existing.unlockedAt ?? new Date().toISOString() : undefined,
    };

    const updated = achievements.map((achievement) =>
      achievement.id === achievementId ? nextAchievement : achievement,
    );

    const storage = getStorage();
    if (storage) {
      storage.setItem(`${STORAGE_KEY}:${userId}`, JSON.stringify(updated));
    }

    return nextAchievement;
  }

  seedDefaultAchievements(userId: string): Achievement[] {
    const seeded: Achievement[] = [
      {
        id: "profile-complete",
        title: "Profile complete",
        description: "Complete the primary profile form",
        unlocked: false,
        progress: 0,
        target: 1,
      },
      {
        id: "library-first-install",
        title: "Library unlocked",
        description: "Install your first product or app",
        unlocked: false,
        progress: 0,
        target: 1,
      },
      {
        id: "preferences-applied",
        title: "Preferences applied",
        description: "Save a custom theme and layout",
        unlocked: false,
        progress: 0,
        target: 1,
      },
    ];

    const storage = getStorage();
    if (storage) {
      storage.setItem(`${STORAGE_KEY}:${userId}`, JSON.stringify(seeded));
    }

    return seeded;
  }
}

export const achievementService = new AchievementService();
