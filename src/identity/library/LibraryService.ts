export type LibraryAssetType = "game" | "app" | "asset" | "theme" | "template" | "research";

export interface LibraryItem {
  id: string;
  userId: string;
  name: string;
  type: LibraryAssetType;
  catalog: string;
  installedAt: string;
  metadata?: Record<string, unknown>;
}

const STORAGE_KEY = "maxverse:identity:library";

function getStorage(): Storage | null {
  if (typeof window === "undefined" || !window.localStorage) {
    return null;
  }

  return window.localStorage;
}

export class LibraryService {
  loadLibrary(userId: string): LibraryItem[] {
    const storage = getStorage();

    if (!storage) {
      return [];
    }

    const raw = storage.getItem(STORAGE_KEY);

    if (!raw) {
      return [];
    }

    try {
      const items = JSON.parse(raw) as LibraryItem[];
      return items.filter((item) => item.userId === userId);
    } catch {
      return [];
    }
  }

  addItem(userId: string, item: Omit<LibraryItem, "userId" | "installedAt">): LibraryItem {
    const storage = getStorage();
    const current = this.loadLibrary(userId);
    const nextItem: LibraryItem = {
      ...item,
      userId,
      installedAt: new Date().toISOString(),
    };

    const updated = [...current, nextItem];

    if (storage) {
      storage.setItem(STORAGE_KEY, JSON.stringify(updated));
    }

    return nextItem;
  }

  removeItem(userId: string, itemId: string): LibraryItem[] {
    const storage = getStorage();
    const current = this.loadLibrary(userId);
    const updated = current.filter((item) => item.id !== itemId);

    if (storage) {
      storage.setItem(STORAGE_KEY, JSON.stringify(updated));
    }

    return updated;
  }
}

export const libraryService = new LibraryService();
