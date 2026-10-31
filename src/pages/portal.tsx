import { useEffect, useState } from "react";

import Home from "./Home";
import Games from "./Games";
import Apps from "./Apps";
import Media from "./Media";
import Research from "./Research";
import Profile from "./Profile";
import Library from "./Library";
import Settings from "./Settings";
import Marketplace from "./Marketplace";
import Creator from "./Creator";
import { identityRuntime } from "../identity/IdentityRuntime";

export type PortalPage =
  | "home"
  | "games"
  | "apps"
  | "media"
  | "research"
  | "profile"
  | "library"
  | "settings"
  | "marketplace"
  | "creator";

export function usePortalPageState() {
  const [page, setPage] = useState<PortalPage>("home");

  useEffect(() => {
    if (!identityRuntime.getCurrentProfile()) {
      identityRuntime.signInGuest();
    }
  }, []);

  return { page, setPage };
}

export function renderPortalPage(page: PortalPage) {
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
}
