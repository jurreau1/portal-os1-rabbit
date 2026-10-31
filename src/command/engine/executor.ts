import { COMMANDS } from "../registry/commands";
import type { ParsedCommand } from "../types";

export function executeCommand(
  parsed: ParsedCommand,
  navigate: (page: string) => void,
  setTheme: (theme: string) => void,
  showHelp: (topic?: string) => void,
) {
  const matching = COMMANDS.find(
    (cmd) =>
      cmd.action === parsed.action &&
      (!parsed.target || cmd.target === parsed.target || cmd.target === ""),
  );

  if (!matching) {
    return { success: false, message: "Command not found" };
  }

  switch (parsed.action) {
    case "open":
      if (matching.page) {
        navigate(matching.page);
      }
      break;
    case "theme":
      setTheme(parsed.target);
      break;
    case "help":
      showHelp(parsed.target || undefined);
      break;
    case "search":
      console.log("SEARCH:", parsed.target);
      break;
    case "launch":
      console.log("LAUNCH:", parsed.target);
      break;
    default:
      break;
  }

  return { success: true };
}
