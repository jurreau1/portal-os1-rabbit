import { useMemo } from "react";

export default function CommandPalette() {
  const commandItems = useMemo(
    () => [
      "/profile",
      "/library",
      "/settings",
      "/store",
      "/creator",
      "/open home",
      "/open games",
      "/open apps",
      "/open media",
      "/open research",
      "/theme dark",
      "/theme neon",
      "/world",
      "/goto nexus",
    ],
    [],
  );

  return (
    <div className="command-results">
      {commandItems.map((item) => (
        <button type="button" className="command-result" key={item}>
          {item}
        </button>
      ))}
    </div>
  );
}
