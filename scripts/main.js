// nav function
(function () {
    const navButton = document.querySelector('#nav-button');
    const nav = document.querySelector('#site-nav');

    if (!navButton || !nav) return;

    function setNavVisibility(isOpen) {
        nav.classList.toggle('open', isOpen);
        nav.toggleAttribute('hidden', !isOpen);
        navButton.classList.toggle('show', isOpen); // swaps ☰ ↔ × via CSS
        navButton.setAttribute('aria-expanded', String(isOpen));
    }

    // Initial state
    setNavVisibility(false);

    // Toggle on click
    navButton.addEventListener('click', () => {
        const willOpen = !nav.classList.contains('open');
        setNavVisibility(willOpen);
    });

    // Close the menu when a nav link is clicked (mobile only)
    nav.addEventListener('click', (evt) => {
        const target = evt.target;
        if (target && target.tagName === 'A' && window.matchMedia('(max-width: 719px)').matches) {
            setNavVisibility(false);
        }
    });

})();

// Footer content
(function () {
    // Insert copyright symbol + year + name
    const copyrightElement = document.getElementById('copyright');
    if (copyrightElement) {
        const year = new Date().getFullYear();
        const name = "Dylan Cleghorn";
        copyrightElement.innerHTML = `&copy; ${year} — ${name} — Texas`;
    }

    // Insert last modified date
    const lastModElement = document.getElementById('lastModified');
    if (lastModElement) {
        lastModElement.textContent = new Date(document.lastModified).toLocaleString();
    }
})();

