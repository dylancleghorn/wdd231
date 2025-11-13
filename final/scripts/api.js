// scripts/api.js
// Live fetch from a remote API. No fallbacks. Always request entire chapter with :1-999 unless a range is already provided.
export async function fetchScriptureIndex() {
  const res = await fetch("data/scriptures-index.json");
  if (!res.ok) throw new Error("Failed to load scripture index");
  return res.json();
}

const API_BASE = "https://api.nephi.org";

function toFullChapterQuery(reference) {
  if (/:/.test(reference)) return reference;  // caller passed a range already
  return `${reference}:1-176`;
}

function normalizeVerses(data){
  // Supports both shapes:
  // 1) { text: [...] } or { text: "line\nline" }
  // 2) { scriptures: [{ text: "..." }, ...] }
  if (data && Array.isArray(data.scriptures)){
    return data.scriptures.map(v => String(v.text || '').trim()).filter(Boolean);
  }
  const t = data?.text;
  if (Array.isArray(t)) return t.map(s => String(s).trim()).filter(Boolean);
  if (typeof t === 'string') return t.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
  return [];
}

export async function fetchChapter(reference) {
  const fullQ = toFullChapterQuery(reference);
  const url = `${API_BASE}/scriptures/?q=${encodeURIComponent(fullQ)}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Fetch failed ${res.status} for ${fullQ}`);

  const data = await res.json();
  const verses = normalizeVerses(data);

  if (!verses.length) {
    throw new Error(`Empty verses array for ${fullQ}`);
  }
  return { reference, verses };
}
