import { commandRegistry } from "../registry/commandRegistry";

export function executeCommand(action: string, target?: string) {
  const fn = commandRegistry[action];

  if (!fn) {
    return { success: false, message: "Command not found" };
  }

  fn(target);
  return { success: true };
}
