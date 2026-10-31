export type MarketplaceCategory = "games" | "apps" | "assets" | "themes" | "templates" | "research";
export type MarketplaceStatus = "draft" | "published" | "archived";

export interface CreatorProfile {
  id: string;
  name: string;
  handle: string;
  bio: string;
  website?: string;
  createdAt: string;
}

export interface MarketplaceProduct {
  id: string;
  name: string;
  slug: string;
  category: MarketplaceCategory;
  creatorId: string;
  description: string;
  tags: string[];
  price: number;
  status: MarketplaceStatus;
  createdAt: string;
  updatedAt: string;
}

export interface MarketplaceLibraryEntry {
  productId: string;
  userId: string;
  installedAt: string;
}

export interface MarketplaceReview {
  id: string;
  productId: string;
  userId: string;
  rating: number;
  comment: string;
  createdAt: string;
}
