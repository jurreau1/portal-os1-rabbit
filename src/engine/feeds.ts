export type FeedKind =
  "GitHub" | "Research" | "News" | "Weather" | "Custom JSON";
export interface FeedItem {
  title: string;
  summary: string;
  url?: string;
  source: string;
  fetchedAt: string;
}
export function httpsURL(value: string): string {
  const url = new URL(value);
  if (url.protocol !== "https:" || url.username || url.password)
    throw new Error("Use a public HTTPS URL without credentials.");
  return url.href;
}
export function feedURL(kind: FeedKind, query: string) {
  if (kind === "GitHub") {
    if (!/^[\w.-]+\/[\w.-]+$/.test(query))
      throw new Error("Enter owner/repository, for example facebook/react.");
    return `https://api.github.com/repos/${query}`;
  }
  if (kind === "Research")
    return `https://api.openalex.org/works?search=${encodeURIComponent(query)}&per-page=10`;
  if (kind === "News")
    return `https://hn.algolia.com/api/v1/search_by_date?query=${encodeURIComponent(query)}&tags=story&hitsPerPage=10`;
  if (kind === "Weather") {
    const parts = query.split(",").map((s) => s.trim());
    const [lat, lon] = parts.map(Number);
    if (
      parts.length !== 2 ||
      parts.some((s) => !s) ||
      !Number.isFinite(lat) ||
      !Number.isFinite(lon) ||
      Math.abs(lat) > 90 ||
      Math.abs(lon) > 180
    )
      throw new Error("Enter latitude,longitude within geographic bounds.");
    return `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,wind_speed_10m`;
  }
  return httpsURL(query);
}
const obj = (v: unknown): Record<string, unknown> =>
  v && typeof v === "object" && !Array.isArray(v)
    ? (v as Record<string, unknown>)
    : {};
const str = (v: unknown) =>
  typeof v === "string" || typeof v === "number"
    ? String(v).slice(0, 1000)
    : "";
const link = (v: unknown) => {
  try {
    return httpsURL(str(v));
  } catch {
    return undefined;
  }
};
export function normalizeFeed(
  kind: FeedKind,
  data: unknown,
  fetchedAt: string,
): FeedItem[] {
  const root = obj(data);
  const item = (title: unknown, summary: unknown, url?: unknown): FeedItem => ({
    title: str(title).slice(0, 100) || "Untitled observation",
    summary: str(summary),
    url: link(url),
    source: kind,
    fetchedAt,
  });
  if (kind === "GitHub") {
    if (!root.full_name) throw new Error("Invalid GitHub repository response.");
    return [
      item(
        root.full_name,
        `${str(root.description)} · ${str(root.stargazers_count)} stars · ${str(root.open_issues_count)} open issues · last push ${str(root.pushed_at)}`,
        root.html_url,
      ),
    ];
  }
  if (kind === "Weather") {
    const current = obj(root.current),
      units = obj(root.current_units);
    if (typeof current.temperature_2m !== "number")
      throw new Error("Invalid weather response.");
    return [
      item(
        `Weather at ${str(root.latitude)}, ${str(root.longitude)}`,
        `${current.temperature_2m} ${str(units.temperature_2m)} · wind ${str(current.wind_speed_10m)} ${str(units.wind_speed_10m)} · observed ${str(current.time)}`,
      ),
    ];
  }
  const rows =
    kind === "Research"
      ? root.results
      : kind === "News"
        ? root.hits
        : Array.isArray(data)
          ? data
          : root.items;
  if (!Array.isArray(rows))
    throw new Error(
      "Expected a list of results; custom JSON requires an array or {items: [...]}.",
    );
  return rows.slice(0, 20).map((row) => {
    const r = obj(row);
    if (kind === "Research")
      return item(
        r.display_name,
        `Published ${str(r.publication_date)} · ${str(r.cited_by_count)} citations`,
        r.doi || r.id,
      );
    if (kind === "News")
      return item(r.title, `By ${str(r.author)} · ${str(r.created_at)}`, r.url);
    return item(r.title || r.name, r.summary || r.description, r.url);
  });
}
export async function fetchFeed(
  kind: FeedKind,
  query: string,
  signal: AbortSignal,
): Promise<FeedItem[]> {
  const response = await fetch(feedURL(kind, query.trim()), {
    signal,
    credentials: "omit",
    referrerPolicy: "no-referrer",
    headers: { Accept: "application/json" },
  });
  if (!response.ok)
    throw new Error(
      `Provider returned HTTP ${response.status}. Check the source or retry later.`,
    );
  const reader = response.body?.getReader();
  if (!reader) throw new Error("No response body received.");
  let text = "",
    size = 0;
  const decoder = new TextDecoder();
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > 2_000_000) throw new Error("Feed response exceeds 2 MB.");
      text += decoder.decode(value, { stream: true });
    }
    text += decoder.decode();
  } finally {
    await reader.cancel();
  }
  return normalizeFeed(kind, JSON.parse(text), new Date().toISOString());
}
export function youtubeEmbed(raw: string): string | null {
  const url = new URL(httpsURL(raw));
  let id = "";
  if (url.hostname === "youtu.be") id = url.pathname.slice(1);
  else if (
    ["youtube.com", "www.youtube.com", "m.youtube.com"].includes(url.hostname)
  )
    id =
      url.pathname === "/watch"
        ? url.searchParams.get("v") || ""
        : url.pathname.match(/^\/(?:embed|shorts)\/([^/]+)$/)?.[1] || "";
  else return null;
  if (!/^[\w-]{11}$/.test(id))
    throw new Error("Use a valid YouTube video link.");
  return `https://www.youtube-nocookie.com/embed/${id}`;
}
