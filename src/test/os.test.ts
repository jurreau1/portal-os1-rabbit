import { describe, expect, it } from "vitest";
import { interpret } from "../engine/commands";
import {
  feedURL,
  normalizeFeed,
  youtubeEmbed,
  httpsURL,
  fetchFeed,
} from "../engine/feeds";
import { SAMPLE } from "../data/sample";
import { vi } from "vitest";
describe("workspace commands", () => {
  it("resolves real labels and refuses ambiguous or missing targets", () => {
    expect(interpret("Create Memory Cluster", SAMPLE, [], null)).toMatchObject({
      kind: "add",
      type: "Memory",
    });
    expect(
      interpret("Connect Agent Cluster A to World Model", SAMPLE, [], null),
    ).toMatchObject({ kind: "connect", target: "World Model" });
    expect(() =>
      interpret("Connect Agent A to World Model", SAMPLE, [], null),
    ).toThrow("not found");
    expect(() => interpret("Create World Model", SAMPLE, [], null)).toThrow(
      "already exists",
    );
    const ambiguous = {
      ...SAMPLE,
      nodes: [
        ...SAMPLE.nodes,
        { id: "duplicate", label: "World Model", type: "Cognition" as const },
      ],
    };
    expect(() =>
      interpret("Connect Agent Cluster A to World Model", ambiguous, [], null),
    ).toThrow("Multiple");
  });
  it("uses selected seeds, reports identity and compares exact snapshot names", () => {
    expect(
      interpret("Simulate failure cascade", SAMPLE, [], "Core Executive"),
    ).toEqual({ kind: "failure", seeds: ["Core Executive"] });
    expect(() => interpret("Run failure simulation", SAMPLE, [], null)).toThrow(
      "Select",
    );
    expect(
      interpret("Compute Identity Invariant", SAMPLE, [], null),
    ).toMatchObject({ text: expect.stringContaining("48.0000") });
    const snapshots = ["v12", "v18"].map((name) => ({
      ...SAMPLE,
      id: name,
      name,
      timestamp: new Date().toISOString(),
    }));
    expect(
      interpret("Compare Snapshot v12 vs v18", SAMPLE, snapshots, null),
    ).toMatchObject({ text: expect.stringContaining("fidelity 1.000") });
    expect(() => interpret("delete everything", SAMPLE, [], null)).toThrow(
      "Supported",
    );
  });
});
describe("feed and media boundaries", () => {
  it("validates endpoint inputs and permits only HTTPS links without credentials", () => {
    expect(feedURL("GitHub", "facebook/react")).toBe(
      "https://api.github.com/repos/facebook/react",
    );
    expect(() => feedURL("GitHub", "../bad/path")).toThrow();
    expect(() => feedURL("Weather", ",")).toThrow();
    expect(() => feedURL("Weather", "91,0")).toThrow();
    expect(() => httpsURL("javascript:alert(1)")).toThrow();
    expect(() => httpsURL("https://user:pass@example.com")).toThrow();
    expect(youtubeEmbed("https://youtu.be/dQw4w9WgXcQ")).toBe(
      "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ",
    );
    expect(
      youtubeEmbed("https://youtube.com.evil.test/watch?v=dQw4w9WgXcQ"),
    ).toBeNull();
  });
  it("normalizes provenance and removes unsafe source links", () => {
    const rows = normalizeFeed(
      "Custom JSON",
      {
        items: [
          {
            title: "Observation",
            summary: "Sample",
            url: "javascript:alert(1)",
          },
        ],
      },
      "2026-10-25",
    );
    expect(rows[0]).toEqual({
      title: "Observation",
      summary: "Sample",
      url: undefined,
      source: "Custom JSON",
      fetchedAt: "2026-10-25",
    });
    expect(() => normalizeFeed("Research", {}, "")).toThrow();
    expect(normalizeFeed("News", { hits: [] }, "")).toEqual([]);
  });
  it("fetches bounded JSON and surfaces provider failures", async () => {
    const mock = vi.spyOn(globalThis, "fetch");
    try {
      mock.mockResolvedValueOnce(
        new Response(JSON.stringify([{ title: "Game" }])),
      );
      expect(
        await fetchFeed(
          "Custom JSON",
          "https://example.com/feed",
          new AbortController().signal,
        ),
      ).toHaveLength(1);
      mock.mockResolvedValueOnce(new Response("Denied", { status: 429 }));
      await expect(
        fetchFeed("GitHub", "facebook/react", new AbortController().signal),
      ).rejects.toThrow("429");
      mock.mockResolvedValueOnce(new Response(" ".repeat(2_000_001)));
      await expect(
        fetchFeed(
          "Custom JSON",
          "https://example.com/feed",
          new AbortController().signal,
        ),
      ).rejects.toThrow("2 MB");
    } finally {
      mock.mockRestore();
    }
  });
});
