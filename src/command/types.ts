export type CommandAction =
  | "open"
  | "launch"
  | "search"
  | "theme"
  | "help"
  | "world"
  | "goto";

export interface ParsedCommand {
  action: CommandAction;
  target: string;
}

export interface CommandDefinition {
  action: CommandAction;
  target: string;
  description: string;
  page?: import("../types/navigation").Page;
}

export interface ExecutorContext {
  navigate: (page: import("../types/navigation").Page) => void;
  setTheme: (theme: string) => void;
  showHelp: (topic?: string) => void;
}
