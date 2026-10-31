import {
  getProduct,
  listProducts,
  registerProduct,
  type MarketplaceProduct,
} from "../registry/registries";

export interface ProductDraft extends Omit<MarketplaceProduct, "status" | "createdAt" | "updatedAt"> {
  id?: string;
}

export class ProductService {
  createProduct(product: ProductDraft): MarketplaceProduct {
    const now = new Date().toISOString();
    const completeProduct: MarketplaceProduct = {
      id: product.id ?? `product-${Date.now()}`,
      name: product.name,
      slug: product.slug,
      category: product.category,
      creatorId: product.creatorId,
      description: product.description,
      tags: product.tags,
      price: product.price,
      status: "draft",
      createdAt: now,
      updatedAt: now,
    };

    return registerProduct(completeProduct);
  }

  getProduct(productId: string): MarketplaceProduct | undefined {
    return getProduct(productId);
  }

  listProducts(): MarketplaceProduct[] {
    return listProducts();
  }
}

export const productService = new ProductService();
