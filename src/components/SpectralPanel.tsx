import { useState } from "react";
import type { Architecture, Metrics } from "../types";
import { Panel, number } from "./UI";
import { Histogram, LineChart } from "./Charts";
export function SpectralPanel({
  graph,
  metrics,
}: {
  graph: Architecture;
  metrics: Metrics;
}) {
  const [matrix, setMatrix] = useState<
      "laplacian" | "adjacency" | "eigenvectors"
    >("laplacian"),
    [descending, setDescending] = useState(false);
  const values = metrics.eigenvalues
    .map((value, index) => ({ value, index }))
    .sort((a, b) => (descending ? b.value - a.value : a.value - b.value));
  return (
    <div className="page-stack">
      <div className="two-column">
        <Panel title="Laplacian spectrum" eyebrow="EIGENVALUE DISTRIBUTION">
          <LineChart
            labels={metrics.eigenvalues.map((_, i) => i)}
            series={[
              {
                name: "Eigenvalue λ",
                values: metrics.eigenvalues,
                color: "#4bdfbc",
              },
            ]}
            height={245}
            yTitle="λ"
          />
        </Panel>
        <Panel title="Spectral density" eyebrow="8 EQUAL-WIDTH BINS">
          <Histogram values={metrics.eigenvalues} />
        </Panel>
      </div>
      <div className="spectral-grid">
        <Panel title="Eigenvalues" eyebrow="SORTED SPECTRUM">
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Index</th>
                  <th>
                    <button onClick={() => setDescending((v) => !v)}>
                      Eigenvalue {descending ? "↓" : "↑"}
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody>
                {values.map(({ value, index }) => (
                  <tr key={index}>
                    <td className="mono">λ{index}</td>
                    <td className="mono">{number(value, 6)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
        <Panel
          title={
            matrix === "eigenvectors"
              ? "Eigenvector basis"
              : matrix === "laplacian"
                ? "Laplacian matrix"
                : "Adjacency matrix"
          }
          eyebrow="NODE ORDER FOLLOWS THE ARCHITECTURE"
          action={
            <select
              aria-label="Matrix view"
              value={matrix}
              onChange={(e) => setMatrix(e.target.value as typeof matrix)}
            >
              <option value="laplacian">L = D − A</option>
              <option value="adjacency">Adjacency A</option>
              <option value="eigenvectors">Eigenvectors V</option>
            </select>
          }
        >
          <div className="matrix-scroll">
            <table className="matrix-table">
              <thead>
                <tr>
                  <th>Node</th>
                  {graph.nodes.map((n, i) => (
                    <th
                      key={n.id}
                      title={
                        matrix === "eigenvectors" ? `Eigenvector ${i}` : n.label
                      }
                    >
                      {matrix === "eigenvectors" ? `v${i}` : i + 1}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {metrics[matrix].map((row, i) => (
                  <tr key={graph.nodes[i].id}>
                    <th title={graph.nodes[i].label}>
                      {i + 1}. {graph.nodes[i].label}
                    </th>
                    {row.map((v, j) => (
                      <td
                        key={j}
                        style={{
                          background:
                            Math.abs(v) > 1e-8
                              ? `rgba(75,223,188,${Math.min(0.22, Math.abs(v) * 0.04)})`
                              : undefined,
                        }}
                      >
                        {matrix === "eigenvectors" ? number(v, 3) : v}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            {!graph.nodes.length && (
              <p className="note">Empty graph: the matrices have no entries.</p>
            )}
          </div>
        </Panel>
      </div>
      <Panel title="Structural signature" eyebrow="LAPLACIAN EIGENVALUES">
        <code className="signature">[{metrics.signature || "empty"}]</code>
        <p className="note">
          Rounded to 3 decimals for display. Eigenvalues are invariant under
          node relabeling; distinct graphs can share a spectrum. Eigenvector
          signs and bases within repeated eigenvalues are not unique.
        </p>
      </Panel>
    </div>
  );
}
