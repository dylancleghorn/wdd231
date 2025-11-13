
import { initLibrary } from './library.js';
import { initReader } from './reader.js';
import { getPref, setPref } from './storage.js';

// mobile nav
const navToggle = () => {
  const btn = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.site-nav');
  if (!btn || !nav) return;
  btn.addEventListener('click', () => {
    const expanded = nav.getAttribute('aria-expanded') === 'true';
    nav.setAttribute('aria-expanded', String(!expanded));
    btn.setAttribute('aria-expanded', String(!expanded));
  });
};

function initHome() {
  const form = document.getElementById('goal-form');
  const wpmEl = document.getElementById('goal-wpm');
  const textEl = document.getElementById('goal-text');

  // Prefill from localStorage (default WPM = 600)
  try {
    const saved = JSON.parse(localStorage.getItem('goal') || 'null');
    if (saved) {
      if (wpmEl) wpmEl.value = saved.wpm ?? 600;
      if (textEl) textEl.value = saved.text || '';
    } else {
      if (wpmEl) wpmEl.value = 600;
    }
  } catch {
    if (wpmEl) wpmEl.value = 600;
  }

  // On submit: persist to localStorage, then let browser navigate to thanks.html
  if (form) {
    form.addEventListener('submit', () => {
      const payload = {
        wpm: Number(wpmEl?.value || 600),
        text: (textEl?.value || '').trim(),
        savedAt: new Date().toISOString()
      };
      localStorage.setItem('goal', JSON.stringify(payload));
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  navToggle();
  const page = document.body.dataset.page;
  if (page === 'home') initHome();
  if (page === 'library') initLibrary();
  if (page === 'reader') initReader();
});
