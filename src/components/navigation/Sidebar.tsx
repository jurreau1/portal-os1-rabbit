type Props = {
  active: string;
  onNavigate: (page: "home" | "games" | "apps" | "media" | "research" | "workbench") => void;
};

const items = [
  { key: "home", label: "Home" },
  { key: "games", label: "Games" },
  { key: "apps", label: "Apps" },
  { key: "media", label: "Media" },
  { key: "research", label: "Research" },
  { key: "workbench", label: "Workbench" },
] as const;

export default function Sidebar({ active, onNavigate }: Props) {
  return (
    <aside className="portal-sidebar">
      <div className="portal-brand">
        <div className="portal-brand-mark">MX</div>
        <div>
          <strong>MAXVERSE</strong>
          <small>STRUCTURAL PORTAL</small>
        </div>
      </div>

      <nav className="portal-nav" aria-label="Portal navigation">
        {items.map((item) => (
          <button
            key={item.key}
            type="button"
            className={
              active === item.key ? "portal-nav-button active" : "portal-nav-button"
            }
            onClick={() => onNavigate(item.key)}
          >
            {item.label}
          </button>
        ))}
      </nav>
    </aside>
  );
}
