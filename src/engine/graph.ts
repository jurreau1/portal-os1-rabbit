import { GROUPS } from "../types";
import type { Architecture, ArchitectureNode } from "../types";
export const MAX_NODES = 80;
export const edgeKey = (a: string, b: string) => JSON.stringify([a, b].sort());
export const copyGraph = (graph: Architecture): Architecture =>
  structuredClone({ nodes: graph.nodes, edges: graph.edges });
export function validateGraph(input: unknown): Architecture {
  if (!input || typeof input !== "object")
    throw new Error("Expected an architecture object.");
  const data = input as Record<string, unknown>;
  if (data.directed !== undefined && data.directed !== false)
    throw new Error("Only undirected architectures are supported.");
  if (!Array.isArray(data.nodes) || !Array.isArray(data.edges))
    throw new Error("Architecture must contain nodes and edges arrays.");
  if (data.nodes.length > MAX_NODES)
    throw new Error(`This workbench supports up to ${MAX_NODES} nodes.`);
  const ids = new Set<string>();
  const nodes: ArchitectureNode[] = data.nodes.map((raw: unknown) => {
    if (!raw || typeof raw !== "object")
      throw new Error("Every node must be an object.");
    const node = raw as Record<string, unknown>;
    if (
      typeof node.id !== "string" ||
      !node.id.trim() ||
      node.id.length > 100 ||
      ids.has(node.id)
    )
      throw new Error(
        "Node IDs must be unique, nonempty strings of at most 100 characters.",
      );
    ids.add(node.id);
    if (
      typeof node.label !== "string" ||
      !node.label.trim() ||
      node.label.length > 100
    )
      throw new Error("Node labels must have 1–100 characters.");
    if (!GROUPS.includes(node.type as ArchitectureNode["type"]))
      throw new Error(`Unknown subsystem type for ${node.id}.`);
    for (const coord of [node.x, node.y])
      if (
        coord !== undefined &&
        (typeof coord !== "number" ||
          !Number.isFinite(coord) ||
          Math.abs(coord) > 10000)
      )
        throw new Error("Node positions must be finite and within ±10000.");
    return {
      id: node.id,
      label: node.label,
      type: node.type as ArchitectureNode["type"],
      ...(node.x !== undefined ? { x: node.x as number } : {}),
      ...(node.y !== undefined ? { y: node.y as number } : {}),
    };
  });
  const seen = new Set<string>();
  const edges = data.edges.map((raw: unknown) => {
    if (!raw || typeof raw !== "object")
      throw new Error("Every edge must be an object.");
    const edge = raw as Record<string, unknown>;
    if (
      typeof edge.source !== "string" ||
      typeof edge.target !== "string" ||
      !ids.has(edge.source) ||
      !ids.has(edge.target)
    )
      throw new Error("Edges must reference existing node IDs.");
    if (
      edge.weight !== undefined &&
      (typeof edge.weight !== "number" || edge.weight !== 1)
    )
      throw new Error("Only unweighted edges are supported.");
    if (edge.directed !== undefined && edge.directed !== false)
      throw new Error("Directed edges are not supported.");
    if (edge.source === edge.target)
      throw new Error("Self loops are not supported.");
    const key = edgeKey(edge.source, edge.target);
    if (seen.has(key))
      throw new Error("Duplicate undirected edges are not supported.");
    seen.add(key);
    return { source: edge.source, target: edge.target };
  });
  return { nodes, edges };
}
export function neighbors(graph: Architecture): Map<string, Set<string>> {
  const result = new Map(graph.nodes.map((n) => [n.id, new Set<string>()]));
  graph.edges.forEach((e) => {
    result.get(e.source)!.add(e.target);
    result.get(e.target)!.add(e.source);
  });
  return result;
}
export function components(graph: Architecture): string[][] {
  const adjacent = neighbors(graph),
    seen = new Set<string>(),
    regions: string[][] = [];
  for (const node of graph.nodes) {
    if (seen.has(node.id)) continue;
    const region = [node.id];
    seen.add(node.id);
    for (let i = 0; i < region.length; i++)
      for (const next of adjacent.get(region[i])!)
        if (!seen.has(next)) {
          seen.add(next);
          region.push(next);
        }
    regions.push(region);
  }
  return regions;
}
export function removeNodes(
  graph: Architecture,
  ids: Set<string>,
): Architecture {
  return {
    nodes: graph.nodes.filter((n) => !ids.has(n.id)),
    edges: graph.edges.filter((e) => !ids.has(e.source) && !ids.has(e.target)),
  };
}
