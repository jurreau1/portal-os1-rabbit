import { useMemo, useRef, useState } from "react";
import { ArrowRight, Upload, FlaskConical } from "lucide-react";
import type { Architecture } from "../types";
import { useWorkbench } from "../state/workbench";
import { compare } from "../engine/metrics";
import { parseArchitecture } from "../engine/io";
import { edgeKey } from "../engine/graph";
import { Panel, number } from "./UI";
import { Gauge, LineChart } from "./Charts";
export function TranslationPanel({
  onError,
}: {
  onError: (e: unknown) => void;
}) {
  const { snapshots, graph, baselineId } = useWorkbench();
  const [source, setSource] = useState(baselineId),
    [target, setTarget] = useState("current"),
    [imported, setImported] = useState<Architecture | null>(null),
    [fileName, setFileName] = useState("");
  const file = useRef<HTMLInputElement>(null);
  const a = snapshots.find((s) => s.id === source) ?? snapshots[0],
    b =
      target === "imported" && imported
        ? imported
        : (snapshots.find((s) => s.id === target) ?? graph);
  const result = useMemo(() => compare(a, b), [a, b]);
  const targetIds = new Set(b.nodes.map((n) => n.id)),
    targetEdges = new Set(b.edges.map((e) => edgeKey(e.source, e.target)));
  const shared = a.nodes.filter((n) => targetIds.has(n.id)).length,
    sharedEdges = a.edges.filter((e) =>
      targetEdges.has(edgeKey(e.source, e.target)),
    ).length;
  async function load(input: File | undefined) {
    if (!input) return;
    try {
      if (input.size > 2_000_000) throw new Error("Import is limited to 2 MB.");
      setImported(
        parseArchitecture(
          await input.text(),
          input.name.split(".").pop()!.toLowerCase(),
        ),
      );
      setFileName(input.name);
      setTarget("imported");
    } catch (e) {
      onError(e);
    } finally {
      if (file.current) file.current.value = "";
    }
  }
  return (
    <div className="page-stack">
      <div className="notice-banner">
        <FlaskConical size={17} />
        <span>
          Translation is an architecture-to-architecture comparison. Entropy
          measures spectral distribution; it does not measure semantic
          information.
        </span>
      </div>
      <Panel
        title="Translation experiment"
        eyebrow="SOURCE → TRANSFORMED ARCHITECTURE"
      >
        <div className="comparison-selects">
          <label className="field">
            <span>Architecture A · source</span>
            <select value={a.id} onChange={(e) => setSource(e.target.value)}>
              {snapshots.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </label>
          <ArrowRight className="comparison-arrow" />
          <label className="field">
            <span>Architecture B · target</span>
            <select value={target} onChange={(e) => setTarget(e.target.value)}>
              <option value="current">Current architecture</option>
              {snapshots.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
              {imported && (
                <option value="imported">Imported: {fileName}</option>
              )}
            </select>
          </label>
          <button className="button" onClick={() => file.current?.click()}>
            <Upload size={14} /> Import B
          </button>
          <input
            hidden
            ref={file}
            type="file"
            accept=".json,.csv,.graphml,.xml"
            onChange={(e) => void load(e.target.files?.[0])}
          />
        </div>
        <div className="formula-display">
          <span>
            L<sub>T</sub> = H(S) − H(T(S))
          </span>
          <b>
            {number(result.a.entropy, 4)} − {number(result.b.entropy, 4)} ={" "}
            <em>{number(result.loss, 4)} bits</em>
          </b>
        </div>
      </Panel>
      <div className="result-grid panel">
        <div>
          <span>Entropy preserved · min(Hₐ,Hᵦ)</span>
          <strong>
            {number(result.preserved, 3)} <small>bits</small>
          </strong>
        </div>
        <div>
          <span>Entropy destroyed · max(0,Lₜ)</span>
          <strong>
            {number(result.destroyed, 3)} <small>bits</small>
          </strong>
        </div>
        <div>
          <span>Entropy gained · max(0,−Lₜ)</span>
          <strong>
            {number(result.gained, 3)} <small>bits</small>
          </strong>
        </div>
        <div>
          <span>Structural fidelity · Iᵦ / Iₐ</span>
          <strong>
            {number(result.fidelity, 3)}
            <small>×</small>
          </strong>
        </div>
      </div>
      <div className="two-column">
        <Panel
          title="Invariant preservation"
          eyebrow="SYMMETRIC IDENTITY AGREEMENT"
        >
          <Gauge
            value={result.preservation}
            label="Preservation score"
            detail="min(Iₐ, Iᵦ) / max(Iₐ, Iᵦ)"
          />
          <div className="detail-row">
            <span>Shared node IDs</span>
            <b>
              {shared} / {a.nodes.length}
            </b>
          </div>
          <div className="detail-row">
            <span>Shared connections</span>
            <b>
              {sharedEdges} / {a.edges.length}
            </b>
          </div>
          <p className="note">
            Equal identity does not guarantee equal topology. Fidelity can
            exceed 1; it is undefined when source identity is zero. Two zero
            identities have preservation score 1.
          </p>
        </Panel>
        <Panel title="Spectral comparison" eyebrow="SORTED LAPLACIAN SPECTRA">
          <LineChart
            labels={Array.from(
              { length: Math.max(a.nodes.length, b.nodes.length) },
              (_, i) => i,
            )}
            series={[
              {
                name: "Architecture A",
                values: result.a.eigenvalues,
                color: "#4bdfbc",
              },
              {
                name: "Architecture B",
                values: result.b.eigenvalues,
                color: "#8f9dff",
              },
            ]}
            height={250}
          />
        </Panel>
      </div>
    </div>
  );
}
