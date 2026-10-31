const KEY = "maxverse-session";

export function saveSession(session: unknown) {
  localStorage.setItem(KEY, JSON.stringify(session));
}

export function loadSession() {
  const raw = localStorage.getItem(KEY);

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
