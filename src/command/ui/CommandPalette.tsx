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
      { action: "open", target: "home", page: "home" as Page },
      { action: "open", target: "games", page: "games" as Page },
      { action: "open", target: "apps", page: "apps" as Page },
      { action: "open", target: "media", page: "media" as Page },
      { action: "open", target: "research", page: "research" as Page },
      { action: "world", target: "" },
      { action: "goto", target: "nexus" },
      { action: "goto", target: "games" },
      { action: "goto", target: "apps" },
      { action: "goto", target: "media" },
      { action: "goto", target: "research" },
      { action: "theme", target: "dark" },
      { action: "theme", target: "light" },
      { action: "theme", target: "neon" },
      { action: "theme", target: "cyber" },
      { action: "theme", target: "matrix" },
      { action: "help", target: "" },
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
                const target = parts[1]?.toLowerCase();

                if (action === "open" && target) {
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

                if (action === "theme" && target) {
                  onThemeChange(target);
                  onClose();
                  return;
                }

                if (action === "world") {
                  window.dispatchEvent(
                    new CustomEvent("maxverse:world", { detail: { enable: true } }),
                  );
                  onClose();
                  return;
                }

                if (action === "goto" && target) {
                  window.dispatchEvent(
                    new CustomEvent("maxverse:goto", { detail: { district: target } }),
                  );
                  onClose();
                  return;
                }

                if (action === "help") {
                  window.dispatchEvent(new CustomEvent("maxverse:help"));
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
                } else if (item.action === "world") {
                  window.dispatchEvent(
                    new CustomEvent("maxverse:world", { detail: { enable: true } }),
                  );
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
                  } else if (item.action === "world") {
                    window.dispatchEvent(
                      new CustomEvent("maxverse:world", { detail: { enable: true } }),
                    );
                  } else if (item.action === "goto" && item.target) {
                    window.dispatchEvent(
                      new CustomEvent("maxverse:goto", { detail: { district: item.target } }),
                    );
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
