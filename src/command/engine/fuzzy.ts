export function fuzzyMatch(query: string, target: string): boolean {
  const normalizedQuery = query.trim().toLowerCase();
  const normalizedTarget = target.trim().toLowerCase();

  if (!normalizedQuery) {
    return true;
  }

  let queryIndex = 0;

  for (let targetIndex = 0; targetIndex < normalizedTarget.length; targetIndex += 1) {
    if (normalizedTarget[targetIndex] === normalizedQuery[queryIndex]) {
      queryIndex += 1;
    }

    if (queryIndex >= normalizedQuery.length) {
      return true;
    }
  }

  return false;
}
