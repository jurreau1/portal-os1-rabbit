import { marketplaceRuntime } from "../MarketplaceRuntime";

export default function CreatorDashboard() {
  const products = marketplaceRuntime.listProducts();

  const creators = [
    {
      id: "creator-aurora",
      title: "Aurora Labs",
      followers: 1200,
      products: products.filter((product) => product.creatorId === "creator-aurora"),
      revenue: "$12.4k",
    },
    {
      id: "creator-rift",
      title: "Rift Research",
      followers: 860,
      products: products.filter((product) => product.creatorId === "creator-rift"),
      revenue: "$7.8k",
    },
  ];

  return (
    <section className="screen">
      <div className="screen-header">
        <h1>Creator Dashboard</h1>
      </div>

      <div className="portal-card-grid">
        {creators.map((creator) => (
          <div className="card" key={creator.id}>
            <h3>{creator.title}</h3>
            <p className="muted">Followers: {creator.followers}</p>
            <p>Published Products: {creator.products.length}</p>
            <p>Revenue: {creator.revenue}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
