import { getProduct, registerProduct } from "../registry/registries";
import type { MarketplaceProduct } from "../types";

export interface PublishOptions {
  featured?: boolean;
  releaseNotes?: string;
}

export class PublishingService {
  publishProduct(productId: string, options: PublishOptions = {}): MarketplaceProduct {
    const existing = getProduct(productId);

    if (!existing) {
      throw new Error(`Product ${productId} not found`);
    }

    const nextProduct: MarketplaceProduct = {
      ...existing,
      status: "published",
      updatedAt: new Date().toISOString(),
    };

    if (options.featured !== undefined) {
      nextProduct.tags = [...new Set([...nextProduct.tags, options.featured ? "featured" : "standard"])];
    }

    if (options.releaseNotes) {
      nextProduct.tags = [...new Set([...nextProduct.tags, "release-notes"])];
    }

    registerProduct(nextProduct);
    return nextProduct;
  }
}

export const publishingService = new PublishingService();
