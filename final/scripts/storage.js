
export function getPref(key) {
  try { return JSON.parse(localStorage.getItem(key)); }
  catch { return null; }
}
export function setPref(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function getJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}
export function setJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function getCompletedChapters() {
  return new Set(getJson('completedChapters', []));
}
export function addCompletedChapter(reference) {
  const arr = getJson('completedChapters', []);
  if (!arr.includes(reference)) {
    arr.push(reference);
    setJson('completedChapters', arr);
  }
}
