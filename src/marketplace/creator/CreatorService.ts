import { registerCreator, registerProduct, type CreatorProfile, type MarketplaceProduct } from "../registry/registries";

export class CreatorService {
  registerCreator(creator: CreatorProfile): CreatorProfile {
    return registerCreator(creator);
  }

  createProject(creatorId: string, payload: Omit<MarketplaceProduct, "id" | "creatorId" | "status" | "createdAt" | "updatedAt"> & { id?: string }): MarketplaceProduct {
    const now = new Date().toISOString();
    const product: MarketplaceProduct = {
      id: payload.id ?? `product-${Date.now()}`,
      creatorId,
      status: "draft",
      createdAt: now,
      updatedAt: now,
      ...payload,
    };

    return registerProduct(product);
  }
}

export const creatorService = new CreatorService();
