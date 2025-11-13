import { fetchChapter, fetchScriptureIndex } from './api.js';
import { getPref, setPref, addCompletedChapter } from './storage.js';

let playing = false;
let timerId = null;
let words = [];
let index = 0;
let currentSrc = null;

function setStatus(msg) {
  const status = document.getElementById('reader-status');
  if (status) status.textContent = msg || '';
}

function setControlsVisible(show) {
  const controls = document.querySelector('.controls');
  const status = document.querySelector('.status-line');
  if (!controls) return;
  controls.hidden = !show;
  controls.style.display = '';

  status.hidden = !show;
  status.style.display = '';
}

function setLoading(isLoading) {
  const word = document.getElementById('reader-word');
  const controls = document.querySelectorAll('.controls button, .controls select, .controls input');
  if (isLoading && currentSrc) {
    setStatus('Loading chapter…');
    if (word) word.textContent = 'Loading…';
  }
  controls.forEach((el) => { el.disabled = !!isLoading; });
}

function delayFor(word, wpm) {
  const base = 60000 / Math.max(50, wpm);
  // regex for punctuation
  if (/[.!?]$/.test(word)) return base * 2.0;
  if (/[,;:]$/.test(word)) return base * 1.5;
  return base;
}

function show(word) {
  const wordEl = document.getElementById('reader-word');
  if (wordEl) wordEl.textContent = word;
}

function step(wpm) {
  if (index >= words.length) {
    pause();
    if (currentSrc) addCompletedChapter(currentSrc);
    return;
  }
  const word = words[index++];
  show(word);
  timerId = setTimeout(() => step(wpm), delayFor(word, wpm));
}

function play(wpm) {
  if (playing) return;
  playing = true;
  step(wpm);
}

function pause() {
  playing = false;
  clearTimeout(timerId);
}

async function getAdjacentReference(currentRef, direction) {
  if (!currentRef) return null;
  const match = currentRef.match(/^(.*\D)\s(\d+)$/);
  if (!match) return null;
  const bookName = match[1].trim();
  const chapNum = parseInt(match[2], 10);

  const idx = await fetchScriptureIndex();
  const list = [];
  idx.collections.forEach((c) => {
    c.books.forEach((b) => list.push({ collection: c.title, book: b.name, chapterCount: b.chapterCount }));
  });

  const pos = list.findIndex((x) => x.book === bookName);
  if (pos === -1) return null;

  if (direction === 'next') {
    if (chapNum < list[pos].chapterCount) return `${bookName} ${chapNum + 1}`;
    if (pos + 1 < list.length) return `${list[pos + 1].book} 1`;
    return null;
  } else {
    if (chapNum > 1) return `${bookName} ${chapNum - 1}`;
    if (pos - 1 >= 0) {
      const prev = list[pos - 1];
      return `${prev.book} ${prev.chapterCount}`;
    }
    return null;
  }
}

