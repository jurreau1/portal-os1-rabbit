import { useEffect, useState } from "react";

import "./styles.css";

import Home from "./pages/Home";
import Games from "./pages/Games";
import Apps from "./pages/Apps";
import Media from "./pages/Media";
import Research from "./pages/Research";

import Header from "./components/navigation/Header";
import Sidebar from "./components/navigation/Sidebar";
import MobileNav from "./components/navigation/MobileNav";
import CommandPalette from "./command/ui/CommandPalette";

import type { Page } from "./types/navigation";

export default function App() {
  const [page, setPage] = useState<Page>("home");
  const [collapsed, setCollapsed] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const [theme, setTheme] = useState("dark");

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
