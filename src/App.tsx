import { useMemo, useState } from "react";
import LegacyWorkbench from "./components/LegacyWorkbench";
import Home from "./pages/Home";
import Games from "./pages/Games";
import Apps from "./pages/Apps";
import Media from "./pages/Media";
import Research from "./pages/Research";
import Sidebar from "./components/navigation/Sidebar";
import Header from "./components/navigation/Header";

export type Page = "home" | "games" | "apps" | "media" | "research" | "workbench";

export default function App() {
  const [page, setPage] = useState<Page>("home");

  const content = useMemo(() => {
    switch (page) {
      case "games":
        return <Games />;
      case "apps":
        return <Apps />;
      case "media":
        return <Media />;
      case "research":
        return <Research />;
      case "workbench":
        return <LegacyWorkbench />;
      default:
        return <Home />;
    }
  }, [page]);

  return (
    <div className="portal-layout">
      <Sidebar active={page} onNavigate={setPage} />
      <div className="portal-main">
        <Header />
        <div className="portal-content">{content}</div>
      </div>
    </div>
  );
}
