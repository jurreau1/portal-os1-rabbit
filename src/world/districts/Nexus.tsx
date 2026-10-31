export function searchDistrict(term: string) {
  const query = term.trim().toLowerCase();
  if (!query) return [];

  return Object.entries({ nexus: "Nexus", games: "Games", apps: "Apps", media: "Media", research: "Research" })
    .filter(([key, value]) => key.includes(query) || value.toLowerCase().includes(query))
    .map(([key, value]) => ({ id: key, label: value }));
}
