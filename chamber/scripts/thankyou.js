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

// Read query string and display required fields
const params = new URLSearchParams(window.location.search);

function getParamValue(name) {
    const value = params.get(name);
    return value && value.trim().length > 0 ? value : 'Not provided';
}

const mappedFields = [
    { param: 'firstName', elementId: 'confirm-firstName' },
    { param: 'lastName', elementId: 'confirm-lastName' },
    { param: 'email', elementId: 'confirm-email' },
    { param: 'mobile', elementId: 'confirm-mobile' },
    { param: 'organization', elementId: 'confirm-organization' },
    { param: 'timestamp', elementId: 'confirm-timestamp' }
];

mappedFields.forEach((field) => {
    const element = document.getElementById(field.elementId);
    if (element) {
        mappedFields.forEach((field) => {
            const element = document.getElementById(field.elementId);
            if (!element) return;

            let value = getParamValue(field.param);

            if (field.param === 'timestamp' && value !== 'Not provided') {
                const date = new Date(value);

                value = date.toLocaleString(undefined, {
                    dateStyle: "short",
                    timeStyle: "short"
                });
            }

            element.textContent = value;
        });

    }
});

// Personalize heading with first name if available
const thankYouName = document.getElementById('thankyou-name');
if (thankYouName) {
    const firstName = getParamValue('firstName');
    thankYouName.textContent = firstName === 'Not provided' ? 'Member' : firstName;
}
