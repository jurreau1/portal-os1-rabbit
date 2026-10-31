import { useWorld } from "../core/WorldProvider";

export function PlayerController() {
  const { currentDistrict } = useWorld();

  return (
    <div style={{ padding: 8, borderRadius: 10, border: "1px solid #2a3d56" }}>
      Player active in <strong>{currentDistrict}</strong>
    </div>
  );
}
