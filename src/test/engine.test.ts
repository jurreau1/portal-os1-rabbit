import { describe, it, expect } from "vitest";
import type { Architecture } from "../types";
import { StructuralInvariant, compare } from "../engine/metrics";
import { validateGraph, removeNodes } from "../engine/graph";
import { cascade, survivingGraph, presetSeeds } from "../engine/failure";
import { integrate, derivative } from "../engine/research";
import { SAMPLE } from "../data/sample";
const graph = (n: number, edges: [number, number][]): Architecture => ({
  nodes: Array.from({ length: n }, (_, i) => ({
    id: String(i),
    label: `Node ${i}`,
    type: "Executive",
  })),
  edges: edges.map(([a, b]) => ({ source: String(a), target: String(b) })),
});
describe("spectral contracts", () => {
  it("matches the analytic path spectrum, eigenvectors, centrality and entropy", () => {
    const g = graph(3, [
        [0, 1],
        [1, 2],
      ]),
      engine = new StructuralInvariant(g),
      m = engine.metrics;
    [0, 1, 3].forEach((v, i) => expect(m.eigenvalues[i]).toBeCloseTo(v, 10));
    expect(m.identity).toBeCloseTo(4, 10);
    expect(m.connectivity).toBeCloseTo(1, 10);
    expect(m.radius).toBeCloseTo(Math.sqrt(2), 10);
    expect(m.entropy).toBeCloseTo(
      -0.25 * Math.log2(0.25) - 0.75 * Math.log2(0.75),
      10,
    );
    expect(m.betweenness["1"]).toBeCloseTo(1, 10);
    expect(m.betweenness["0"]).toBe(0);
    expect(m.centrality["1"]).toBe(1);
    expect(m.diameter).toBe(2);
    for (let k = 0; k < 3; k++)
      for (let row = 0; row < 3; row++)
        expect(
          m.laplacian[row].reduce((s, v, j) => s + v * m.eigenvectors[j][k], 0),
        ).toBeCloseTo(m.eigenvalues[k] * m.eigenvectors[row][k], 10);
  });
  it("preserves the original six-node MAX-SIM contract", () => {
    const m = new StructuralInvariant(
      graph(6, [
        [0, 1],
        [0, 2],
        [0, 3],
        [1, 4],
        [1, 5],
        [2, 3],
        [4, 5],
      ]),
    ).metrics;
    expect(m.identity).toBeCloseTo(14, 10);
    expect(m.connectivity).toBeCloseTo((5 - Math.sqrt(17)) / 2, 10);
  });
  it("handles empty, singleton, disconnected and zero-source comparisons", () => {
    for (const n of [0, 1, 4]) {
      const e = new StructuralInvariant(graph(n, []));
      expect(e.identity_invariant()).toBe(0);
      expect(e.metrics.entropy).toBe(0);
      expect(e.metrics.connectivity).toBe(0);
      expect(e.structural_fidelity(e)).toBeNull();
    }
    const m = new StructuralInvariant(
      graph(4, [
        [0, 1],
        [2, 3],
      ]),
    ).metrics;
    expect(m.components).toHaveLength(2);
    expect(m.diameter).toBeNull();
    expect(m.connectivity).toBe(0);
  });
  it("is invariant under label permutation and follows trace and handshake identities", () => {
    const a = new StructuralInvariant(SAMPLE),
      permuted = {
        nodes: [...SAMPLE.nodes].reverse(),
        edges: [...SAMPLE.edges].reverse(),
      },
      b = new StructuralInvariant(permuted);
    a.laplacian_spectrum().forEach((v, i) =>
      expect(b.laplacian_spectrum()[i]).toBeCloseTo(v, 9),
    );
    expect(a.identity_invariant()).toBeCloseTo(2 * SAMPLE.edges.length, 9);
    expect(a.metrics.eigenvalues.reduce((s, v) => s + v * v, 0)).toBeCloseTo(
      Object.values(a.metrics.degree).reduce((s, d) => s + d * d + d, 0),
      8,
    );
  });
  it("keeps signed drift and entropy loss with unbounded fidelity ratios", () => {
    const a = graph(3, [[0, 1]]),
      b = graph(3, [
        [0, 1],
        [1, 2],
      ]),
      r = compare(a, b);
    expect(r.drift).toBeCloseTo(2);
    expect(r.fidelity).toBeCloseTo(2);
    expect(r.loss).toBeLessThan(0);
    expect(r.destroyed).toBe(0);
    expect(r.gained).toBeGreaterThan(0);
    expect(r.preservation).toBeCloseTo(0.5);
  });
});
describe("graph integrity and cascades", () => {
  it("rejects dangling, duplicate, directed-like self edges and duplicate IDs", () => {
    expect(() => validateGraph(graph(2, [[0, 2]]))).toThrow(/existing/);
    expect(() =>
      validateGraph(
        graph(2, [
          [0, 1],
          [1, 0],
        ]),
      ),
    ).toThrow(/Duplicate/);
    expect(() => validateGraph(graph(1, [[0, 0]]))).toThrow(/Self/);
    const g = graph(2, []);
    g.nodes[1].id = "0";
    expect(() => validateGraph(g)).toThrow(/unique/);
    expect(() => validateGraph(graph(81, []))).toThrow(/80/);
  });
  it("propagates in synchronous rounds and excludes unrelated isolated nodes", () => {
    const g = graph(4, [
        [0, 1],
        [1, 2],
      ]),
      before = JSON.stringify(g);
    expect(cascade(g, ["0"], 0.5)).toEqual([["0"], ["1"], ["2"]]);
    expect(cascade(g, ["0"], 1)).toEqual([["0"]]);
    expect(survivingGraph(g, cascade(g, ["0"], 0.5), 2)).toEqual({
      nodes: g.nodes.slice(2),
      edges: [],
    });
    expect(JSON.stringify(g)).toBe(before);
    expect(cascade(g, [], 0.5)).toEqual([]);
    expect(() => cascade(g, ["0"], 0)).toThrow();
  });
  it("removes incident edges atomically", () => {
    const result = removeNodes(SAMPLE, new Set(["Core Executive"]));
    expect(result.nodes).toHaveLength(11);
    expect(
      result.edges.every(
        (e) => e.source !== "Core Executive" && e.target !== "Core Executive",
      ),
    ).toBe(true);
  });
});
describe("research equation", () => {
  it("uses the declared signed vector fields and dt", () => {
    expect(derivative([10, 0.5, 2, 0.25, -1], [0.2, 0.4, 0.6, 0.8])).toEqual([
      -0.6000000000000001, -0.3, 0.4, 0.1, -0.8,
    ]);
    const next = integrate([10, 0.5, 2, 0.25, -1], [0.2, 0.4, 0.6, 0.8]);
    [9.94, 0.47, 2.04, 0.26, -1.08].forEach((v, i) =>
      expect(next[i]).toBeCloseTo(v, 10),
    );
  });
});

