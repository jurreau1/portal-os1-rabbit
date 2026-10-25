import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  RadialLinearScale,
  Filler,
  Tooltip,
  Legend,
} from "chart.js";
import { Line, Bar, Radar } from "react-chartjs-2";
import type { ChartOptions } from "chart.js";
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  RadialLinearScale,
  Filler,
  Tooltip,
  Legend,
);
ChartJS.defaults.color = "#7e90a7";
ChartJS.defaults.font.family = "'IBM Plex Mono', ui-monospace, monospace";
ChartJS.defaults.font.size = 10;
const options: ChartOptions<"line"> = {
  responsive: true,
  maintainAspectRatio: false,
  animation: { duration: 250 },
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: "#182432",
      borderColor: "#34495c",
      borderWidth: 1,
      padding: 10,
    },
  },
  scales: {
    x: {
      grid: { display: false },
      border: { display: false },
      ticks: { maxTicksLimit: 7 },
    },
    y: {
      grid: { color: "#1b2837" },
      border: { display: false },
      ticks: { maxTicksLimit: 5 },
    },
  },
};
export function LineChart({
  labels,
  series,
  height = 190,
  yTitle,
}: {
  labels: (string | number)[];
  series: { name: string; values: number[]; color: string }[];
  height?: number;
  yTitle?: string;
}) {
  return (
    <div className="chart" style={{ height }}>
      <Line
        aria-label={series.map((s) => s.name).join(", ")}
        role="img"
        options={{
          ...options,
          plugins: {
            ...options.plugins,
            legend: {
              display: series.length > 1,
              position: "bottom",
              labels: { boxWidth: 8, boxHeight: 8, usePointStyle: true },
            },
          },
          scales: {
            ...options.scales,
            y: {
              ...options.scales?.y,
              title: { display: !!yTitle, text: yTitle },
            },
          },
        }}
        data={{
          labels,
          datasets: series.map((s) => ({
            label: s.name,
            data: s.values,
            borderColor: s.color,
            backgroundColor: `${s.color}12`,
            borderWidth: 2,
            pointRadius: s.values.length > 30 ? 0 : 2,
            pointHoverRadius: 5,
            fill: series.length === 1,
            tension: 0.25,
          })),
        }}
      />
    </div>
  );
}
export function Histogram({ values }: { values: number[] }) {
  const max = Math.max(1, ...values),
    bins = Array(8).fill(0) as number[];
  values.forEach((v) => bins[Math.min(7, Math.floor((v / max) * 8))]++);
  return (
    <div className="chart" style={{ height: 230 }}>
      <Bar
        aria-label="Eigenvalue histogram"
        role="img"
        options={{
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { grid: { display: false } },
            y: {
              beginAtZero: true,
              ticks: { precision: 0 },
              grid: { color: "#1b2837" },
            },
          },
        }}
        data={{
          labels: bins.map(
            (_, i) =>
              `${((max * i) / 8).toFixed(1)}–${((max * (i + 1)) / 8).toFixed(1)}`,
          ),
          datasets: [
            {
              label: "Eigenvalues",
              data: bins,
              backgroundColor: "#48dbb999",
              borderRadius: 4,
            },
          ],
        }}
      />
    </div>
  );
}
export function RadarChart({ values }: { values: number[] }) {
  return (
    <div style={{ height: 230 }}>
      <Radar
        aria-label="Normalized structural manifold"
        role="img"
        options={{
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            r: {
              min: 0,
              max: 1,
              ticks: { display: false },
              grid: { color: "#233446" },
              angleLines: { color: "#233446" },
              pointLabels: { color: "#a8b6c9" },
            },
          },
        }}
        data={{
          labels: [
            "Identity",
            "Constraint",
            "Drift",
            "Emergence",
            "Translation",
          ],
          datasets: [
            {
              label: "Normalized magnitude",
              data: values.map((v) => Math.abs(v) / (1 + Math.abs(v))),
              borderColor: "#53e0bd",
              backgroundColor: "#53e0bd16",
              pointBackgroundColor: "#53e0bd",
              borderWidth: 1.5,
            },
          ],
        }}
      />
    </div>
  );
}
export function Gauge({
  value,
  label,
  detail,
}: {
  value: number;
  label: string;
  detail: string;
}) {
  const pct = Math.max(0, Math.min(1, value)),
    circ = 2 * Math.PI * 37;
  return (
    <div className="gauge">
      <svg
        viewBox="0 0 90 90"
        aria-label={`${label}: ${(pct * 100).toFixed(0)} percent`}
      >
        <circle
          cx="45"
          cy="45"
          r="37"
          fill="none"
          stroke="#1b2938"
          strokeWidth="5"
        />
        <circle
          cx="45"
          cy="45"
          r="37"
          fill="none"
          stroke="#48dfba"
          strokeWidth="5"
          strokeDasharray={`${pct * circ} ${circ}`}
          strokeLinecap="round"
          transform="rotate(-90 45 45)"
        />
        <text
          x="45"
          y="49"
          textAnchor="middle"
          fill="#e8f3fa"
          fontFamily="monospace"
          fontSize="20"
        >
          {(pct * 100).toFixed(0)}
          <tspan fontSize="9">%</tspan>
        </text>
      </svg>
      <div>
        <b>{label}</b>
        <span>{detail}</span>
      </div>
    </div>
  );
}
