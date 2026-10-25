import { useEffect, useMemo, useRef, useState, useId } from "react";
import {
  forceSimulation,
  forceLink,
  forceManyBody,
  forceCenter,
  forceCollide,
  select,
  zoom,
  zoomIdentity,
} from "d3";
import type {
  SimulationNodeDatum,
  SimulationLinkDatum,
  Simulation,
  ZoomBehavior,
  ZoomTransform,
} from "d3";
import { Crosshair, Minus, Plus, Move, Maximize2 } from "lucide-react";
import type {
  Architecture,
  ArchitectureNode,
  Metrics,
  SubsystemType,
} from "../types";
import { COLORS, GROUPS } from "../types";
import { edgeKey } from "../engine/graph";
interface ViewNode extends SimulationNodeDatum {
  id: string;
  label: string;
  type: SubsystemType;
  count: number;
  cluster?: boolean;
}
interface ViewLink extends SimulationLinkDatum<ViewNode> {
  source: string | ViewNode;
  target: string | ViewNode;
}
interface Props {
  graph: Architecture;
  layoutKey?: string;
  metrics: Metrics;
  selected: string | null;
  onSelect: (id: string) => void;
  onPosition?: (id: string, x: number, y: number) => void;
  failed?: Set<string>;
  regions?: string[][];
  readOnly?: boolean;
  connectSource?: string | null;
  svgRef?: React.RefObject<SVGSVGElement | null>;
}
export function GraphView({
  graph,
  layoutKey,
  metrics,
  selected,
  onSelect,
  onPosition,
  failed,
  regions,
  readOnly,
  connectSource,
  svgRef,
}: Props) {
  const ownRef = useRef<SVGSVGElement>(null),
    ref = svgRef ?? ownRef;
  const simulation = useRef<Simulation<ViewNode, ViewLink> | null>(null),
    zoomer = useRef<ZoomBehavior<SVGSVGElement, unknown> | null>(null);
  const transform = useRef<ZoomTransform>(zoomIdentity),
    dragging = useRef<{
      id: string;
      x: number;
      y: number;
      moved: boolean;
    } | null>(null);
  const [physics, setPhysics] = useState(true),
    [heatmap, setHeatmap] = useState(false),
    [labels, setLabels] = useState(true);
  const [collapsed, setCollapsed] = useState<SubsystemType[]>([]),
    [positions, setPositions] = useState<ViewNode[]>([]),
    [links, setLinks] = useState<ViewLink[]>([]),
    [view, setView] = useState("translate(0,0) scale(1)");
  const gridId = useId().replace(/:/g, "");
  const structure = JSON.stringify({
    nodes: graph.nodes.map(({ id, label, type }) => ({ id, label, type })),
    edges: graph.edges,
  });
  const drawing = useMemo(() => {
    const map = new Map<string, string>(),
      nodes: ViewNode[] = [];
    for (const type of GROUPS) {
      const members = graph.nodes.filter((n) => n.type === type);
      if (collapsed.includes(type) && members.length) {
        let id = `__cluster__${type}`;
        while (graph.nodes.some((n) => n.id === id)) id = `_${id}`;
        members.forEach((n) => map.set(n.id, id));
        nodes.push({
          id,
          cluster: true,
          label: `${type} cluster`,
          type,
          count: members.length,
          x: 450 + members.reduce((s, n) => s + (n.x ?? 0), 0) / members.length,
          y: 270 + members.reduce((s, n) => s + (n.y ?? 0), 0) / members.length,
        });
      } else
        members.forEach((n) => {
          map.set(n.id, n.id);
          const angle = nodes.length * 2.399963;
          nodes.push({
            ...n,
            count: 1,
            x: n.x === undefined ? 450 + 60 * Math.cos(angle) : n.x + 450,
            y: n.y === undefined ? 270 + 60 * Math.sin(angle) : n.y + 270,
          });
        });
    }
    const seen = new Set<string>(),
      edges: ViewLink[] = [];
    for (const edge of graph.edges) {
      const source = map.get(edge.source)!,
        target = map.get(edge.target)!,
        key = edgeKey(source, target);
      if (source !== target && !seen.has(key)) {
        seen.add(key);
        edges.push({ source, target });
      }
    }
    return { nodes, edges };
    // Positions are deliberately excluded: persisting a drag must not restart layout.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [structure, collapsed, layoutKey]);
  useEffect(() => {
    const nodes = drawing.nodes.map((n) => ({ ...n })),
      edges = drawing.edges.map((e) => ({ ...e }));
    const sim = forceSimulation<ViewNode>(nodes)
      .force(
        "link",
        forceLink<ViewNode, ViewLink>(edges)
          .id((n) => n.id)
          .distance(120)
          .strength(0.2),
      )
      .force("charge", forceManyBody().strength(-500))
      .force("center", forceCenter(450, 270))
      .force("collide", forceCollide(43));
    simulation.current = sim;
    setLinks(edges);
    sim.on("tick", () => setPositions([...nodes]));
    if (!physics) {
      sim.stop();
      setPositions([...nodes]);
    }
    return () => {
      sim.stop();
    };
  }, [drawing]);
  useEffect(() => {
    if (physics) simulation.current?.alpha(0.3).restart();
    else simulation.current?.stop();
  }, [physics]);
  useEffect(() => {
    if (!ref.current) return;
    const behavior = zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.15, 4])
      .filter(
        (event) =>
          event.type === "wheel" ||
          (!event.button && !event.target.closest("[data-node]")),
      )
      .on("zoom", (event) => {
        transform.current = event.transform;
        setView(event.transform.toString());
      });
    zoomer.current = behavior;
    select(ref.current).call(behavior).on("dblclick.zoom", null);
    return () => {
      if (ref.current) select(ref.current).on(".zoom", null);
    };
  }, [ref]);
  const world = (event: React.PointerEvent) => {
    const svg = ref.current!,
      point = svg.createSVGPoint();
    point.x = event.clientX;
    point.y = event.clientY;
    const local = point.matrixTransform(svg.getScreenCTM()!.inverse());
    return transform.current.invert([local.x, local.y]);
  };
  const dragStart = (event: React.PointerEvent, id: string) => {
    if (event.button !== 0) return;
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    const [x, y] = world(event);
    dragging.current = { id, x, y, moved: false };
  };
  const dragMove = (event: React.PointerEvent) => {
    const drag = dragging.current;
    if (!drag) return;
    const [x, y] = world(event),
      node = simulation.current?.nodes().find((n) => n.id === drag.id);
    if (!node) return;
    if (Math.hypot(x - drag.x, y - drag.y) > 3) drag.moved = true;
    if (!drag.moved) return;
    node.fx = node.x = x;
    node.fy = node.y = y;
    if (physics) simulation.current?.alphaTarget(0.1).restart();
    setPositions([...simulation.current!.nodes()]);
  };
  const dragEnd = (event: React.PointerEvent, node: ViewNode) => {
    const drag = dragging.current;
    dragging.current = null;
    simulation.current?.alphaTarget(0);
    if (!drag) return;
    if (drag.moved) {
      if (!node.cluster && !readOnly)
        onPosition?.(node.id, (node.x ?? 450) - 450, (node.y ?? 270) - 270);
    } else if (node.cluster)
      setCollapsed((c) => c.filter((t) => t !== node.type));
    else onSelect(node.id);
    if (event.currentTarget.hasPointerCapture(event.pointerId))
      event.currentTarget.releasePointerCapture(event.pointerId);
  };
  const activate = (node: ViewNode) =>
    node.cluster
      ? setCollapsed((c) => c.filter((t) => t !== node.type))
      : onSelect(node.id);
  const zoomBy = (factor: number) => {
    if (ref.current && zoomer.current)
      select(ref.current).call(zoomer.current.scaleBy, factor);
  };
  const fit = () => {
    const nodes = simulation.current?.nodes();
    if (!nodes?.length || !ref.current || !zoomer.current) return;
    const minX = Math.min(...nodes.map((n) => n.x ?? 0)) - 90,
      maxX = Math.max(...nodes.map((n) => n.x ?? 0)) + 90;
    const minY = Math.min(...nodes.map((n) => n.y ?? 0)) - 50,
      maxY = Math.max(...nodes.map((n) => n.y ?? 0)) + 70;
    const scale = Math.min(
      2,
      Math.max(0.15, 0.92 * Math.min(900 / (maxX - minX), 540 / (maxY - minY))),
    );
    select(ref.current).call(
      zoomer.current.transform,
      zoomIdentity
        .translate(
          450 - (scale * (minX + maxX)) / 2,
          270 - (scale * (minY + maxY)) / 2,
        )
        .scale(scale),
    );
  };
  const reset = () => {
    if (ref.current && zoomer.current)
      select(ref.current).call(zoomer.current.transform, zoomIdentity);
  };
  return (
    <div className="graph-shell">
      <div className="graph-options">
        <label>
          <input
            type="checkbox"
            checked={physics}
            onChange={(e) => setPhysics(e.target.checked)}
          />{" "}
          Physics
        </label>
        <label>
          <input
            type="checkbox"
            checked={labels}
            onChange={(e) => setLabels(e.target.checked)}
          />{" "}
          Labels
        </label>
        <label>
          <input
            type="checkbox"
            checked={heatmap}
            onChange={(e) => setHeatmap(e.target.checked)}
          />{" "}
          Centrality heatmap
        </label>
        <span className="graph-hint">
          <Move size={12} /> Drag to arrange
        </span>
      </div>
      <svg
        ref={ref}
        className="topology-svg"
        role="group"
        aria-label="Interactive architecture topology. Use Tab to select nodes, or drag to reposition."
        viewBox="0 0 900 540"
        onPointerMove={dragMove}
        style={{ touchAction: "none" }}
      >
        <defs>
          <pattern
            id={gridId}
            width="25"
            height="25"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="1" cy="1" r="0.8" fill="#263446" />
          </pattern>
          <radialGradient id={`${gridId}glow`}>
            <stop offset="0%" stopColor="#174039" stopOpacity=".35" />
            <stop offset="100%" stopColor="#0c121c" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="900" height="540" fill="#0b111a" />
        <rect width="900" height="540" fill={`url(#${gridId})`} />
        <rect width="900" height="540" fill={`url(#${gridId}glow)`} />
        <g transform={view}>
          {links.map((link, i) => {
            const a = link.source as ViewNode,
              b = link.target as ViewNode;
            const dead = failed?.has(a.id) || failed?.has(b.id),
              active = selected === a.id || selected === b.id;
            return (
              <line
                key={i}
                className={active && !dead ? "communication-beam" : undefined}
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
                stroke={dead ? "#f46b79" : active ? "#63d9c1" : "#354a60"}
                strokeWidth={active ? 1.8 : 1}
                strokeOpacity={dead ? 0.4 : active ? 0.8 : 0.65}
                strokeDasharray={dead ? "5 5" : undefined}
              />
            );
          })}
          {positions.map((node) => {
            const dead = failed?.has(node.id),
              isSelected = selected === node.id || connectSource === node.id;
            const region = regions?.findIndex((r) => r.includes(node.id)) ?? -1;
            const color = dead
              ? "#ff6d80"
              : regions && regions.length > 1 && region >= 0
                ? `hsl(${(region * 137.5) % 360},70%,65%)`
                : heatmap
                  ? `hsl(${180 - (metrics.centrality[node.id] ?? 0) * 180},85%,65%)`
                  : COLORS[node.type];
            const radius =
              node.count > 1 ? 25 : node.id === graph.nodes[0]?.id ? 25 : 18;
            return (
              <g
                key={node.id}
                data-node={node.id}
                role="button"
                tabIndex={0}
                aria-label={`${node.label}${node.count > 1 ? `, ${node.count} nodes; expand cluster` : `; degree ${metrics.degree[node.id] ?? 0}`}`}
                transform={`translate(${node.x ?? 450},${node.y ?? 270})`}
                onPointerDown={(event) => dragStart(event, node.id)}
                onPointerUp={(event) => dragEnd(event, node)}
                onPointerCancel={() => {
                  dragging.current = null;
                  simulation.current?.alphaTarget(0);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    activate(node);
                  }
                }}
                style={{ cursor: "grab", outline: "none" }}
              >
                <title>
                  {node.label} | {node.type} | degree{" "}
                  {metrics.degree[node.id] ?? "cluster"} | centrality{" "}
                  {(metrics.centrality[node.id] ?? 0).toFixed(3)}
                </title>
                <circle
                  className={isSelected ? "node-status-ring" : undefined}
                  r={radius + 12}
                  fill="none"
                  stroke={
                    dead
                      ? "#ff6d80"
                      : (metrics.degree[node.id] ?? 0) === 0 && node.count === 1
                        ? "#f1be68"
                        : "#45dfbd"
                  }
                  strokeWidth="1"
                  strokeDasharray="3 5"
                >
                  <title>
                    {dead
                      ? "Failed"
                      : (metrics.degree[node.id] ?? 0) === 0 && node.count === 1
                        ? "Warning: isolated"
                        : "Stable: connected"}
                  </title>
                </circle>
                <circle
                  r={radius + 8}
                  fill={color}
                  fillOpacity={isSelected ? 0.13 : 0.035}
                  stroke={color}
                  strokeOpacity={isSelected ? 0.75 : 0.15}
                  strokeWidth="1"
                />
                <circle
                  r={radius}
                  fill="#101d28"
                  stroke={color}
                  strokeWidth={isSelected ? 2 : 1.4}
                />
                {dead ? (
                  <path
                    d="m-5-5 10 10 m0-10-10 10"
                    stroke={color}
                    strokeWidth="2"
                  />
                ) : node.count > 1 ? (
                  <text
                    textAnchor="middle"
                    dy="5"
                    fontSize="13"
                    fontFamily="monospace"
                    fill={color}
                  >
                    {node.count}
                  </text>
                ) : (
                  <>
                    <path
                      d="m0-7 6 3.5v7L0 7l-6-3.5v-7Z M-6-3.5 0 0l6-3.5 M0 0v7"
                      fill="none"
                      stroke={color}
                      strokeWidth="1.4"
                    />
                  </>
                )}
                {labels && (
                  <text
                    y={radius + 24}
                    textAnchor="middle"
                    fill={dead ? "#ff8594" : isSelected ? "#f2fffc" : "#acb9ca"}
                    fontSize="11"
                    fontFamily="Arial, sans-serif"
                    fontWeight={isSelected ? 600 : 400}
                    paintOrder="stroke"
                    stroke="#0b111a"
                    strokeWidth="4"
                    strokeLinejoin="round"
                  >
                    {node.label}
                  </text>
                )}
              </g>
            );
          })}
        </g>
        {!graph.nodes.length && (
          <text
            x="450"
            y="270"
            textAnchor="middle"
            fill="#8b9bae"
            fontFamily="Arial"
            fontSize="15"
          >
            Empty architecture · add a subsystem to begin
          </text>
        )}
      </svg>
      <div className="graph-bottom">
        <span>
          <span className="status-dot" /> {graph.nodes.length} subsystems{" "}
          <span className="muted">/</span> {graph.edges.length} connections
        </span>
        <div className="zoom-controls">
          <button
            title="Zoom out"
            aria-label="Zoom out"
            onClick={() => zoomBy(0.8)}
          >
            <Minus size={15} />
          </button>
          <button title="Reset view" aria-label="Reset view" onClick={reset}>
            <Crosshair size={15} />
          </button>
          <button
            title="Zoom in"
            aria-label="Zoom in"
            onClick={() => zoomBy(1.25)}
          >
            <Plus size={15} />
          </button>
          <button title="Fit canvas" aria-label="Fit canvas" onClick={fit}>
            <Maximize2 size={14} />
          </button>
        </div>
      </div>
      {!failed && (
        <div className="cluster-legend">
          {GROUPS.map((type) => (
            <button
              key={type}
              className={collapsed.includes(type) ? "collapsed" : ""}
              title={`${collapsed.includes(type) ? "Expand" : "Collapse"} ${type} cluster`}
              onClick={() =>
                setCollapsed((c) =>
                  c.includes(type) ? c.filter((t) => t !== type) : [...c, type],
                )
              }
            >
              <i style={{ background: COLORS[type] }} />
              {type}
              <span>{collapsed.includes(type) ? "+" : "−"}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
export function NodePicker({
  graph,
  value,
  onChange,
  label = "Subsystem",
}: {
  graph: Architecture;
  layoutKey?: string;
  value: string;
  onChange: (id: string) => void;
  label?: string;
}) {
  return (
    <label className="field">
      <span>{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">Select subsystem…</option>
        {graph.nodes.map((n: ArchitectureNode) => (
          <option value={n.id} key={n.id}>
            {n.label}
          </option>
        ))}
      </select>
    </label>
  );
}
