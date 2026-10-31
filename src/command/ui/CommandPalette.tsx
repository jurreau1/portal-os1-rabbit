import { useEffect, useMemo, useState } from "react";

import { COMMANDS } from "../registry/commands";
import { fuzzyMatch } from "../engine/fuzzy";
import { parseCommand } from "../engine/parser";
import { executeCommand } from "../engine/executor";
import { getHistory, saveCommand } from "../engine/history";

export default function CommandPalette({
  open,
  onClose,
  navigate,
  setTheme,
  showHelp,
}: {
  open: boolean;
  onClose: () => void;
  navigate: (page: string) => void;
  setTheme: (theme: string) => void;
  showHelp: (topic?: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(0);
  const [error, setError] = useState("");

  const recent = getHistory();

  const results = useMemo(() => {
    if (!query) {
      return [];
    }

    const normalizedQuery = query.replace("/", "");

    return COMMANDS.filter((item) =>
      fuzzyMatch(normalizedQuery, `${item.action} ${item.target}`),
    );
  }, [query]);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const run = (command: string) => {
    const parsed = parseCommand(command);

    if (!parsed) {
      setError("Invalid command");
      return;
    }

    const result = executeCommand(parsed, navigate, setTheme, showHelp);

    if (!result.success) {
      setError(result.message);
      return;
    }

    saveCommand(command);
    setError("");
    setQuery("");
    onClose();
  };

  if (!open) {
    return null;
  }

  return (
    <div className="command-modal">
      <div className="command-box">
        <input
          autoFocus
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "ArrowDown") {
              setSelected((prev) => Math.min(prev + 1, Math.max(results.length - 1, 0)));
            }

            if (event.key === "ArrowUp") {
              setSelected((prev) => Math.max(prev - 1, 0));
            }

            if (event.key === "Enter") {
              if (results.length > 0) {
                const item = results[selected];
                run(`/${item.action} ${item.target}`);
              } else {
                run(query);
              }
            }
          }}
          placeholder="Type a command..."
        />

        {error && <div className="command-error">{error}</div>}

        {!query && recent.length > 0 && (
          <div>
            <h4>Recent</h4>
            {recent.map((item) => (
              <button key={item} onClick={() => run(item)}>
                {item}
              </button>
            ))}
          </div>
        )}

        {results.map((item, index) => (
          <button
            key={`${item.action}-${item.target}`}
            className={selected === index ? "selected" : ""}
            onClick={() => run(`/${item.action} ${item.target}`)}
          >
            /{item.action} {item.target}
          </button>
        ))}
      </div>
    </div>
  );
}
