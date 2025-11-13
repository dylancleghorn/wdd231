
export function openModal(dialog) {
  if (!dialog || typeof dialog.showModal !== 'function') return;
  dialog.showModal();
  const closeBtn = dialog.querySelector('.close-btn');
  const onEsc = (e) => { if (e.key === 'Escape') closeModal(dialog); };
  closeBtn?.addEventListener('click', () => closeModal(dialog), { once: true });
  dialog.addEventListener('keydown', onEsc, { once: true });
}
export function closeModal(dialog) {
  if (!dialog || !dialog.open) return;
  dialog.close();
}
