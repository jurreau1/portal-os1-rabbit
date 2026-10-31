import type { Page } from "../../types/navigation";

type Props = {
  active: Page;
  collapsed: boolean;
  onToggle: () => void;
  onNavigate: (page: Page) => void;
};

export default function Sidebar({
  active,
  collapsed,
  onToggle,
  onNavigate,
}: Props) {
  const items: Array<{ key: Page; label: string }> = [
    { key: "home", label: "Home" },
    { key: "games", label: "Games" },
    { key: "apps", label: "Apps" },
    { key: "media", label: "Media" },
    { key: "research", label: "Research" },
  ];

  return (
    <aside className={collapsed ? "sidebar collapsed" : "sidebar"}>
      <div className="sidebar-top">
        <div className="logo">{collapsed ? "M" : "MAXVERSE"}</div>

        <button type="button" className="collapse-btn" onClick={onToggle}>
          ☰
        </button>
      </div>

      {items.map((item) => (
        <button
          key={item.key}
          type="button"
          className={active === item.key ? "nav-button active" : "nav-button"}
          onClick={() => onNavigate(item.key)}
        >
          {collapsed ? item.label.charAt(0).toUpperCase() : item.label.toUpperCase()}
        </button>
      ))}
    </aside>
  );
}