export async function initReader() {
  // Parse ?ref=
  const params = new URLSearchParams(location.search);
  const hasQuery = params.has('ref');
  const raw = hasQuery ? params.get('ref') : null;
  const ref = raw ? decodeURIComponent(raw) : null;

  setStatus(ref ? `Reading: ${ref}` : 'No chapter selected.');
  currentSrc = ref || null;
  setControlsVisible(!!ref);

  const wpmInput = document.getElementById('wpm');
  const fontSelect = document.getElementById('font-size');
  const wpmOut = document.getElementById('wpm-value');

  if (wpmInput) {
    wpmInput.value = getPref('wpm') ?? 250;
    if (wpmOut) wpmOut.textContent = String(wpmInput.value);
    wpmInput.addEventListener('input', () => {
      setPref('wpm', Number(wpmInput.value));
      if (wpmOut) wpmOut.textContent = String(wpmInput.value);
    });
  }

  if (fontSelect) {
    fontSelect.value = getPref('fontSize') ?? '3.5rem';
    const rw = document.getElementById('reader-word');
    if (rw) rw.style.fontSize = fontSelect.value;
    fontSelect.addEventListener('change', () => {
      setPref('fontSize', fontSelect.value);
      const r2 = document.getElementById('reader-word');
      if (r2) r2.style.fontSize = fontSelect.value;
    });
  }

  const playBtn = document.getElementById('play');
  const pauseBtn = document.getElementById('pause');
  const restartBtn = document.getElementById('restart');
  const backBtn = document.getElementById('back');
  const fwdBtn = document.getElementById('forward');
  const prevBtn = document.getElementById('prev-chapter');
  const nextBtn = document.getElementById('next-chapter');

  if (playBtn) playBtn.addEventListener('click', () => play(Number(wpmInput.value)));
  if (pauseBtn) pauseBtn.addEventListener('click', pause);
  if (restartBtn) restartBtn.addEventListener('click', () => { index = 0; show(words[0] ?? ''); });
  if (backBtn) backBtn.addEventListener('click', () => { index = Math.max(0, index - 5); show(words[index] ?? ''); });
  if (fwdBtn) fwdBtn.addEventListener('click', () => { index = Math.min(words.length - 1, index + 5); show(words[index] ?? ''); });

  if (prevBtn) prevBtn.addEventListener('click', async () => {
    const nref = await getAdjacentReference(currentSrc, 'prev');
    if (nref) {
      setPref('lastChapterRef', nref);
      location.search = '?ref=' + encodeURIComponent(nref);
    }
  });
  if (nextBtn) nextBtn.addEventListener('click', async () => {
    const nref = await getAdjacentReference(currentSrc, 'next');
    if (nref) {
      setPref('lastChapterRef', nref);
      location.search = '?ref=' + encodeURIComponent(nref);
    }
  });

  //keyboard shortcuts!
  document.addEventListener('keydown', (e) => {
    if (e.key === ' ') {
      e.preventDefault();
      playing ? pause() : play(Number(wpmInput.value));
    }
    if (e.key === 'ArrowLeft') {
      index = Math.max(0, index - 1);
      show(words[index] ?? '');
    }
    if (e.key === 'ArrowRight') {
      index = Math.min(words.length - 1, index + 1);
      show(words[index] ?? '');
    }
    if (e.key === '+') {
      wpmInput.value = String(Math.min(1000, Number(wpmInput.value) + 25));
      if (wpmOut) wpmOut.textContent = String(wpmInput.value);
      setPref('wpm', Number(wpmInput.value));
    }
    if (e.key === '-') {
      wpmInput.value = String(Math.max(50, Number(wpmInput.value) - 25));
      if (wpmOut) wpmOut.textContent = String(wpmInput.value);
      setPref('wpm', Number(wpmInput.value));
    }
    if (e.key.toLowerCase() === 'r') {
      index = 0;
      show(words[0] ?? '');
    }
    if (e.key === '[') {
      getAdjacentReference(currentSrc, 'prev').then((nref) => {
        if (nref) {
          setPref('lastChapterRef', nref);
          location.search = '?ref=' + encodeURIComponent(nref);
        }
      });
    }
    if (e.key === ']') {
      getAdjacentReference(currentSrc, 'next').then((nref) => {
        if (nref) {
          setPref('lastChapterRef', nref);
          location.search = '?ref=' + encodeURIComponent(nref);
        }
      });
    }
  });

  // No explicit ref - offer Resume button if we have a saved last chapter
  if (!ref) {
    const lastRef = getPref('lastChapterRef');
    const holder = document.getElementById('resume-holder');
    if (lastRef && holder) {
      holder.innerHTML = '';
      const btn = document.createElement('button');
      btn.className = 'btn';
      btn.id = 'resume-last';
      btn.textContent = `Resume: ${lastRef}`;
      btn.addEventListener('click', () => {
        const url = new URL(location.href);
        url.searchParams.set('ref', lastRef);
        location.href = url.toString();
      });
      holder.appendChild(btn);
    }
    show('Select a chapter from the library.');
    return;
  }

  // Load the selected chapter
  setPref('lastChapterRef', ref);
  await reloadWords(ref);
  setControlsVisible(true);
  show(words[0] ?? '');
  setStatus(`Reading: ${ref}`);
}

async function reloadWords(ref) {
  try {
    setLoading(true);
    const data = await fetchChapter(ref);
    const raw = data.verses.join(' ').split(/\s+/);
    words = raw;
    index = 0;
  } catch (e) {
    show('Failed to load chapter.');
    setStatus('Error loading chapter. Check console/network.');
    console.error(e);
  } finally {
    setLoading(false);
  }
}
