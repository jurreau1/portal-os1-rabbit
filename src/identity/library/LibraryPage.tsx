import { useMemo } from "react";

import { identityRuntime } from "../IdentityRuntime";

export default function LibraryPage() {
  const profile = identityRuntime.getCurrentProfile() ?? identityRuntime.signInGuest();
  const library = useMemo(() => identityRuntime.getLibrary(), [profile.id]);

  const groups = [
    { key: "games", label: "Games" },
    { key: "apps", label: "Apps" },
    { key: "assets", label: "Assets" },
    { key: "media", label: "Media" },
    { key: "research", label: "Research" },
  ];

  return (
    <section className="screen">
      <div className="screen-header">
        <h1>Library</h1>
      </div>

      <div className="filters-row">
        {groups.map((group) => (
          <button type="button" className="chip" key={group.key}>
            {group.label}
          </button>
        ))}
      </div>

      {library.length === 0 ? (
        <div className="empty-state">
          No library items yet. Install a product from the marketplace to fill your inventory.
        </div>
      ) : (
        <div className="portal-card-grid">
          {library.map((item) => (
            <div className="card" key={item.id}>
              <div className="card-kicker">{item.type}</div>
              <h3>{item.name}</h3>
              <p className="muted">{item.catalog}</p>
              <p>{item.metadata ? JSON.stringify(item.metadata) : "Ready to launch"}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
