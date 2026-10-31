export interface LibraryItem {
  id: string;
  title: string;
  type: "game" | "app" | "asset" | "media" | "research";
  installed: boolean;
  category?: string;
  createdAt: string;
}
