import type { Agent, MaxversePlayer, PortalNode, WorldDistrict, WorldModule } from "./WorldState";

export const defaultDistricts: WorldDistrict[] = [
  {
    id: "nexus",
    name: "Nexus",
    description: "Spawn area and command hub",
    position: { x: 0, y: 0, z: 0 },
    theme: "dark",
    portals: ["games", "apps", "media", "research", "creator", "marketplace", "ai"],
    enabled: true,
  },
  {
    id: "games",
    name: "Games",
    description: "Arcade and strategy districts",
    position: { x: 18, y: 0, z: 12 },
    theme: "neon",
    portals: ["nexus"],
    enabled: true,
  },
  {
    id: "apps",
    name: "Apps",
    description: "Productivity and orchestration layer",
    position: { x: -18, y: 0, z: 12 },
    theme: "cyber",
    portals: ["nexus"],
    enabled: true,
  },
  {
    id: "media",
    name: "Media",
    description: "Streaming, creation, and publishing",
    position: { x: 18, y: 0, z: -14 },
    theme: "light",
    portals: ["nexus"],
    enabled: true,
  },
  {
    id: "research",
    name: "Research",
    description: "Knowledge and graph observatory",
    position: { x: -18, y: 0, z: -14 },
    theme: "matrix",
    portals: ["nexus"],
    enabled: true,
  },
];

export const defaultPortals: PortalNode[] = [
  {
    id: "portal-nexus-games",
    title: "Games Portal",
    sourceDistrict: "nexus",
    targetDistrict: "games",
    position: { x: 10, y: 1, z: 4 },
  },
  {
    id: "portal-nexus-apps",
    title: "Apps Portal",
    sourceDistrict: "nexus",
    targetDistrict: "apps",
    position: { x: -10, y: 1, z: 4 },
  },
  {
    id: "portal-nexus-media",
    title: "Media Portal",
    sourceDistrict: "nexus",
    targetDistrict: "media",
    position: { x: 12, y: 1, z: -6 },
  },
  {
    id: "portal-nexus-research",
    title: "Research Portal",
    sourceDistrict: "nexus",
    targetDistrict: "research",
    position: { x: -12, y: 1, z: -6 },
  },
];

export const defaultPlayer: MaxversePlayer = {
  id: "player-1",
  username: "max-user",
  avatar: "mx",
  district: "nexus",
  achievements: ["enter-maxverse"],
  inventory: ["portal-pass"],
  projects: ["nexus-seed"],
};

export const defaultModules: WorldModule[] = [
  { id: "chess", category: "game", district: "games", launchCommand: "/launch chess", route: "/games/chess" },
  { id: "translator", category: "app", district: "apps", launchCommand: "/launch translator", route: "/apps/translator" },
  { id: "media-center", category: "media", district: "media", launchCommand: "/launch media-center", route: "/media/center" },
  { id: "graph-view", category: "research", district: "research", launchCommand: "/launch graph-view", route: "/research/graph" },
];

export const defaultAgents: Agent[] = [
  { id: "guide", name: "Guide Agent", role: "navigation", district: "nexus", commands: ["/goto games", "/goto research"] },
  { id: "builder", name: "Builder Agent", role: "creator", district: "creator", commands: ["/create app", "/create game"] },
  { id: "research-agent", name: "Research Agent", role: "analysis", district: "research", commands: ["/analyse", "/report"] },
];
