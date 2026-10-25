import { useEffect, useMemo, useState } from "react";
import { Play, RotateCcw, ShieldAlert, ArrowRight, Pause } from "lucide-react";
import { useWorkbench } from "../state/workbench";
import { cascade, survivingGraph, presetSeeds } from "../engine/failure";
import type { FailurePreset } from "../engine/failure";
import { StructuralInvariant } from "../engine/metrics";
import { GraphView } from "./GraphView";
import { Panel, number } from "./UI";
export function FailurePanel({
  initialSeeds = [],
  autoRun = false,
}: {
  initialSeeds?: string[];
  autoRun?: boolean;
}) {
  const layoutKey = useWorkbench((s) => s.history.at(-1)?.id);
  const graph = useWorkbench((s) => s.graph),
    replace = useWorkbench((s) => s.replace);
  const [seeds, setSeeds] = useState<string[]>(initialSeeds),
    [threshold, setThreshold] = useState(0.5),
    [step, setStep] = useState(0),
    [running, setRunning] = useState(false),
    [selected, setSelected] = useState<string | null>(null);
  const rounds = useMemo(
    () => cascade(graph, seeds, threshold),
    [graph, seeds, threshold],
  );
  useEffect(() => {
    setStep(0);
    setRunning(autoRun && rounds.length > 0);
  }, [rounds, autoRun]);
  useEffect(() => {
    if (!running) return;
    const timer = setInterval(
      () =>
        setStep((s) => {
          if (s >= rounds.length) {
            setRunning(false);
            return s;
          }
          return s + 1;
        }),
      900,
    );
    return () => clearInterval(timer);
  }, [running, rounds.length]);
  const failed = useMemo(
    () => new Set(rounds.slice(0, step).flat()),
    [rounds, step],
  );
  const result = useMemo(
    () => survivingGraph(graph, rounds, step),
    [graph, rounds, step],
  );
  const original = useMemo(
      () => new StructuralInvariant(graph).metrics,
      [graph],
    ),
    metrics = useMemo(() => new StructuralInvariant(result).metrics, [result]);
  const collapse = original.identity
    ? 1 - metrics.identity / original.identity
    : 0;
  const toggle = (id: string) =>
    setSeeds((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  const preset = (kind: FailurePreset) => {
    const ids = presetSeeds(graph, kind, original);
    setSeeds(ids);
    if (!ids.length)
      useWorkbench
        .getState()
        .setNotice(
          `No matching subsystems are available for the ${kind} preset. Select nodes manually or add a subsystem of the appropriate type.`,
        );
  };
  const bottlenecks = Object.entries(metrics.betweenness)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);
  return (
    <div className="page-stack">
      <div className="notice-banner">
        <ShieldAlert size={17} />
        <span>
          Experimental neighbor-loss model. A node fails when at least{" "}
          {Math.round(threshold * 100)}% of its original neighbors have failed.
          Rounds update simultaneously.
        </span>
      </div>
      <div className="failure-grid">
        <Panel title="Failure injection" eyebrow="CONFIGURE A STRESS TEST">
          <div className="preset-grid">
            <button onClick={() => preset("executive")}>
              Executive failure
            </button>
            <button onClick={() => preset("memory")}>Memory corruption</button>
            <button onClick={() => preset("routing")}>Routing outage</button>
            <button onClick={() => preset("agents")}>Agent isolation</button>
          </div>
          {selected && (
            <div className="selected-failure">
              <b>{graph.nodes.find((n) => n.id === selected)?.label}</b>
              <button
                className="button danger"
                onClick={() => toggle(selected)}
              >
                {seeds.includes(selected)
                  ? "Remove from failures"
                  : "Disable selected subsystem"}
              </button>
            </div>
          )}
          <h3 className="small-heading">
            Initial failures <span>{seeds.length} selected</span>
          </h3>
          <div className="seed-list">
            {graph.nodes.map((n) => (
              <label key={n.id}>
                <input
                  type="checkbox"
                  checked={seeds.includes(n.id)}
                  onChange={() => toggle(n.id)}
                />
                <span>{n.label}</span>
              </label>
            ))}
          </div>
          <label className="range-field">
            Neighbor loss threshold <b>{Math.round(threshold * 100)}%</b>
            <input
              type="range"
              min=".1"
              max="1"
              step=".05"
              value={threshold}
              onChange={(e) => setThreshold(Number(e.target.value))}
            />
          </label>
          <div className="button-row">
            <button
              className="button danger"
              disabled={!rounds.length}
              onClick={() => {
                if (running) setRunning(false);
                else {
                  if (step >= rounds.length) setStep(0);
                  setRunning(true);
                }
              }}
            >
              {running ? <Pause size={14} /> : <Play size={14} />}{" "}
              {running ? "Pause" : "Run cascade"}
            </button>
            <button
              className="button"
              aria-label="Reset cascade"
              onClick={() => {
                setRunning(false);
                setStep(0);
              }}
            >
              <RotateCcw size={14} />
            </button>
          </div>
          <p className="note">
            Simulation is a preview. Apply the result to change the working
            architecture.
          </p>
        </Panel>
        <Panel
          title="Failure propagation"
          eyebrow={`ROUND ${step} OF ${rounds.length}`}
          action={
            <span className={`tag ${running ? "red" : ""}`}>
              {running ? "SIMULATING" : step ? "RESULT" : "READY"}
            </span>
          }
        >
          <GraphView
            layoutKey={layoutKey}
            graph={graph}
            metrics={original}
            selected={selected}
            onSelect={setSelected}
            failed={failed}
            regions={step ? metrics.components : undefined}
            readOnly
          />
        </Panel>
      </div>
      <div className="result-grid panel failure-results">
        <div>
          <span>Affected nodes</span>
          <strong className="red-text">
            {failed.size} <small>/ {graph.nodes.length}</small>
          </strong>
        </div>
        <div>
          <span>Surviving regions</span>
          <strong>{metrics.components.length}</strong>
        </div>
        <div>
          <span>Connectivity</span>
          <strong>{number(metrics.connectivity, 3)}</strong>
        </div>
        <div>
          <span>Identity collapse</span>
          <strong>
            {number(collapse * 100, 1)}
            <small>%</small>
          </strong>
        </div>
      </div>
      <div className="two-column">
        <Panel
          title="Disconnected regions"
          eyebrow="SURVIVING COMMUNICATION GROUPS"
        >
          {metrics.components.length ? (
            metrics.components.map((region, i) => (
              <div className="region" key={i}>
                <b>
                  Region {i + 1}
                  <span>{region.length} nodes</span>
                </b>
                <p>
                  {region
                    .map((id) => graph.nodes.find((n) => n.id === id)?.label)
                    .join(" · ")}
                </p>
              </div>
            ))
          ) : (
            <p className="note">No surviving nodes.</p>
          )}
        </Panel>
        <Panel
          title="Communication bottlenecks"
          eyebrow="NORMALIZED BETWEENNESS CENTRALITY"
        >
          {bottlenecks.map(([id, value]) => (
            <div className="rank-row" key={id}>
              <span>{graph.nodes.find((n) => n.id === id)?.label}</span>
              <strong>{number(value, 3)}</strong>
              <div style={{ width: `${value * 100}%` }} />
            </div>
          ))}
          <p className="note">
            Computed on the surviving graph. High betweenness indicates reliance
            on a subsystem for shortest communication paths.
          </p>
          <button
            className="button danger"
            disabled={!step || running}
            onClick={() => {
              replace(result, "Applied failure cascade");
              setStep(0);
              setSeeds([]);
            }}
          >
            Apply simulated failures <ArrowRight size={14} />
          </button>
        </Panel>
      </div>
      {step > 0 && (
        <Panel title="Propagation log" eyebrow="FAILURES BY ROUND">
          {rounds.slice(0, step).map((round, i) => (
            <div className="log-row" key={i}>
              <span className="mono">R{i + 1}</span>
              <span>
                {round
                  .map(
                    (id) => graph.nodes.find((n) => n.id === id)?.label ?? id,
                  )
                  .join(" · ")}
              </span>
              <span className="tag red">{i ? "CASCADED" : "INJECTED"}</span>
            </div>
          ))}
        </Panel>
      )}
    </div>
  );
}
