// Navigation toggle
const menuButton = document.getElementById('menu');
const primaryNav = document.getElementById('primary-nav');

if (menuButton && primaryNav) {
    menuButton.addEventListener('click', () => {
        const isOpen = primaryNav.classList.toggle('open');
        menuButton.classList.toggle('open', isOpen);
        menuButton.setAttribute('aria-expanded', String(isOpen));
    });
}

// Footer dates
const yearElement = document.getElementById('year');
const lastModifiedElement = document.getElementById('lastModified');

if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
}

if (lastModifiedElement) {
    lastModifiedElement.textContent = document.lastModified;
}

// Hidden timestamp value - set when form page loads
const timestampInput = document.getElementById('timestamp');
if (timestampInput) {
    const now = new Date();
    // ISO string works well with query parameters and is easy to read later
    timestampInput.value = now.toISOString();
}

// Simple modal handling
function openModal(modal) {
    if (!modal) return;
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');

    const focusTarget =
        modal.querySelector('[data-modal-focus]') ||
        modal.querySelector('h2, h3, button, a, input, textarea, select');

    if (focusTarget) {
        focusTarget.setAttribute('tabindex', '-1');
        focusTarget.focus();
    }
}

function closeModal(modal) {
    if (!modal) return;
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
}

const modalLinks = document.querySelectorAll('[data-modal-target]');
modalLinks.forEach((link) => {
    link.addEventListener('click', (event) => {
        event.preventDefault();
        const targetId = link.getAttribute('data-modal-target');
        const modal = document.getElementById(targetId);
        openModal(modal);
    });
});

const modalCloseButtons = document.querySelectorAll('[data-modal-close]');
modalCloseButtons.forEach((button) => {
    button.addEventListener('click', () => {
        const modal = button.closest('.modal');
        closeModal(modal);
    });
});

// Close when clicking outside the modal content
document.addEventListener('click', (event) => {
    const modal = event.target.closest('.modal');
    // If click is on a visible modal background (not the inner content), close it
    if (event.target.classList.contains('modal') && modal && modal.classList.contains('open')) {
        closeModal(modal);
    }
});

// Close with Escape key
document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        document.querySelectorAll('.modal.open').forEach((modal) => closeModal(modal));
    }
});
