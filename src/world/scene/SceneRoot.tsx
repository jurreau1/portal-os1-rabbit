export function LoadingManager({ message = "Loading MAXVERSE" }: { message?: string }) {
  return (
    <div style={{ padding: 24, textAlign: "center", opacity: 0.85 }}>
      <div style={{ fontWeight: 700 }}>{message}</div>
      <div style={{ marginTop: 8, fontSize: 12, opacity: 0.7 }}>Initializing districts…</div>
    </div>
  );
}
