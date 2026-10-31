const STORAGE_KEY = "maxverse-command-history";

export function getHistory(): string[] {
  const raw = localStorage.getItem(STORAGE_KEY);

  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as string[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveCommand(command: string) {
  const current = getHistory();
  const updated = [command, ...current.filter((item) => item !== command)].slice(0, 25);

  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}
