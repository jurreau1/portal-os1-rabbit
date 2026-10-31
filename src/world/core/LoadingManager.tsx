import type { ReactNode } from "react";
import { useWorld } from "./WorldProvider";

export function WorldRouter({ children }: { children?: ReactNode }) {
  const { currentDistrict } = useWorld();

  return (
    <section aria-label="MAXVERSE world router">
      <div style={{ padding: 12, border: "1px solid #2a3d56", borderRadius: 12 }}>
        <strong>District:</strong> {currentDistrict}
      </div>
      {children}
    </section>
  );
}
