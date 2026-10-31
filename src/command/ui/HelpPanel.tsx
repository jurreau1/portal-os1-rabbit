export default function HelpPanel() {
  return (
    <div className="help-panel">
      <h3>MAX COMMANDS</h3>

      <section>
        <h4>Navigation</h4>
        <ul>
          <li>/open home</li>
          <li>/open games</li>
          <li>/open apps</li>
          <li>/open media</li>
          <li>/open research</li>
        </ul>
      </section>

      <section>
        <h4>Launch</h4>
        <ul>
          <li>/launch chess</li>
          <li>/launch translator</li>
        </ul>
      </section>

      <section>
        <h4>World</h4>
        <ul>
          <li>/world</li>
          <li>/goto nexus</li>
          <li>/goto games</li>
          <li>/goto apps</li>
          <li>/goto media</li>
          <li>/goto research</li>
          <li>/goto creator</li>
          <li>/goto marketplace</li>
          <li>/goto ai</li>
        </ul>
      </section>

      <section>
        <h4>Themes</h4>
        <ul>
          <li>/theme dark</li>
          <li>/theme light</li>
          <li>/theme neon</li>
          <li>/theme cyber</li>
          <li>/theme matrix</li>
        </ul>
      </section>
    </div>
  );
}
