export default function Games() {
  const games = ["Chess", "Puzzle", "Memory", "Strategy", "Arcade"];

  return (
    <section>
      <h1>Games</h1>
      <div className="portal-card-grid">
        {games.map((game) => (
          <div key={game} className="portal-card">
            <h3>{game}</h3>
            <p>Playable system module</p>
          </div>
        ))}
      </div>
    </section>
  );
}
