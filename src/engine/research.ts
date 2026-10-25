import type { Metrics } from "../types";
export type StateVector = [number, number, number, number, number];
export function manifold(metrics: Metrics, baseline: Metrics): StateVector {
  return [
    metrics.identity,
    1 - metrics.density,
    metrics.identity - baseline.identity,
    metrics.clustering,
    baseline.entropy - metrics.entropy,
  ];
}
// Experimental vector fields: D=(d,0,d,0,0), E=(e,0,0,e,0),
// C=(c,c,0,0,0), T=(t,0,0,0,t). No topology mutations.
export function derivative(s: StateVector, weights: number[]): StateVector {
  const [, c, d, e, t] = s,
    [a, b, g, h] = weights;
  return [a * d + b * e - g * c + h * t, -g * c, a * d, b * e, h * t];
}
export function integrate(
  s: StateVector,
  weights: number[],
  dt = 0.1,
): StateVector {
  const rate = derivative(s, weights);
  return s.map((v, i) =>
    Math.max(-1e6, Math.min(1e6, v + dt * rate[i])),
  ) as StateVector;
}
