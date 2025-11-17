// Load the index (list of library references)
export async function fetchScriptureIndex() {
  const res = await fetch("data/scriptures-index.json");
  if (!res.ok) throw new Error("Failed to load scripture index");
  return res.json();
}

// slugify
function chapterFilename(reference) {
  // Example input: "1 Nephi 3"
  const parts = reference.trim().split(/\s+/);
  const chapter = parts.pop();               // last piece = chapter number
  const book = parts.join(" ").toLowerCase(); // "1 nephi"

  const slug = book
    .replace(/&/g, "and")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9\-]/g, "");

  const chapterNum = String(Number(chapter)).padStart(2, "0");
  return `${slug}-${chapterNum}.json`;
}

// chapter loader
export async function fetchChapter(reference) {
  const filename = chapterFilename(reference);
  const url = `data/${filename}`;

  try {
    const res = await fetch(url);

    if (!res.ok) {
      throw new Error(`File not found or inaccessible (${res.status}): ${url}`);
    }

    let data;
    try {
      data = await res.json();
    } catch (jsonErr) {
      throw new Error(`JSON parse error in file: ${filename}`);
    }

    if (!data.text || typeof data.text !== "string") {
      throw new Error(`Invalid chapter format in: ${filename}`);
    }

    const verses = data.text
      .split(/(?<=\.)\s+/)
      .map(x => x.trim())
      .filter(Boolean);

    return {
      reference,
      text: data.text,
      verses
    };

  } catch (err) {
    console.error(`fetchChapter error for "${reference}":`, err);

    return {
      reference,
      text: "",
      verses: [],
      error: err.message || "Unknown error loading chapter"
    };
  }
}

