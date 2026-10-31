export default function Apps() {
  const apps = ["Notes", "Translator", "Analytics", "Research Tools", "Planning", "Automation"];

  return (
    <section>
      <h1>Apps</h1>
      <div className="portal-card-grid">
        {apps.map((app) => (
          <div key={app} className="portal-card">
            <h3>{app}</h3>
            <p>Productivity and orchestration module</p>
          </div>
        ))}
      </div>
    </section>
  );
}
