export function fuzzyMatch(query: string, candidate: string): boolean {
  const q = query.trim().toLowerCase();
  const c = candidate.trim().toLowerCase();

  if (!q) {
    return true;
  }

  let queryIndex = 0;

  for (let i = 0; i < c.length; i += 1) {
    if (c[i] === q[queryIndex]) {
      queryIndex += 1;
    }

    if (queryIndex === q.length) {
      return true;
    }
  }

  return false;
}
