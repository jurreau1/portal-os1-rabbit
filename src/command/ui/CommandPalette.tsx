import { useMemo, useState } from "react";
import type { Page } from "../../types/navigation";

type Props = {
  open: boolean;
  onClose: () => void;
  onNavigate: (page: Page) => void;
  onThemeChange: (theme: string) => void;
};

export default function CommandPalette({
  open,
  onClose,
  onNavigate,
  onThemeChange,
}: Props) {
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    if (!query.trim()) {
      return [];
    }

    const q = query.replace("/", "").trim().toLowerCase();

    return [
      { action: "open", target: "home", page: "home" as Page, description: "Open dashboard" },
      { action: "open", target: "games", page: "games" as Page, description: "Open games" },
      { action: "open", target: "apps", page: "apps" as Page, description: "Open apps" },
      { action: "open", target: "media", page: "media" as Page, description: "Open media" },
      { action: "open", target: "research", page: "research" as Page, description: "Open research" },
      { action: "theme", target: "dark", description: "Dark theme" },
      { action: "theme", target: "light", description: "Light theme" },
      { action: "theme", target: "neon", description: "Neon theme" },
      { action: "theme", target: "cyber", description: "Cyber theme" },
      { action: "theme", target: "matrix", description: "Matrix theme" },
    ].filter((item) => {
      const haystack = `${item.action} ${item.target}`.toLowerCase();
      return fuzzyMatch(q, haystack);
    });
  }, [query]);

  if (!open) {
    return null;
  }

  return (
    <div className="command-modal" onClick={onClose}>
      <div className="command-box" onClick={(event) => event.stopPropagation()}>
        <input
          autoFocus
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Type a MAX command..."
          onKeyDown={(event) => {
            if (event.key === "Enter" && query.trim()) {
              const normalized = query.trim();

              if (normalized.startsWith("/")) {
                const parts = normalized.substring(1).split(/\s+/);
                const action = parts[0]?.toLowerCase();

                if (action === "open" && parts[1]) {
                  const target = parts[1].toLowerCase();
                  const map: Record<string, Page> = {
                    home: "home",
                    games: "games",
                    apps: "apps",
                    media: "media",
                    research: "research",
                  };

                  if (map[target]) {
                    onNavigate(map[target]);
                    onClose();
                    return;
                  }
                }

                if (action === "theme" && parts[1]) {
                  onThemeChange(parts[1].toLowerCase());
                  onClose();
                  return;
                }
              }

              if (results[0]) {
                const item = results[0];
                if (item.action === "open" && item.page) {
                  onNavigate(item.page);
                } else if (item.action === "theme") {
                  onThemeChange(item.target);
                }
                onClose();
              }
            }
          }}
        />

        {results.length > 0 && (
          <div className="command-results">
            {results.map((item, index) => (
              <button
                key={`${item.action}-${item.target}-${index}`}
                type="button"
                className="command-result"
                onClick={() => {
                  if (item.action === "open" && item.page) {
                    onNavigate(item.page);
                  } else if (item.action === "theme") {
                    onThemeChange(item.target);
                  }
                  onClose();
                }}
              >
                /{item.action} {item.target}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function fuzzyMatch(query: string, candidate: string): boolean {
  const q = query.trim().toLowerCase();
  const c = candidate.trim().toLowerCase();

  if (!q) {
    return true;
  }

  let queryIndex = 0;

  for (let i = 0; i < c.length; i += 1) {
    if (c[i] === q[queryIndex]) {
      queryIndex += 1;
    }

    if (queryIndex === q.length) {
      return true;
    }
  }

  return false;
}
