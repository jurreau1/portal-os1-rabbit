type CommandCallback = (target?: string) => void;

export const commandRegistry: Record<string, CommandCallback> = {
  open: (target?: string) => {
    const map: Record<string, string> = {
      home: "home",
      games: "games",
      apps: "apps",
      media: "media",
      research: "research",
    };

    if (target && map[target]) {
      window.dispatchEvent(
        new CustomEvent("maxverse:navigate", { detail: { page: map[target] } }),
      );
    }
  },

  launch: (target?: string) => {
    if (!target) return;
    window.dispatchEvent(
      new CustomEvent("maxverse:launch", { detail: { module: target } }),
    );
  },

  search: (target?: string) => {
    if (!target) return;
    window.dispatchEvent(
      new CustomEvent("maxverse:search", { detail: { query: target } }),
    );
  },

  help: () => {
    window.dispatchEvent(new CustomEvent("maxverse:help"));
  },

  theme: (target?: string) => {
    if (!target) return;
    const normalized = target.toLowerCase();
    document.body.dataset.theme = normalized;
    localStorage.setItem("maxverse-theme", normalized);
  },

  world: () => {
    window.dispatchEvent(new CustomEvent("maxverse:world", { detail: { enable: true } }));
  },

  goto: (target?: string) => {
    if (!target) return;
    window.dispatchEvent(
      new CustomEvent("maxverse:goto", { detail: { district: target } }),
    );
  },

  create: (target?: string) => {
    if (!target) return;
    window.dispatchEvent(
      new CustomEvent("maxverse:create", { detail: { kind: target } }),
    );
  },

  publish: (target?: string) => {
    if (!target) return;
    window.dispatchEvent(
      new CustomEvent("maxverse:publish", { detail: { kind: target } }),
    );
  },

  install: (target?: string) => {
    if (!target) return;
    window.dispatchEvent(
      new CustomEvent("maxverse:install", { detail: { item: target } }),
    );
  },

  ask: (target?: string) => {
    if (!target) return;
    window.dispatchEvent(
      new CustomEvent("maxverse:ask", { detail: { question: target } }),
    );
  },

  report: (target?: string) => {
    if (!target) return;
    window.dispatchEvent(
      new CustomEvent("maxverse:report", { detail: { query: target } }),
    );
  },
};
