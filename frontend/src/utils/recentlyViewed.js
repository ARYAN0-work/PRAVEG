// Tracks the last few projects a user opened, for the Sidebar's "Recently
// Viewed" section. Plain localStorage - no backend involvement needed
// for what's essentially a per-browser UI convenience.
const STORAGE_KEY = "recentlyViewedProjects";
const MAX_ENTRIES = 4;

export function getRecentlyViewed() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

export function addRecentlyViewed(project) {
  if (!project?.id) return;
  const current = getRecentlyViewed().filter((p) => p.id !== project.id);
  const updated = [{ id: project.id, name: project.name }, ...current].slice(
    0,
    MAX_ENTRIES
  );
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // Non-fatal if storage is unavailable.
  }
}