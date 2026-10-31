import type { ReactNode } from "react";

export function SceneRoot({ children }: { children?: ReactNode }) {
  return (
    <div
      style={{
        minHeight: 360,
        borderRadius: 20,
        border: "1px solid #2a3d56",
        background: "radial-gradient(circle at top, rgba(77,127,255,0.18), rgba(10,15,26,0.9))",
        padding: 16,
      }}
    >
      {children ?? <div>3D world viewport</div>}
    </div>
  );
}
