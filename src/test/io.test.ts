// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import { parseArchitecture, exportCSV, exportJSON } from "../engine/io";
import { SAMPLE } from "../data/sample";
import { useWorkbench } from "../state/workbench";
describe("data interchange", () => {
  it("round trips nodes, edges, Unicode, CSV quoting and isolated nodes", () => {
    const g = structuredClone(SAMPLE);
    g.nodes.push({
      id: "isolated",
      label: 'A, "quoted" λ node',
      type: "Agent",
      x: 2,
      y: 3,
    });
    expect(parseArchitecture(exportJSON(g), "json")).toEqual(g);
    expect(parseArchitecture(exportCSV(g), "csv")).toEqual(g);
    expect(
      parseArchitecture(exportCSV({ nodes: [], edges: [] }), "csv"),
    ).toEqual({ nodes: [], edges: [] });
  });
  it("reads edge-list CSV and namespaced GraphML", () => {
    expect(
      parseArchitecture("source,target\na,b\nb,c", "csv").nodes,
    ).toHaveLength(3);
    const xml =
      '<graphml xmlns="http://graphml.graphdrawing.org/xmlns"><key id="label" for="node" attr.name="label" attr.type="string"/><graph edgedefault="undirected"><node id="a"><data key="label">Alpha</data></node><node id="b"/><edge source="a" target="b"/></graph></graphml>';
    const g = parseArchitecture(xml, "graphml");
    expect(g.nodes[0].label).toBe("Alpha");
    expect(g.edges).toEqual([{ source: "a", target: "b" }]);
    expect(() =>
      parseArchitecture(xml.replace("undirected", "directed"), "graphml"),
    ).toThrow(/undirected/);
    expect(() => parseArchitecture("<!DOCTYPE x>" + xml, "graphml")).toThrow(
      /entities/,
    );
  });
  it("rejects malformed and oversize imports", () => {
    expect(() => parseArchitecture("{", "json")).toThrow();
    expect(() => parseArchitecture("a,b\n1,2", "csv")).toThrow();
    expect(() => parseArchitecture("x".repeat(2_000_001), "json")).toThrow(
      /2 MB/,
    );
  });
});
describe("workspace state", () => {
  it("saves immutable snapshots, restores topology and rejects invalid edits atomically", () => {
    const store = useWorkbench.getState();
    store.replace(SAMPLE, "Test baseline");
    store.save("Immutable baseline");
    const saved = useWorkbench.getState().snapshots.at(-1)!;
    store.deleteNode("Core Executive");
    expect(saved.nodes).toHaveLength(12);
    const prior = useWorkbench.getState().graph;
    expect(() => store.addEdge("missing", "Core Executive")).toThrow();
    expect(useWorkbench.getState().graph).toBe(prior);
    store.restore(saved.id);
    expect(useWorkbench.getState().graph).toEqual(SAMPLE);
    store.setBaseline(saved.id);
    expect(() => store.removeSnapshot(saved.id)).toThrow(/baseline/);
    store.position("Core Executive", 123, 456);
    expect(useWorkbench.getState().graph.nodes[0].x).toBe(123);
    expect(saved.nodes[0].x).toBe(0);
    expect(
      JSON.parse(localStorage.getItem("max-sim-workbench-v2")!).state.graph
        .nodes[0].x,
    ).toBe(123);
  });
});

it("reports unavailable storage without recursively retrying forever", async () => {
  const write = vi
    .spyOn(Storage.prototype, "setItem")
    .mockImplementation(() => {
      throw new DOMException("Full", "QuotaExceededError");
    });
  try {
    useWorkbench.getState().setNotice("Check storage");
    await Promise.resolve();
    expect(useWorkbench.getState().notice).toContain(
      "storage is full or unavailable",
    );
    expect(write.mock.calls.length).toBeLessThanOrEqual(2);
  } finally {
    write.mockRestore();
  }
});

it("reloads edits and restores with maximum-length node and snapshot names", async () => {
  const store = useWorkbench.getState();
  const name = "N".repeat(100);
  store.replace(SAMPLE, "Long-name regression");
  store.addNode({ id: "long-name-node", label: name, type: "Agent" });
  store.save(name);
  const saved = useWorkbench.getState().snapshots.at(-1)!;
  store.deleteNode("long-name-node");
  store.restore(saved.id);
  const persisted = localStorage.getItem("max-sim-workbench-v2")!;
  useWorkbench.setState({ graph: structuredClone(SAMPLE) });
  localStorage.setItem("max-sim-workbench-v2", persisted);
  await useWorkbench.persist.rehydrate();
  expect(
    useWorkbench.getState().graph.nodes.some((n) => n.id === "long-name-node"),
  ).toBe(true);
  expect(useWorkbench.getState().snapshots.some((s) => s.id === saved.id)).toBe(
    true,
  );
});

it("preserves invalid saved data when notification cleanup persists state", async () => {
  const key = "max-sim-workbench-v2";
  useWorkbench.getState().replace(SAMPLE, "Recovery regression");
  const data = JSON.parse(localStorage.getItem(key)!);
  data.state.history[0].name = 42;
  const original = JSON.stringify(data);
  localStorage.setItem(key, original);
  await useWorkbench.persist.rehydrate();
  useWorkbench.getState().setNotice("");
  expect(localStorage.getItem(key) === original).toBe(true);
  expect(useWorkbench.getState().recovery?.raw).toBe(original);
});

it("preserves malformed JSON and only resumes writes after explicit replacement", async () => {
  const key = "max-sim-workbench-v2";
  const original = '{"state":';
  localStorage.setItem(key, original);
  await useWorkbench.persist.rehydrate();
  await Promise.resolve();
  useWorkbench.getState().replace(SAMPLE, "In-memory edit");
  useWorkbench.getState().setNotice("");
  expect(localStorage.getItem(key) === original).toBe(true);
  expect(useWorkbench.getState().recovery?.raw).toBe(original);
  useWorkbench.getState().replaceSavedWorkspace();
  expect(useWorkbench.getState().recovery).toBeNull();
  expect(JSON.parse(localStorage.getItem(key)!).state.graph).toEqual(SAMPLE);
});

it("neutralizes spreadsheet formulas while preserving exact text and legacy apostrophes", () => {
  const labels = [
    "=SUM(1,2)",
    "+cmd",
    "-formula",
    "@formula",
    "'=literal",
    "''literal",
    " =SUM(1)",
    "Ordinary",
  ];
  const graph = {
    nodes: labels.map((label, i) => ({
      id: i === 0 ? "=id" : `n${i}`,
      label,
      type: "Agent" as const,
      x: -20,
      y: 3,
    })),
    edges: [{ source: "=id", target: "n1" }],
  };
  const csv = exportCSV(graph);
  expect(csv).toContain("'=id");
  expect(csv).toContain("apostrophe-v1");
  expect(parseArchitecture(csv, "csv")).toEqual(graph);
  expect(
    parseArchitecture(
      "kind,id,label,type,x,y,source,target\nnode,a,'=literal,Agent,-20,3,,",
      "csv",
    ).nodes[0],
  ).toEqual({ id: "a", label: "'=literal", type: "Agent", x: -20, y: 3 });
});
