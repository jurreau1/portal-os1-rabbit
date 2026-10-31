import { useEffect, useState } from "react";

import Home from "./../pages/Home";
import Games from "./../pages/Games";
import Apps from "./../pages/Apps";
import Media from "./../pages/Media";
import Research from "./../pages/Research";
import Profile from "./../pages/Profile";
import Library from "./../pages/Library";
import Settings from "./../pages/Settings";
import Marketplace from "./../pages/Marketplace";
import Creator from "./../pages/Creator";
import Header from "./../components/navigation/Header";
import Sidebar from "./../components/navigation/Sidebar";
import MobileNav from "./../components/navigation/MobileNav";
import CommandPalette from "./../command/ui/CommandPalette";
import type { Page } from "./../types/navigation";
import { useWorldMode } from "./../state/worldMode";
import { WorldProvider, useWorld } from "./world/core/WorldProvider";
import { WorldRouter } from "./world/core/WorldRouter";
import { HUD } from "./world/ui/HUD";

function PortalShell() {
  const [page, setPage] = useState<Page>("home");
  const [collapsed, setCollapsed] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const [theme, setTheme] = useState("dark");
  const enterWorld = useWorldMode((state) => state.enterWorld);

  useEffect(() => {
    const savedTheme = localStorage.getItem("maxverse-theme") ?? "dark";
    setTheme(savedTheme);
    document.body.dataset.theme = savedTheme;
  }, []);

  useEffect(() => {
    document.body.dataset.theme = theme;
    localStorage.setItem("maxverse-theme", theme);
  }, [theme]);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setCommandOpen(true);
      }

      if (event.key === "Escape") {
        setCommandOpen(false);
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const renderPage = () => {
    switch (page) {
      case "games":
        return <Games />;
      case "apps":
        return <Apps />;
      case "media":
        return <Media />;
      case "research":
        return <Research />;
      case "profile":
        return <Profile />;
      case "library":
        return <Library />;
      case "settings":
        return <Settings />;
      case "marketplace":
        return <Marketplace />;
      case "creator":
        return <Creator />;
      default:
        return <Home />;
    }
  };

  return (
    <>
      <div className="portal-layout">
        <Sidebar
          active={page}
          collapsed={collapsed}
          onToggle={() => setCollapsed((current) => !current)}
          onNavigate={setPage}
        />

        <div className="portal-main">
          <Header onCommandOpen={() => setCommandOpen(true)} />

          <div style={{ display: "flex", justifyContent: "flex-end", padding: "8px 24px" }}>
            <button type="button" onClick={enterWorld}>
              Enter MAXVERSE World
            </button>
          </div>

          <div className="portal-content">{renderPage()}</div>
        </div>

        <MobileNav active={page} onNavigate={setPage} />
      </div>

      <CommandPalette
        open={commandOpen}
        onClose={() => setCommandOpen(false)}
        onNavigate={setPage}
        onThemeChange={setTheme}
      />
    </>
  );
}

function WorldShell() {
  const { currentDistrict, setCurrentDistrict } = useWorld();
  const exitWorld = useWorldMode((state) => state.exitWorld);

  return (
    <div style={{ minHeight: "100vh", background: "#020617", color: "#e2e8f0", padding: 16 }}>
      <HUD onExit={exitWorld} />

      <div style={{ marginTop: 48, display: "flex", gap: 12, flexWrap: "wrap" }}>
        {[
          "nexus",
          "games",
          "apps",
          "media",
          "research",
        ].map((district) => (
          <button
            key={district}
            type="button"
            onClick={() => setCurrentDistrict(district)}
            style={{
              background: currentDistrict === district ? "#2563eb" : "#0f172a",
              color: "#f8fafc",
              border: "1px solid #334155",
              borderRadius: 8,
              padding: "8px 12px",
            }}
          >
            {district}
          </button>
        ))}
      </div>

      <div style={{ marginTop: 24, fontSize: 18 }}>
        World active — District: {currentDistrict}
      </div>
    </div>
  );
}

export default function App() {
  const worldEnabled = useWorldMode((state) => state.worldEnabled);
  const exitWorld = useWorldMode((state) => state.exitWorld);

  useEffect(() => {
    const onWorld = () => {
      useWorldMode.getState().enterWorld();
    };

    const onExit = () => {
      exitWorld();
    };

    const onGoto = (event: Event) => {
      const detail = (event as CustomEvent<{ district?: string }>).detail;
      if (detail?.district) {
        useWorldMode.getState().enterWorld();
      }
    };

    window.addEventListener("maxverse:world", onWorld);
    window.addEventListener("maxverse:exit-world", onExit);
    window.addEventListener("maxverse:goto", onGoto);

    return () => {
      window.removeEventListener("maxverse:world", onWorld);
      window.removeEventListener("maxverse:exit-world", onExit);
      window.removeEventListener("maxverse:goto", onGoto);
    };
  }, [exitWorld]);

  if (worldEnabled) {
    return (
      <WorldProvider>
        <WorldRouter>
          <WorldShell />
        </WorldRouter>
      </WorldProvider>
    );
  }

  return <PortalShell />;
}
