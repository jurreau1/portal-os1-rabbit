import type { CommandDefinition } from "../types";

export const COMMANDS: CommandDefinition[] = [
  {
    action: "open",
    target: "home",
    description: "Open dashboard",
    page: "home",
  },
  {
    action: "open",
    target: "games",
    description: "Open games",
    page: "games",
  },
  {
    action: "open",
    target: "apps",
    description: "Open apps",
    page: "apps",
  },
  {
    action: "open",
    target: "media",
    description: "Open media",
    page: "media",
  },
  {
    action: "open",
    target: "research",
    description: "Open research",
    page: "research",
  },
  {
    action: "launch",
    target: "chess",
    description: "Launch chess",
  },
  {
    action: "launch",
    target: "translator",
    description: "Launch translator",
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
  {
    action: "help",
    target: "",
    description: "Show help",
  },
];
