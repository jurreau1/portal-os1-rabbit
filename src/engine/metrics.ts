import { Matrix, EigenvalueDecomposition } from "ml-matrix";
import type { Architecture, Metrics } from "../types";
import { components, neighbors } from "./graph";
const clean = (value: number) => (Math.abs(value) < 1e-10 ? 0 : value);
export function symmetricSpectrum(matrix: number[][]) {
  if (!matrix.length)
    return { values: [] as number[], vectors: [] as number[][] };
  const evd = new EigenvalueDecomposition(new Matrix(matrix), {
    assumeSymmetric: true,
  });
  const order = evd.realEigenvalues
    .map((v, i) => ({ v: clean(v), i }))
    .sort((a, b) => a.v - b.v);
  return {
    values: order.map((x) => x.v),
    vectors: matrix.map((_, row) =>
      order.map((x) => evd.eigenvectorMatrix.get(row, x.i)),
    ),
  };
}
// Brandes' exact betweenness algorithm, normalized for an undirected graph.
function betweenness(graph: Architecture, adj: Map<string, Set<string>>) {
  const scores: Record<string, number> = Object.fromEntries(
    graph.nodes.map((n) => [n.id, 0]),
  );
  for (const { id: source } of graph.nodes) {
    const stack: string[] = [],
      queue = [source];
    const parents = new Map(graph.nodes.map((n) => [n.id, [] as string[]]));
    const sigma = new Map(
      graph.nodes.map((n) => [n.id, n.id === source ? 1 : 0]),
    );
    const dist = new Map(
      graph.nodes.map((n) => [n.id, n.id === source ? 0 : -1]),
    );
    for (let q = 0; q < queue.length; q++) {
      const v = queue[q];
      stack.push(v);
      for (const w of adj.get(v)!) {
        if (dist.get(w)! < 0) {
          queue.push(w);
          dist.set(w, dist.get(v)! + 1);
        }
        if (dist.get(w) === dist.get(v)! + 1) {
          sigma.set(w, sigma.get(w)! + sigma.get(v)!);
          parents.get(w)!.push(v);
        }
      }
    }
    const delta = new Map(graph.nodes.map((n) => [n.id, 0]));
    for (const w of stack.reverse()) {
      for (const v of parents.get(w)!)
        delta.set(
          v,
          delta.get(v)! + (sigma.get(v)! / sigma.get(w)!) * (1 + delta.get(w)!),
        );
      if (w !== source) scores[w] += delta.get(w)!;
    }
  }
  const n = graph.nodes.length,
    scale = n > 2 ? 1 / ((n - 1) * (n - 2)) : 0;
  return Object.fromEntries(
    Object.entries(scores).map(([k, v]) => [k, v * scale]),
  );
}
export class StructuralInvariant {
  readonly metrics: Metrics;
  constructor(public graph: Architecture) {
    const n = graph.nodes.length,
      adj = neighbors(graph),
      index = new Map(graph.nodes.map((node, i) => [node.id, i]));
    const adjacency = Array.from(
      { length: n },
      () => Array(n).fill(0) as number[],
    );
    graph.edges.forEach((e) => {
      const i = index.get(e.source)!,
        j = index.get(e.target)!;
      adjacency[i][j] = adjacency[j][i] = 1;
    });
    const degree = Object.fromEntries(
      [...adj].map(([id, next]) => [id, next.size]),
    );
    const laplacian = adjacency.map((row, i) =>
      row.map((v, j) => (i === j ? degree[graph.nodes[i].id] : -v)),
    );
    const spectrum = symmetricSpectrum(laplacian),
      identity = spectrum.values
        .filter((v) => v > 1e-8)
        .reduce((a, b) => a + b, 0);
    const entropy = identity
      ? -spectrum.values
          .filter((v) => v > 1e-8)
          .reduce((sum, v) => sum + (v / identity) * Math.log2(v / identity), 0)
      : 0;
    let clustering = 0;
    for (const next of adj.values()) {
      const members = [...next],
        k = members.length;
      if (k < 2) continue;
      let links = 0;
      for (let a = 0; a < k; a++)
        for (let b = a + 1; b < k; b++)
          if (adj.get(members[a])!.has(members[b])) links++;
      clustering += (2 * links) / (k * (k - 1));
    }
    const regions = components(graph);
    let diameter: number | null = n && regions.length === 1 ? 0 : null;
    if (diameter !== null)
      for (const node of graph.nodes) {
        const distances = new Map([[node.id, 0]]),
          queue = [node.id];
        for (let i = 0; i < queue.length; i++)
          for (const next of adj.get(queue[i])!)
            if (!distances.has(next)) {
              distances.set(next, distances.get(queue[i])! + 1);
              queue.push(next);
            }
        diameter = Math.max(diameter, ...distances.values());
      }
    this.metrics = {
      identity,
      entropy,
      adjacency,
      laplacian,
      eigenvalues: spectrum.values,
      eigenvectors: spectrum.vectors,
      connectivity:
        n < 2 || regions.length !== 1 ? 0 : Math.max(0, spectrum.values[1]),
      radius: Math.max(0, ...symmetricSpectrum(adjacency).values.map(Math.abs)),
      degree,
      centrality: Object.fromEntries(
        Object.entries(degree).map(([id, d]) => [id, n > 1 ? d / (n - 1) : 0]),
      ),
      betweenness: betweenness(graph, adj),
      density: n > 1 ? (2 * graph.edges.length) / (n * (n - 1)) : 0,
      diameter,
      clustering: n ? clustering / n : 0,
      components: regions,
      signature: spectrum.values.map((v) => v.toFixed(3)).join(" · "),
    };
  }
  laplacian_spectrum() {
    return this.metrics.eigenvalues;
  }
  identity_invariant() {
    return this.metrics.identity;
  }
  translation_loss(target: StructuralInvariant) {
    return this.metrics.entropy - target.metrics.entropy;
  }
  structural_fidelity(target: StructuralInvariant) {
    return this.metrics.identity > 1e-8
      ? target.metrics.identity / this.metrics.identity
      : null;
  }
  structural_drift(target: StructuralInvariant) {
    return target.metrics.identity - this.metrics.identity;
  }
}
export function compare(source: Architecture, target: Architecture) {
  const a = new StructuralInvariant(source),
    b = new StructuralInvariant(target);
  const max = Math.max(a.metrics.identity, b.metrics.identity);
  const loss = a.translation_loss(b);
  return {
    loss,
    fidelity: a.structural_fidelity(b),
    drift: a.structural_drift(b),
    preserved: Math.min(a.metrics.entropy, b.metrics.entropy),
    destroyed: Math.max(0, loss),
    gained: Math.max(0, -loss),
    preservation:
      max > 1e-8 ? Math.min(a.metrics.identity, b.metrics.identity) / max : 1,
    a: a.metrics,
    b: b.metrics,
  };
}
