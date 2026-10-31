export type CommandAction = "open" | "launch" | "search" | "theme" | "help";

export interface CommandContext {
  navigate: (page: string) => void;
  setTheme: (theme: string) => void;
  showHelp: (topic?: string) => void;
}

export interface CommandDefinition {
  action: CommandAction;
  target: string;
  description: string;
  page?: string;
}

export interface ParsedCommand {
  action: CommandAction;
  target: string;
}
