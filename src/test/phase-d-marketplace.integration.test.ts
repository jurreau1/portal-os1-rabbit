// @vitest-environment jsdom

import { beforeEach, describe, expect, it } from "vitest";

import { IdentityRuntime } from "../identity/IdentityRuntime";
import { MarketplaceRuntime } from "../marketplace/MarketplaceRuntime";
import { clearMarketplaceState } from "../marketplace/registry/registries";

describe("Phase D - Identity foundation", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("signs in a guest, loads profile, updates preferences, and restores the session", () => {
    const identity = new IdentityRuntime();
    const profile = identity.signInGuest();

    expect(profile.username).toBe("guest");
    expect(profile.id).toBeTruthy();

    const updatedProfile = identity.updateProfile({
      displayName: "Nova Portal",
      bio: "Testing the identity loop",
    });

    expect(updatedProfile.displayName).toBe("Nova Portal");

    const preferences = identity.applyPreferences({
      theme: "aurora",
      language: "en-US",
      compactLayout: true,
    });

    expect(preferences.theme).toBe("aurora");
    expect(preferences.compactLayout).toBe(true);

    const libraryEntry = identity.addLibraryItem({
      id: "game-portal-runner",
      name: "Portal Runner",
      type: "game",
      catalog: "games",
      metadata: { version: "1.0.0" },
    });

    expect(libraryEntry.name).toBe("Portal Runner");
    expect(identity.getLibrary()).toHaveLength(1);

    const snapshot = identity.getSnapshot();
    expect(snapshot.userId).toBe(profile.id);
    expect(snapshot.preferences.theme).toBe("aurora");

    const restored = new IdentityRuntime();
    const restoredSession = restored.restoreSession(profile.id);

    expect(restoredSession).not.toBeNull();
    expect(restoredSession?.profile.displayName).toBe("Nova Portal");
    expect(restoredSession?.library[0]?.name).toBe("Portal Runner");
  });
});

describe("Phase E - Marketplace foundation", () => {
  beforeEach(() => {
    clearMarketplaceState();
    localStorage.clear();
  });

  it("creates, publishes, searches, installs, and reviews marketplace products", () => {
    const marketplace = new MarketplaceRuntime();

    const product = marketplace.createProduct({
      id: "prod-portal-arcade",
      name: "Portal Arcade",
      slug: "portal-arcade",
      category: "games",
      creatorId: "creator-nova",
      description: "A co-op portal challenge game",
      tags: ["portal", "arcade", "co-op"],
      price: 19.99,
    });

    expect(product.status).toBe("draft");

    const published = marketplace.publishProduct(product.id);
    expect(published.status).toBe("published");

    const results = marketplace.searchProducts("portal");
    expect(results.some((entry) => entry.id === product.id)).toBe(true);

    const installation = marketplace.installProduct(product.id, "user-42");
    expect(installation.productId).toBe(product.id);

    const review = marketplace.addReview(product.id, "user-42", 5, "Excellent platformer");
    expect(review.rating).toBe(5);

    const summary = marketplace.getProductSummary(product.id);
    expect(summary.product?.id).toBe(product.id);
    expect(summary.averageRating).toBe(5);
  });
});
