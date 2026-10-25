import type { Architecture, Snapshot, SubsystemType } from "../types";
import { StructuralInvariant, compare } from "./metrics";
export type Command =
  | { kind: "add"; label: string; type: SubsystemType }
  | { kind: "connect"; source: string; target: string }
  | { kind: "failure"; seeds: string[] }
  | { kind: "save"; name: string }
  | { kind: "reply"; text: string };
const clean = (s: string) => s.trim().replace(/^"(.*)"$/, "$1");
export function interpret(
  input: string,
  graph: Architecture,
  snapshots: Snapshot[],
  selected: string | null,
): Command {
  const text = input.trim();
  const resolve = (name: string) => {
    const matches = graph.nodes.filter(
      (n) => n.label.toLowerCase() === clean(name).toLowerCase(),
    );
    if (matches.length !== 1)
      throw new Error(
        matches.length
          ? `Multiple subsystems named ${name}. Rename them before using this command.`
          : `Subsystem “${name}” was not found. Use its full label.`,
      );
    return matches[0].id;
  };
  let match: RegExpMatchArray | null;
  if ((match = text.match(/^(?:create|add)\s+(.+)$/i))) {
    const label = clean(match[1]);
    if (!label || label.length > 100)
      throw new Error("Use a name between 1 and 100 characters.");
    if (graph.nodes.some((n) => n.label.toLowerCase() === label.toLowerCase()))
      throw new Error("That subsystem already exists.");
    const type: SubsystemType = /memory/i.test(label)
      ? "Memory"
      : /agent/i.test(label)
        ? "Agent"
        : /executive/i.test(label)
          ? "Executive"
          : /planning|world|cognition/i.test(label)
            ? "Cognition"
            : "Infrastructure";
    return { kind: "add", label, type };
  }
  if ((match = text.match(/^connect\s+(.+?)\s+to\s+(.+)$/i)))
    return {
      kind: "connect",
      source: resolve(match[1]),
      target: resolve(match[2]),
    };
  if (
    /^(?:compute|calculate|show)\s+(?:the\s+)?identity(?: invariant)?$/i.test(
      text,
    )
  )
    return {
      kind: "reply",
      text: `Identity I(S) = ${new StructuralInvariant(graph).identity_invariant().toFixed(4)}. Sum of positive Laplacian eigenvalues; ${graph.nodes.length} nodes, ${graph.edges.length} edges.`,
    };
  if (
    (match = text.match(
      /^(?:run|simulate)\s+failure(?: cascade| simulation)?(?:\s+(?:on|for)\s+(.+))?$/i,
    ))
  ) {
    const id = match[1] ? resolve(match[1]) : selected;
    if (!id || !graph.nodes.some((n) => n.id === id))
      throw new Error(
        "Select a node first, or use “Run failure simulation on Core Executive”.",
      );
    return { kind: "failure", seeds: [id] };
  }
  if ((match = text.match(/^save snapshot\s+(.+)$/i)))
    return { kind: "save", name: clean(match[1]) };
  if ((match = text.match(/^compare\s+(?:snapshot\s+)?(.+?)\s+vs\s+(.+)$/i))) {
    const get = (name: string) => {
      const found = snapshots.filter(
        (s) => s.name.toLowerCase() === clean(name).toLowerCase(),
      );
      if (found.length !== 1)
        throw new Error(
          `Snapshot “${name}” must match exactly one saved name.`,
        );
      return found[0];
    };
    const result = compare(get(match[1]), get(match[2]));
    return {
      kind: "reply",
      text: `Snapshot comparison: drift ${result.drift.toFixed(3)} · fidelity ${result.fidelity === null ? "N/A" : result.fidelity.toFixed(3)} · translation loss ${result.loss.toFixed(3)} bits.`,
    };
  }
  throw new Error(
    "Supported commands: Create <name>; Connect <source> to <target>; Compute Identity Invariant; Run failure simulation on <name>; Save snapshot <name>; Compare snapshot <name> vs <name>.",
  );
}
