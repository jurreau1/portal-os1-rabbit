import type { Architecture, Metrics, SubsystemType } from "../types";
import { neighbors, removeNodes } from "./graph";
export function cascade(
  graph: Architecture,
  seeds: string[],
  threshold: number,
): string[][] {
  if (!(threshold > 0 && threshold <= 1))
    throw new Error("Failure threshold must be above zero and at most one.");
  const adj = neighbors(graph),
    failed = new Set(seeds.filter((id) => adj.has(id))),
    rounds: string[][] = [];
  if (!failed.size) return rounds;
  rounds.push([...failed]);
  while (true) {
    const next = graph.nodes
      .filter(
        (n) =>
          !failed.has(n.id) &&
          adj.get(n.id)!.size > 0 &&
          [...adj.get(n.id)!].filter((id) => failed.has(id)).length /
            adj.get(n.id)!.size >=
            threshold,
      )
      .map((n) => n.id);
    if (!next.length) break;
    rounds.push(next);
    next.forEach((id) => failed.add(id));
  }
  return rounds;
}
export const survivingGraph = (
  graph: Architecture,
  rounds: string[][],
  step: number,
) => removeNodes(graph, new Set(rounds.slice(0, step).flat()));

export type FailurePreset = "executive" | "memory" | "routing" | "agents";
export function presetSeeds(
  graph: Architecture,
  kind: FailurePreset,
  metrics: Metrics,
): string[] {
  const type: SubsystemType =
    kind === "executive"
      ? "Executive"
      : kind === "routing"
        ? "Infrastructure"
        : kind === "memory"
          ? "Memory"
          : "Agent";
  const candidates = graph.nodes.filter((n) => n.type === type);
  if (kind === "memory" || kind === "agents")
    return candidates.map((n) => n.id);
  // Preserve named sample scenarios, even when imported IDs are opaque.
  const label = kind === "executive" ? "Core Executive" : "Routing Proxy";
  const named = candidates.find((n) => n.label === label);
  if (named) return [named.id];
  const scores = kind === "executive" ? metrics.degree : metrics.betweenness;
  const first = candidates.sort(
    (a, b) =>
      (scores[b.id] ?? 0) - (scores[a.id] ?? 0) || a.id.localeCompare(b.id),
  )[0];
  return first ? [first.id] : [];
}
