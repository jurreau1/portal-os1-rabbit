import type { CommandDefinition } from "../types";

export const COMMANDS: CommandDefinition[] = [
  {
    action: "open",
    target: "home",
    page: "home",
    description: "Open dashboard",
  },
  {
    action: "open",
    target: "games",
    page: "games",
    description: "Open games",
  },
  {
    action: "open",
    target: "apps",
    page: "apps",
    description: "Open apps",
  },
  {
    action: "open",
    target: "media",
    page: "media",
    description: "Open media",
  },
  {
    action: "open",
    target: "research",
    page: "research",
    description: "Open research",
  },
  {
    action: "theme",
    target: "dark",
    description: "Dark theme",
  },
  {
    action: "theme",
    target: "light",
    description: "Light theme",
  },
  {
    action: "theme",
    target: "neon",
    description: "Neon theme",
  },
  {
    action: "theme",
    target: "cyber",
    description: "Cyber theme",
  },
  {
    action: "theme",
    target: "matrix",
    description: "Matrix theme",
  },
];
