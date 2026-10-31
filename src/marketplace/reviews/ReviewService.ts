import { addReview, listReviews } from "../registry/registries";
import type { MarketplaceReview } from "../types";

export class ReviewService {
  addReview(review: Omit<MarketplaceReview, "id" | "createdAt">): MarketplaceReview {
    const nextReview: MarketplaceReview = {
      ...review,
      id: `review-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    return addReview(nextReview);
  }

  listReviews(productId: string): MarketplaceReview[] {
    return listReviews(productId);
  }

  averageRating(productId: string): number {
    const reviews = listReviews(productId);

    if (reviews.length === 0) {
      return 0;
    }

    return reviews.reduce((total, review) => total + review.rating, 0) / reviews.length;
  }
}

export const reviewService = new ReviewService();
