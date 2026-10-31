import type { Page } from "../types/navigation";

export type CommandAction = "open" | "launch" | "search" | "theme" | "help";

export interface ParsedCommand {
  action: CommandAction;
  target: string;
}

export interface CommandDefinition {
  action: CommandAction;
  target: string;
  description: string;
  page?: Page;
}

export interface ExecutorContext {
  navigate: (page: Page) => void;
  setTheme: (theme: string) => void;
  showHelp: (topic?: string) => void;
}
