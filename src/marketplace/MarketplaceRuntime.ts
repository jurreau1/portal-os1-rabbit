import { addInstallation, getProduct, listProducts, registerProduct } from "../registry/registries";
import { searchService } from "../search/SearchService";
import { reviewService } from "../reviews/ReviewService";
import { publishingService } from "../publishing/PublishingService";
import type { MarketplaceLibraryEntry, MarketplaceProduct, MarketplaceReview } from "../types";

export class MarketplaceRuntime {
  registerCreator(creator: { id: string; name: string; handle: string; bio: string; website?: string; createdAt?: string }) {
    const createdAt = creator.createdAt ?? new Date().toISOString();
    return registerProduct({
      id: creator.id,
      name: creator.name,
      slug: creator.handle,
      category: "apps",
      creatorId: creator.id,
      description: creator.bio,
      tags: ["creator"],
      price: 0,
      status: "published",
      createdAt,
      updatedAt: createdAt,
    });
  }

  createProduct(product: {
    id: string;
    name: string;
    slug: string;
    category: MarketplaceProduct["category"];
    creatorId: string;
    description: string;
    tags: string[];
    price: number;
  }): MarketplaceProduct {
    const now = new Date().toISOString();
    const nextProduct: MarketplaceProduct = {
      ...product,
      status: "draft",
      createdAt: now,
      updatedAt: now,
    };

    registerProduct(nextProduct);
    return nextProduct;
  }

  publishProduct(productId: string) {
    return publishingService.publishProduct(productId);
  }

  searchProducts(query: string): MarketplaceProduct[] {
    return searchService.searchProducts(query);
  }

  installProduct(productId: string, userId: string): MarketplaceLibraryEntry {
    const product = getProduct(productId);

    if (!product) {
      throw new Error(`Product ${productId} not found`);
    }

    return addInstallation({
      productId,
      userId,
      installedAt: new Date().toISOString(),
    });
  }

  addReview(productId: string, userId: string, rating: number, comment: string): MarketplaceReview {
    const product = getProduct(productId);

    if (!product) {
      throw new Error(`Product ${productId} not found`);
    }

    return reviewService.addReview({
      productId,
      userId,
      rating,
      comment,
    });
  }

  getProductSummary(productId: string): { product: MarketplaceProduct | undefined; averageRating: number } {
    const product = getProduct(productId);
    return {
      product,
      averageRating: reviewService.averageRating(productId),
    };
  }

  listProducts(): MarketplaceProduct[] {
    return listProducts();
  }
}

export const marketplaceRuntime = new MarketplaceRuntime();
