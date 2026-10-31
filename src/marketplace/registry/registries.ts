import type {
  CreatorProfile,
  MarketplaceLibraryEntry,
  MarketplaceProduct,
  MarketplaceReview,
} from "../types";

const productRegistry = new Map<string, MarketplaceProduct>();
const creatorRegistry = new Map<string, CreatorProfile>();
const reviewRegistry = new Map<string, MarketplaceReview[]>();
const libraryRegistry = new Map<string, MarketplaceLibraryEntry[]>();

export function registerProduct(product: MarketplaceProduct): MarketplaceProduct {
  productRegistry.set(product.id, product);
  return product;
}

export function getProduct(productId: string): MarketplaceProduct | undefined {
  return productRegistry.get(productId);
}

export function listProducts(): MarketplaceProduct[] {
  return Array.from(productRegistry.values());
}

export function registerCreator(creator: CreatorProfile): CreatorProfile {
  creatorRegistry.set(creator.id, creator);
  return creator;
}

export function getCreator(creatorId: string): CreatorProfile | undefined {
  return creatorRegistry.get(creatorId);
}

export function listCreators(): CreatorProfile[] {
  return Array.from(creatorRegistry.values());
}

export function addReview(review: MarketplaceReview): MarketplaceReview {
  const current = reviewRegistry.get(review.productId) ?? [];
  reviewRegistry.set(review.productId, [...current, review]);
  return review;
}

export function listReviews(productId: string): MarketplaceReview[] {
  return reviewRegistry.get(productId) ?? [];
}

export function addInstallation(entry: MarketplaceLibraryEntry): MarketplaceLibraryEntry {
  const current = libraryRegistry.get(entry.userId) ?? [];
  libraryRegistry.set(entry.userId, [...current, entry]);
  return entry;
}

export function listInstallations(userId: string): MarketplaceLibraryEntry[] {
  return libraryRegistry.get(userId) ?? [];
}

export function clearMarketplaceState(): void {
  productRegistry.clear();
  creatorRegistry.clear();
  reviewRegistry.clear();
  libraryRegistry.clear();
}

export { productRegistry, creatorRegistry, reviewRegistry, libraryRegistry };
