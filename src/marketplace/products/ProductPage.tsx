import { useMemo } from "react";

import { marketplaceRuntime } from "../MarketplaceRuntime";

export default function ProductPage({ productId }: { productId: string }) {
  const product = useMemo(() => marketplaceRuntime.getProductSummary(productId).product, [productId]);
  const averageRating = useMemo(() => marketplaceRuntime.getProductSummary(productId).averageRating, [productId]);

  if (!product) {
    return <div className="empty-state">Product not found.</div>;
  }

  return (
    <section className="screen">
      <div className="screen-header">
        <h1>{product.name}</h1>
      </div>

      <div className="panel">
        <div className="card-kicker">{product.category}</div>
        <p>{product.description}</p>
        <div className="list-row">
          <span className="badge">Creator: {product.creatorId}</span>
          <span className="badge">Rating: {averageRating.toFixed(1)}/5</span>
          <span className="badge">Version: 1.0.0</span>
        </div>
      </div>

      <div className="page-actions">
        <button type="button" className="primary-button">Install</button>
      </div>
    </section>
  );
}
