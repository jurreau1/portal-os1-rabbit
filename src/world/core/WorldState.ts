export interface WorldDistrict {
  id: string;
  name: string;
  description: string;
  position: { x: number; y: number; z: number };
  theme: string;
  portals: string[];
  enabled: boolean;
}

export interface PortalNode {
  id: string;
  title: string;
  sourceDistrict: string;
  targetDistrict: string;
  position: { x: number; y: number; z: number };
}

export interface MaxversePlayer {
  id: string;
  username: string;
  avatar: string;
  district: string;
  achievements: string[];
  inventory: string[];
  projects: string[];
}

export interface WorldModule {
  id: string;
  category: "game" | "app" | "media" | "research";
  district: string;
  launchCommand: string;
  route: string;
}

export interface Agent {
  id: string;
  name: string;
  role: string;
  district: string;
  commands: string[];
}
