import { useEffect, useMemo, useState } from "react";
import { Play, Pause, RotateCcw, FlaskConical } from "lucide-react";
import type { Metrics } from "../types";
import { manifold, derivative, integrate } from "../engine/research";
import type { StateVector } from "../engine/research";
import { Panel, number } from "./UI";
import { LineChart, RadarChart } from "./Charts";
export function ResearchPanel({
  metrics,
  baseline,
}: {
  metrics: Metrics;
  baseline: Metrics;
}) {
  const initial = useMemo(
    () => manifold(metrics, baseline),
    [metrics, baseline],
  );
  const [weights, setWeights] = useState([0.25, 0.5, 0.2, 0.15]),
    [running, setRunning] = useState(false),
    [states, setStates] = useState<StateVector[]>([initial]);
  useEffect(() => {
    setRunning(false);
    setStates([initial]);
  }, [initial]);
  useEffect(() => {
    if (!running) return;
    const timer = setInterval(
      () =>
        setStates((s) => {
          if (s.length >= 301) {
            setRunning(false);
            return s;
          }
          return [...s, integrate(s[s.length - 1], weights)];
        }),
      100,
    );
    return () => clearInterval(timer);
  }, [running, weights]);
  const state = states[states.length - 1],
    rate = derivative(state, weights),
    names = ["Identity", "Constraint", "Drift", "Emergence", "Translation"],
    symbols = ["i", "c", "d", "e", "t"],
    colors = ["#4bdfbc", "#66aaff", "#efbf72", "#ab98ff", "#63dbed"];
  return (
    <div className="page-stack">
      <div className="notice-banner">
        <FlaskConical size={17} />
        <span>
          Research mode · experimental model. These coordinates and vector
          fields are explicit hypotheses, not validated measures of cognition.
        </span>
      </div>
      <div className="research-grid">
        <Panel title="Structural manifold" eyebrow="S = (i, c, d, e, t)">
          <RadarChart values={state} />
          <p className="note">
            Radar shows |x| / (1 + |x|). Exact signed coordinates appear below.
          </p>
          {state.map((v, i) => (
            <div className="coordinate" key={i}>
              <span style={{ color: colors[i] }}>{symbols[i]}</span>
              <span>{names[i]}</span>
              <b>{number(v, 4)}</b>
              <small>∂ {number(rate[i], 4)}</small>
            </div>
          ))}
        </Panel>
        <Panel
          title="Structural master equation"
          eyebrow="EXPLICIT EULER INTEGRATION · Δt = 0.1"
        >
          <div className="master-equation">
            dS<span>/</span>dt = <i>αD</i> + <i>βE</i> − <i>γC</i> + <i>δT</i>
          </div>
          <div className="weights-grid">
            {[
              "α · Drift",
              "β · Emergence",
              "γ · Constraint",
              "δ · Translation",
            ].map((label, i) => (
              <label className="range-field" key={label}>
                {label}
                <b>{weights[i].toFixed(2)}</b>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step=".01"
                  value={weights[i]}
                  onChange={(e) =>
                    setWeights((w) =>
                      w.map((v, j) => (i === j ? Number(e.target.value) : v)),
                    )
                  }
                />
              </label>
            ))}
          </div>
          <div className="button-row">
            <button
              className="button primary"
              disabled={states.length >= 301}
              onClick={() => setRunning((v) => !v)}
            >
              {running ? <Pause size={14} /> : <Play size={14} />}{" "}
              {running ? "Pause simulation" : "Run simulation"}
            </button>
            <button
              className="button"
              onClick={() => {
                setRunning(false);
                setStates([initial]);
              }}
            >
              <RotateCcw size={14} /> Reset
            </button>
            <span className="mono muted">
              t = {((states.length - 1) * 0.1).toFixed(1)} / 30.0
            </span>
          </div>
          <LineChart
            labels={states.map((_, i) => (i * 0.1).toFixed(1))}
            series={names.map((name, i) => ({
              name,
              values: states.map((s) => s[i]),
              color: colors[i],
            }))}
            height={260}
          />
        </Panel>
      </div>
      <Panel title="Model definitions" eyebrow="REPRODUCIBLE EXPERIMENT">
        <div className="model-definitions">
          <div>
            <h3>Initial state</h3>
            <p>
              i = identity; c = 1 − graph density; d = identity drift from
              baseline; e = mean local clustering; t = baseline entropy −
              current entropy.
            </p>
          </div>
          <div>
            <h3>Vector fields</h3>
            <code>
              D = (d, 0, d, 0, 0)
              <br />E = (e, 0, 0, e, 0)
              <br />C = (c, c, 0, 0, 0)
              <br />T = (t, 0, 0, 0, t)
            </code>
          </div>
          <div>
            <h3>Simulation bounds</h3>
            <p>
              Runs for 30 model time units. Coordinates are clamped to ±10⁶ for
              numerical stability. This simulation evolves a state vector
              independently of the architecture.
            </p>
          </div>
        </div>
      </Panel>
    </div>
  );
}
