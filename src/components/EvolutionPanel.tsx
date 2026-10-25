import { useMemo, useState } from "react";
import {
  Camera,
  Download,
  Play,
  RotateCcw,
  Trash2,
  GitCompareArrows,
  Square,
} from "lucide-react";
import { useWorkbench } from "../state/workbench";
import { StructuralInvariant, compare } from "../engine/metrics";
import { download, exportJSON } from "../engine/io";
import { Panel, number } from "./UI";
import { LineChart } from "./Charts";
export function HistoryChart() {
  const history = useWorkbench((s) => s.history);
  const [measure, setMeasure] = useState("Identity");
  const data = useMemo(
    () => history.map((s) => new StructuralInvariant(s).metrics),
    [history],
  );
  const values = data.map((m, i) =>
    measure === "Identity"
      ? m.identity
      : measure === "Drift"
        ? i
          ? m.identity - data[i - 1].identity
          : 0
        : measure === "Connectivity"
          ? m.connectivity
          : m.entropy,
  );
  return (
    <>
      <div className="chart-tabs">
        {["Identity", "Drift", "Connectivity", "Complexity"].map((label) => (
          <button
            key={label}
            className={measure === label ? "active" : ""}
            onClick={() => setMeasure(label)}
          >
            {label}
          </button>
        ))}
      </div>
      <LineChart
        labels={history.map((_, i) => `T${i}`)}
        series={[{ name: measure, values, color: "#4bdfbc" }]}
        height={155}
      />
      <p className="note">
        {measure === "Complexity"
          ? "Complexity proxy: spectral entropy in bits."
          : measure === "Drift"
            ? "Drift is measured against the preceding event."
            : "Each point is an architecture edit or restoration."}
      </p>
    </>
  );
}
export function EvolutionPanel({
  onSave,
  onReplay,
  replaying,
  onStop,
  onError,
}: {
  onSave: () => void;
  onReplay: () => void;
  replaying: boolean;
  onStop: () => void;
  onError: (e: unknown) => void;
}) {
  const {
    snapshots,
    history,
    baselineId,
    setBaseline,
    restore,
    removeSnapshot,
  } = useWorkbench();
  const [source, setSource] = useState(snapshots[0]?.id ?? ""),
    [target, setTarget] = useState("current");
  const graph = useWorkbench((s) => s.graph);
  const a = snapshots.find((s) => s.id === source) ?? snapshots[0],
    b = snapshots.find((s) => s.id === target) ?? graph;
  const comparison = useMemo(() => compare(a, b), [a, b]);
  const safe = (fn: () => void) => {
    try {
      fn();
    } catch (e) {
      onError(e);
    }
  };
  return (
    <div className="page-stack">
      <Panel
        title="Architecture timeline"
        eyebrow={`${history.length} RECORDED EVENTS · STORED ON THIS DEVICE`}
        action={
          <button className="button" onClick={replaying ? onStop : onReplay}>
            {replaying ? <Square size={14} /> : <Play size={14} />}{" "}
            {replaying ? "Stop replay" : "Replay evolution"}
          </button>
        }
      >
        <HistoryChart />
        <div className="event-strip">
          {history.slice(-12).map((event, i) => (
            <div key={event.id}>
              <span className="mono">
                T{history.length - Math.min(12, history.length) + i}
              </span>
              <b>{event.name}</b>
              <small>{new Date(event.timestamp).toLocaleTimeString()}</small>
            </div>
          ))}
        </div>
      </Panel>
      <Panel
        title="Saved architectures"
        eyebrow={`${snapshots.length} / 40 SNAPSHOTS`}
        action={
          <button className="button primary" onClick={onSave}>
            <Camera size={14} /> Save snapshot
          </button>
        }
      >
        <div className="snapshot-grid">
          {snapshots.map((s) => (
            <article
              className={`snapshot-card ${baselineId === s.id ? "is-baseline" : ""}`}
              key={s.id}
            >
              <div className="snapshot-icon">
                <Camera size={19} />
                {baselineId === s.id && <span className="tag">BASELINE</span>}
              </div>
              <h3>{s.name}</h3>
              <p>
                {s.nodes.length} subsystems · {s.edges.length} connections
              </p>
              <small>{new Date(s.timestamp).toLocaleString()}</small>
              <div className="snapshot-actions">
                <button
                  title={`Restore ${s.name}`}
                  disabled={replaying}
                  onClick={() => restore(s.id)}
                >
                  <RotateCcw size={13} /> Restore
                </button>
                <button
                  title={`Export ${s.name}`}
                  aria-label={`Export ${s.name}`}
                  onClick={() =>
                    download(
                      JSON.stringify(s, null, 2),
                      `max-sim-snapshot-${s.id}.json`,
                    )
                  }
                >
                  <Download size={14} />
                </button>
                <button
                  title={`Delete ${s.name}`}
                  aria-label={`Delete ${s.name}`}
                  disabled={s.id === baselineId}
                  onClick={() => safe(() => removeSnapshot(s.id))}
                >
                  <Trash2 size={14} />
                </button>
              </div>
              <button
                className="baseline-button"
                disabled={baselineId === s.id}
                onClick={() => setBaseline(s.id)}
              >
                {baselineId === s.id
                  ? "Active comparison baseline"
                  : "Use as baseline"}
              </button>
            </article>
          ))}
        </div>
      </Panel>
      <Panel
        title="Compare architectures"
        eyebrow="SNAPSHOT DIFFERENTIAL"
        action={<GitCompareArrows size={18} className="muted" />}
      >
        <div className="comparison-selects">
          <label className="field">
            <span>Source architecture</span>
            <select value={a.id} onChange={(e) => setSource(e.target.value)}>
              {snapshots.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </label>
          <span className="comparison-arrow">→</span>
          <label className="field">
            <span>Target architecture</span>
            <select value={target} onChange={(e) => setTarget(e.target.value)}>
              <option value="current">Current architecture</option>
              {snapshots.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="result-grid">
          <div>
            <span>Identity drift</span>
            <strong>{number(comparison.drift)}</strong>
          </div>
          <div>
            <span>Fidelity ratio</span>
            <strong>{number(comparison.fidelity, 3)}</strong>
          </div>
          <div>
            <span>Entropy loss</span>
            <strong>
              {number(comparison.loss, 3)} <small>bits</small>
            </strong>
          </div>
          <div>
            <span>Node change</span>
            <strong>{b.nodes.length - a.nodes.length}</strong>
          </div>
        </div>
        <button
          className="text-link"
          onClick={() =>
            download(
              exportJSON(b, "Compared target"),
              "max-sim-compared-target.json",
            )
          }
        >
          Export target <Download size={13} />
        </button>
      </Panel>
    </div>
  );
}
