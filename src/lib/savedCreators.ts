const SAVED_KEY = "myfit_saved_creators";

export function getSavedIds(): string[] {
  try { return JSON.parse(localStorage.getItem(SAVED_KEY) || "[]"); }
  catch { return []; }
}

export function toggleSaved(id: string): boolean {
  const ids = getSavedIds();
  const idx = ids.indexOf(id);
  if (idx === -1) {
    ids.push(id);
    localStorage.setItem(SAVED_KEY, JSON.stringify(ids));
    return true;
  }
  ids.splice(idx, 1);
  localStorage.setItem(SAVED_KEY, JSON.stringify(ids));
  return false;
}

export function isSaved(id: string): boolean {
  return getSavedIds().includes(id);
}