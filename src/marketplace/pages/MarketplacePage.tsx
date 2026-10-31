import { marketplaceRuntime } from "../MarketplaceRuntime";

export default function MarketplacePage() {
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
          </div>
        ))}
      </div>
    </section>
  );
}
