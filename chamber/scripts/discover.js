import { discoverItems } from "../data/discover.mjs";

// Navigation toggle
const menuButton = document.getElementById("menu");
const primaryNav = document.getElementById("primary-nav");

if (menuButton && primaryNav) {
    menuButton.addEventListener("click", () => {
        const isOpen = primaryNav.classList.toggle("open");
        menuButton.classList.toggle("open", isOpen);
        menuButton.setAttribute("aria-expanded", String(isOpen));
    });
}

// Footer year / last modified
const yearElement = document.getElementById("year");
const lastModifiedElement = document.getElementById("lastModified");

if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
}

if (lastModifiedElement) {
    lastModifiedElement.textContent = document.lastModified;
}

// ===============
// Last-visit message using localStorage (Assignment #11)
// ===============
const visitMessageElement = document.getElementById("visit-message");
const STORAGE_KEY = "discoverLastVisit";

if (visitMessageElement) {
    const now = Date.now();
    const previousVisit = Number(localStorage.getItem(STORAGE_KEY));

    let message = "";

    if (!previousVisit) {
        // First visit
        message = "Welcome! Let us know if you have any questions.";
    } else {
        const millisecondsInDay = 1000 * 60 * 60 * 24;
        const daysDiff = Math.floor((now - previousVisit) / millisecondsInDay);

        if (daysDiff < 1) {
            message = "Back so soon! Awesome!";
        } else if (daysDiff === 1) {
            message = "You last visited 1 day ago.";
        } else {
            message = `You last visited ${daysDiff} days ago.`;
        }
    }

    visitMessageElement.textContent = message;
    localStorage.setItem(STORAGE_KEY, String(now));
}

// ===============
// Build discover cards from JSON module data
// ===============
const grid = document.getElementById("discover-grid");

function createCard(item, index) {
    const article = document.createElement("article");
    article.classList.add("discover-card");
    // Add card1, card2, etc. for grid-area mapping
    article.classList.add(`card${index + 1}`);

    const title = document.createElement("h2");
    title.textContent = item.name;

    const figure = document.createElement("figure");
    const img = document.createElement("img");
    img.src = item.image;
    img.alt = item.alt || item.name;
    figure.appendChild(img);

    const address = document.createElement("address");
    address.textContent = item.address;

    const description = document.createElement("p");
    description.textContent = item.description;

    const button = document.createElement("button");
    button.type = "button";
    button.classList.add("learn-more-btn");
    button.textContent = "Learn more";

    // For now, simple behavior: scroll card into view or console log.
    button.addEventListener("click", () => {
        article.scrollIntoView({ behavior: "smooth", block: "center" });
    });

    article.appendChild(title);
    article.appendChild(figure);
    article.appendChild(address);
    article.appendChild(description);
    article.appendChild(button);

    return article;
}

if (grid) {
    discoverItems.forEach((item, index) => {
        const card = createCard(item, index);
        grid.appendChild(card);
    });
}
