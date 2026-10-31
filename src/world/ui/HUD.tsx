export type HUDProps = {
  onExit: () => void;
};

export function HUD({ onExit }: HUDProps) {
  return (
    <div
      style={{
        position: "fixed",
        top: 16,
        right: 16,
        zIndex: 50,
        display: "flex",
        gap: 8,
        padding: 8,
        borderRadius: 12,
        background: "rgba(15, 23, 42, 0.7)",
        border: "1px solid rgba(148, 163, 184, 0.35)",
      }}
    >
      <button type="button" onClick={onExit}>
        Return To Portal
      </button>
    </div>
  );
}