it("resolves named failure presets through labels when IDs are opaque", () => {
  const ids = new Map(SAMPLE.nodes.map((n, i) => [n.id, `opaque-${i}`]));
  const g: Architecture = {
    nodes: SAMPLE.nodes.map((n) => ({ ...n, id: ids.get(n.id)! })),
    edges: SAMPLE.edges.map((e) => ({
      source: ids.get(e.source)!,
      target: ids.get(e.target)!,
    })),
  };
  const metrics = new StructuralInvariant(g).metrics;
  expect(presetSeeds(g, "executive", metrics)).toEqual(["opaque-0"]);
  expect(presetSeeds(g, "routing", metrics)).toEqual(["opaque-5"]);
  expect(presetSeeds(g, "memory", metrics)).toHaveLength(3);
  expect(presetSeeds(g, "agents", metrics)).toHaveLength(3);
});
it("uses topology-based fallback presets and handles absent types", () => {
  const g = graph(3, [
    [0, 1],
    [1, 2],
  ]);
  const metrics = new StructuralInvariant(g).metrics;
  expect(presetSeeds(g, "executive", metrics)).toEqual(["1"]);
  expect(presetSeeds(g, "routing", metrics)).toEqual([]);
  g.nodes.forEach((n) => {
    n.type = "Infrastructure";
  });
  expect(presetSeeds(g, "routing", metrics)).toEqual(["1"]);
});
