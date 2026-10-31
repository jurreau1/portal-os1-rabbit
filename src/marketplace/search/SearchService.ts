import type { MarketplaceProduct } from "../types";
import { listProducts } from "../registry/registries";

export class SearchService {
  searchProducts(query: string): MarketplaceProduct[] {
    const normalized = query.trim().toLowerCase();

    if (!normalized) {
      return listProducts();
    }

    return listProducts().filter((product) => {
      const haystack = [product.name, product.slug, product.description, ...product.tags].join(" ").toLowerCase();
      return haystack.includes(normalized);
    });
  }
}

export const searchService = new SearchService();
