import { identityRuntime } from "../IdentityRuntime";

export function ThemeSettings() {
  const preferences = identityRuntime.getPreferences();

  return (
    <div className="panel">
      <h3>Theme</h3>
      <div className="stack-list">
        <div className="list-row"><span>Theme</span><span className="badge">{preferences.theme}</span></div>
        <div className="list-row"><span>Accent</span><span className="badge">{preferences.accentColor}</span></div>
      </div>
    </div>
  );
}

export function AccessibilitySettings() {
  const preferences = identityRuntime.getPreferences();

  return (
    <div className="panel">
      <h3>Accessibility</h3>
      <div className="stack-list">
        <div className="list-row"><span>Reduce motion</span><span className="badge">{preferences.reduceMotion ? "On" : "Off"}</span></div>
        <div className="list-row"><span>Compact layout</span><span className="badge">{preferences.compactLayout ? "On" : "Off"}</span></div>
      </div>
    </div>
  );
}

export function WorldSettings() {
  const preferences = identityRuntime.getPreferences();

  return (
    <div className="panel">
      <h3>World</h3>
      <div className="stack-list">
        <div className="list-row"><span>Auto save</span><span className="badge">{preferences.autoSave ? "Enabled" : "Disabled"}</span></div>
        <div className="list-row"><span>Volume</span><span className="badge">{String(preferences.volume)}</span></div>
      </div>
    </div>
  );
}
