import type { ParsedCommand } from "../types";

export function parseCommand(input: string): ParsedCommand | null {
  const value = input.trim();

  if (!value.startsWith("/")) {
    return null;
  }

  const pieces = value.replace("/", "").split(" ");
  const action = pieces[0].toLowerCase();
  const target = pieces.slice(1).join(" ");

  return {
    action: action as ParsedCommand["action"],
    target,
  };
}
