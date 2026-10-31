import type { CommandAction, ParsedCommand } from "../types";

const ACTIONS: CommandAction[] = [
  "open",
  "launch",
  "search",
  "theme",
  "help",
  "world",
  "goto",
];

export function parseCommand(input: string): ParsedCommand | null {
  const trimmed = input.trim();

  if (!trimmed.startsWith("/")) {
    return null;
  }

  const parts = trimmed.substring(1).split(/\s+/);
  const action = parts[0]?.toLowerCase();

  if (!action || !ACTIONS.includes(action as CommandAction)) {
    return null;
  }

  return {
    action: action as CommandAction,
    target: parts.slice(1).join(" "),
  };
}
