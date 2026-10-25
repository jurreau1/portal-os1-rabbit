import { useEffect, useRef, useState } from "react";
import { Panel } from "./UI";
import { fetchFeed } from "../engine/feeds";
import type { FeedItem, FeedKind } from "../engine/feeds";
import { useWorkbench } from "../state/workbench";
import { createId } from "../engine/id";
const defaults: Record<FeedKind, string> = {
  GitHub: "facebook/react",
  Research: "cognitive architecture",
  News: "artificial intelligence",
  Weather: "52.37,4.90",
  "Custom JSON": "",
};
export function IntelligenceFeed({ onTopology }: { onTopology: () => void }) {
  const [kind, setKind] = useState<FeedKind>("GitHub"),
    [query, setQuery] = useState(defaults.GitHub);
  const [items, setItems] = useState<FeedItem[]>([]),
    [knowledge, setKnowledge] = useState<FeedItem[]>([]);
  const [busy, setBusy] = useState(false),
    [status, setStatus] = useState(
      "Choose a source to fetch live observations.",
    );
  const controller = useRef<AbortController | null>(null);
  useEffect(() => () => controller.current?.abort(), []);
  async function load() {
    controller.current?.abort();
    const request = new AbortController();
    controller.current = request;
    setBusy(true);
    setItems([]);
    setStatus("Fetching source…");
    const timer = setTimeout(() => request.abort(), 15000);
    try {
      const result = await fetchFeed(kind, query, request.signal);
      if (controller.current === request) {
        setItems(result);
        setStatus(
          `${result.length} observations fetched. Review and pin them to the knowledge layer.`,
        );
      }
    } catch (e) {
      if (controller.current === request)
        setStatus(
          request.signal.aborted
            ? "Request timed out or was cancelled. Retry when ready."
            : `${e instanceof Error ? e.message : "Fetch failed."} Browser CORS or provider access policies may block this source.`,
        );
    } finally {
      clearTimeout(timer);
      if (controller.current === request) setBusy(false);
    }
  }
  const key = (item: FeedItem) => `${item.source}:${item.url || item.title}`;
  function model(item: FeedItem) {
    try {
      const store = useWorkbench.getState();
      store.addNode({
        id: createId(),
        label: item.title.slice(0, 100),
        type: "Cognition",
      });
      onTopology();
    } catch (e) {
      setStatus(e instanceof Error ? e.message : "Could not add observation.");
    }
  }
  return (
    <div className="page-stack">
      <Panel
        title="Intelligence feed"
        eyebrow="INTERNET → KNOWLEDGE → ARCHITECTURE"
      >
        <p className="note">
          Public sources are fetched on demand. News uses Hacker News; research
          uses OpenAlex; weather uses Open-Meteo. Custom JSON supports sports,
          market, financial, and other public APIs with browser CORS access. No
          private API keys are stored.
        </p>
        <form
          className="feed-controls"
          onSubmit={(e) => {
            e.preventDefault();
            void load();
          }}
        >
          <label>
            Source
            <select
              value={kind}
              disabled={busy}
              onChange={(e) => {
                const next = e.target.value as FeedKind;
                setKind(next);
                setQuery(defaults[next]);
                setItems([]);
              }}
            >
              {Object.keys(defaults).map((k) => (
                <option key={k}>{k}</option>
              ))}
            </select>
          </label>
          <label>
            Repository, search, coordinates, or HTTPS endpoint
            <input
              aria-label="Feed query"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              disabled={busy}
              required
              maxLength={2000}
            />
          </label>
          <button className="button primary" disabled={busy}>
            {busy ? "Fetching…" : "Fetch source"}
          </button>
        </form>
        <p role="status" className="note">
          {status}
        </p>
        <div className="feed-grid">
          {items.map((item, i) => (
            <article className="feed-card" key={i}>
              <span className="tag">{item.source}</span>
              <h3>{item.title}</h3>
              <p>{item.summary}</p>
              <small>Fetched {new Date(item.fetchedAt).toLocaleString()}</small>
              <div className="button-row">
                {item.url && (
                  <a href={item.url} target="_blank" rel="noopener noreferrer">
                    Open source ↗
                  </a>
                )}
                <button
                  className="button small"
                  disabled={
                    knowledge.some((k) => key(k) === key(item)) ||
                    knowledge.length >= 40
                  }
                  onClick={() => setKnowledge((k) => [...k, item])}
                >
                  Pin observation
                </button>
              </div>
            </article>
          ))}
        </div>
      </Panel>
      <Panel
        title="Knowledge layer"
        eyebrow={`${knowledge.length} PINNED OBSERVATIONS · SESSION ONLY`}
      >
        <p className="note">
          Pinned observations retain source and retrieval time in this session.
          “Model as subsystem” creates a labeled Cognition node; connect it to a
          subsystem to explore a scenario. This does not infer causality or
          automatically translate a feed into a validated simulation.
        </p>
        {!knowledge.length && (
          <p>Pin a result above to begin building context.</p>
        )}
        <div className="feed-grid">
          {knowledge.map((item) => (
            <article className="feed-card" key={key(item)}>
              <h3>{item.title}</h3>
              <p>{item.summary}</p>
              <small>
                {item.source} · {new Date(item.fetchedAt).toLocaleString()}
              </small>
              <div className="button-row">
                <button className="button" onClick={() => model(item)}>
                  Model as subsystem
                </button>
                <button
                  className="button"
                  onClick={() =>
                    setKnowledge((k) => k.filter((x) => key(x) !== key(item)))
                  }
                >
                  Unpin
                </button>
              </div>
            </article>
          ))}
        </div>
      </Panel>
    </div>
  );
}
