import { useMemo } from "react";

import { identityRuntime } from "../IdentityRuntime";

export default function SettingsPage() {
  const profile = identityRuntime.getCurrentProfile() ?? identityRuntime.signInGuest();
  const preferences = useMemo(() => identityRuntime.getPreferences(), [profile.id]);

  return (
    <section className="screen">
      <div className="screen-header">
        <h1>Settings</h1>
      </div>

      <div className="panel">
        <h3>Theme</h3>
        <div className="stack-list">
          <div className="list-row"><span>Current</span><span className="badge">{preferences.theme}</span></div>
          <div className="list-row"><span>Accent</span><span className="badge">{preferences.accentColor}</span></div>
          <div className="list-row"><span>Language</span><span className="badge">{preferences.language}</span></div>
        </div>
      </div>

      <div className="panel">
        <h3>Accessibility</h3>
        <div className="stack-list">
          <div className="list-row"><span>Reduce motion</span><span className="badge">{preferences.reduceMotion ? "On" : "Off"}</span></div>
          <div className="list-row"><span>Compact layout</span><span className="badge">{preferences.compactLayout ? "On" : "Off"}</span></div>
          <div className="list-row"><span>Volume</span><span className="badge">{preferences.volume}</span></div>
        </div>
      </div>
    </section>
  );
}
