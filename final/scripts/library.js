
import { fetchScriptureIndex } from './api.js';
import { getPref, setPref, getCompletedChapters } from './storage.js';
import { openModal, closeModal } from './modal.js';

const WORKS = ["All", "Old Testament", "New Testament", "Book of Mormon", "Doctrine and Covenants", "Pearl of Great Price"];

function estimateWordsByChapter() { return 700; }
function buildReference(bookName, chapterNumber) { return `${bookName} ${chapterNumber}`; }

function renderFilters(container, onFilter) {
  const bar = document.createElement('div');
  bar.className = 'filter-bar';
  WORKS.forEach(w => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'filter-btn';
    btn.textContent = w;
    btn.dataset.value = w;
    btn.addEventListener('click', () => onFilter(w));
    bar.appendChild(btn);
  });
  const holder = document.querySelector('.filter-bar-holder') || container.before(bar);
  if (holder) holder.replaceChildren(bar);
}

export async function initLibrary() {
  const listContainer = document.getElementById('chapter-list');
  const wpmInput = document.getElementById('wpm-display');
  const savedWpm = Number(getPref('wpm') ?? 250);
  if (wpmInput) { wpmInput.value = savedWpm; wpmInput.addEventListener('input', () => setPref('wpm', Number(wpmInput.value))); }

  let index;
  try { index = await fetchScriptureIndex(); }
  catch (err) { listContainer.textContent = 'Failed to load library.'; console.error(err); return; }

  let currentFilter = localStorage.getItem('workFilter') || 'All';
  renderFilters(listContainer, (val) => {
    currentFilter = val;
    localStorage.setItem('workFilter', val);
    renderBooks();
    setActiveFilter(val);
  });

  function setActiveFilter(val) {
    document.querySelectorAll('.filter-btn').forEach(b => {
      b.classList.toggle('is-active', b.dataset.value === val);
    });
  }

  function renderBooks() {
    const completed = getCompletedChapters();
    const wpm = Number(getPref('wpm') ?? 250);
    const estPerChapter = estimateWordsByChapter();
    const frag = document.createDocumentFragment();
    listContainer.innerHTML = '';

    index.collections
      .filter(c => currentFilter === 'All' || c.title === currentFilter)
      .forEach(collection => {
        collection.books.forEach(book => {
          const section = document.createElement('section');
          section.className = 'book-section';

          const h3 = document.createElement('h3');
          h3.textContent = book.name;
          section.appendChild(h3);

          const row = document.createElement('div');
          row.className = 'chapters-row';

          for (let ch = 1; ch <= book.chapterCount; ch++) {
            const ref = buildReference(book.name, ch);
            const btn = document.createElement('button');
            btn.className = 'chapter-pill';
            btn.type = 'button';
            btn.textContent = ch;
            btn.dataset.collection = collection.title;
            btn.dataset.book = book.name;
            btn.dataset.chapter = String(ch);
            btn.dataset.reference = ref;
            if (completed.has(ref)) {
              btn.classList.add('is-complete');
              btn.setAttribute('aria-pressed', 'true');
              btn.title = 'Completed';
            }
            row.appendChild(btn);
          }

          section.appendChild(row);
          frag.appendChild(section);
        });
      });

    listContainer.appendChild(frag);
  }

  renderBooks();
  setActiveFilter(currentFilter);
  localStorage.setItem('workFilter', currentFilter);

  listContainer.addEventListener('click', (e) => {
    const btn = e.target.closest('.chapter-pill');
    if (!btn) return;
    const collection = btn.dataset.collection;
    const book = btn.dataset.book;
    const chapter = Number(btn.dataset.chapter);
    const ref = btn.dataset.reference;

    const wpm = Number(getPref('wpm') ?? 250);
    const estWords = estimateWordsByChapter();
    const estMinutes = Math.max(1, Math.round(estWords / Math.max(50, wpm)));

    const modal = document.getElementById('chapter-modal');
    modal.querySelector('.modal-title').textContent = `${book} ${chapter}`;
    modal.querySelector('.modal-body').innerHTML = `
      <ul>
        <li><strong>Collection:</strong> ${collection}</li>
        <li><strong>Book:</strong> ${book}</li>
        <li><strong>Chapter:</strong> ${chapter}</li>
        <!--li><strong>Reference:</strong> ${ref}</li>
        < li><strong>Est. words (rough):</strong> ${estWords}</li -->
        <li><strong>Est. minutes @ ${wpm} wpm (rough):</strong> ${estMinutes}</li>
      </ul>
    `;
    modal.querySelector('.read-btn').onclick = () => {
      const url = new URL('reader.html', location.href);
      url.searchParams.set('ref', ref);
      window.location.href = url.toString();
    };
    openModal(modal);
    modal.querySelector('.close-btn').onclick = () => closeModal(modal);
  });
}
