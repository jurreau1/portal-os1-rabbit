import { useMemo, useState } from "react";

import { identityRuntime } from "../../identity/IdentityRuntime";
import { marketplaceRuntime } from "../MarketplaceRuntime";

export default function MarketplacePage() {
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);

  const products = useMemo(() => {
    const seeded = marketplaceRuntime.listProducts();
    if (seeded.length === 0) {
      marketplaceRuntime.createProduct({
        id: "prod-portal-arcade",
        name: "Portal Arcade",
        slug: "portal-arcade",
        category: "games",
        creatorId: "creator-aurora",
        description: "A neon-charged platform challenge set in the MAXVERSE worlds.",
        tags: ["platformer", "action", "portal"],
        price: 19.99,
      });
      marketplaceRuntime.createProduct({
        id: "prod-sky-visuals",
        name: "Sky Visuals",
        slug: "sky-visuals",
        category: "assets",
        creatorId: "creator-aurora",
        description: "Atmospheric environment pack for world scenes and hubs.",
        tags: ["visuals", "lighting", "scene"],
        price: 9.99,
      });
      marketplaceRuntime.createProduct({
        id: "prod-knowledge-lab",
        name: "Knowledge Lab",
        slug: "knowledge-lab",
        category: "research",
        creatorId: "creator-rift",
        description: "Research workspace templates for experiments and publishing.",
        tags: ["research", "workflow", "templates"],
        price: 14.99,
      });
      return marketplaceRuntime.listProducts();
    }
    return seeded;
  }, []);

  const installProduct = (productId: string) => {
    const currentUser = identityRuntime.getCurrentProfile() ?? identityRuntime.signInGuest();
    const product = marketplaceRuntime.getProductSummary(productId).product;

    if (!product) {
      return;
    }

    marketplaceRuntime.installProduct(productId, currentUser.id);
    identityRuntime.addLibraryItem({
      id: product.id,
      name: product.name,
      type:
        product.category === "games"
          ? "game"
          : product.category === "apps"
            ? "app"
            : product.category === "assets"
              ? "asset"
              : product.category === "themes"
                ? "theme"
                : product.category === "templates"
                  ? "template"
                  : "research",
      catalog: product.category,
      metadata: {
        creatorId: product.creatorId,
        price: product.price,
      },
    });
  };

  if (selectedProductId) {
    return (
      <section className="screen">
        <div className="screen-header">
          <h1>Product Detail</h1>
          <button type="button" className="chip" onClick={() => setSelectedProductId(null)}>
            Back to Marketplace
          </button>
        </div>
        <ProductPage productId={selectedProductId} onInstall={installProduct} />
      </section>
    );
  }

  return (
    <section className="screen">
      <div className="screen-header">
        <h1>Marketplace</h1>
      </div>

      <div className="filters-row">
        <button type="button" className="chip active">Featured</button>
        <button type="button" className="chip">Games</button>
        <button type="button" className="chip">Apps</button>
        <button type="button" className="chip">Assets</button>
        <button type="button" className="chip">Research</button>
      </div>

      <div className="portal-card-grid">
        {products.map((product) => (
          <div className="card" key={product.id}>
            <div className="card-kicker">{product.category}</div>
            <h3>{product.name}</h3>
            <p>{product.description}</p>
            <div className="list-row">
              <span className="badge">${product.price.toFixed(2)}</span>
              <span className="badge">{product.status}</span>
            </div>
            <div className="page-actions" style={{ display: "flex", gap: 8, marginTop: 16 }}>
              <button type="button" className="primary-button" onClick={() => setSelectedProductId(product.id)}>
                View Product
              </button>
              <button type="button" className="chip" onClick={() => installProduct(product.id)}>
                Install
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function ProductPage({ productId, onInstall }: { productId: string; onInstall: (productId: string) => void }) {
  const product = useMemo(() => marketplaceRuntime.getProductSummary(productId).product, [productId]);
  const averageRating = useMemo(() => marketplaceRuntime.getProductSummary(productId).averageRating, [productId]);

  if (!product) {
    return <div className="empty-state">Product not found.</div>;
  }

  return (
    <div className="panel">
      <div className="card-kicker">{product.category}</div>
      <h2>{product.name}</h2>
      <p>{product.description}</p>
      <div className="list-row">
        <span className="badge">Creator: {product.creatorId}</span>
        <span className="badge">Rating: {averageRating.toFixed(1)}/5</span>
        <span className="badge">Version: 1.0.0</span>
      </div>

      <div className="page-actions" style={{ display: "flex", gap: 8, marginTop: 16 }}>
        <button type="button" className="primary-button" onClick={() => onInstall(product.id)}>
          Install Product
        </button>
        <button type="button" className="chip">
          View Creator
        </button>
        <button type="button" className="chip">
          Reviews ({marketplaceRuntime.getProductSummary(product.id).averageRating > 0 ? 1 : 0})
        </button>
      </div>
    </div>
  );
}
