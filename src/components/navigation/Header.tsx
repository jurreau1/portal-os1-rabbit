export default function Header() {
  return (
    <header className="portal-header">
      <div className="portal-header-inner">
        <span className="portal-header-kicker">MAX / PORTAL</span>
        <input
          className="portal-search"
          aria-label="Launch app, game or search"
          placeholder="Launch app, game or search..."
        />
      </div>
    </header>
  );
}
