import { identityRuntime } from "../IdentityRuntime";

export function LibraryGrid() {
  const items = identityRuntime.getLibrary();

  if (items.length === 0) {
    return <div className="empty-state">Your library is empty.</div>;
  }

  return (
    <div className="portal-card-grid">
      {items.map((item) => (
        <div className="card" key={item.id}>
          <div className="card-kicker">{item.type}</div>
          <h3>{item.name}</h3>
          <p className="muted">{item.catalog}</p>
          <p>{new Date(item.installedAt).toLocaleDateString()}</p>
        </div>
      ))}
    </div>
  );
}

export function LibraryFilters() {
  return (
    <div className="filters-row">
      <button type="button" className="chip active">All</button>
      <button type="button" className="chip">Games</button>
      <button type="button" className="chip">Apps</button>
      <button type="button" className="chip">Assets</button>
      <button type="button" className="chip">Media</button>
      <button type="button" className="chip">Research</button>
    </div>
  );
}
