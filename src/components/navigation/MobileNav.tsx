import type { Page } from "../../types/navigation";

type Props = {
  active: Page;
  onNavigate: (page: Page) => void;
};

const NAV_ITEMS: Array<{ id: Page; label: string; icon: string }> = [
  { id: "home", label: "Home", icon: "🏠" },
  { id: "games", label: "Games", icon: "🎮" },
  { id: "apps", label: "Apps", icon: "📱" },
  { id: "media", label: "Media", icon: "🎬" },
  { id: "research", label: "Research", icon: "🧠" },
];

export default function MobileNav({ active, onNavigate }: Props) {
  return (
    <nav className="mobile-nav" aria-label="Mobile navigation">
      {NAV_ITEMS.map((item) => (
        <button
          key={item.id}
          type="button"
          className={active === item.id ? "mobile-nav-item active" : "mobile-nav-item"}
          onClick={() => onNavigate(item.id)}
        >
          <span>{item.icon}</span>
          <span>{item.label}</span>
        </button>
      ))}
    </nav>
  );
}
