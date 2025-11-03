const url = 'https://byui-cse.github.io/cse-ww-program/data/latter-day-prophets.json';

const cards = document.querySelector('#cards');

// get the data with fetch
async function getProphetData() {
    try {
        const response = await fetch(url);
        const data = await response.json();

        console.table(data.prophets);

        displayProphets(data.prophets);
    } catch (err) {
        console.error('Problem fetching prophet data:', err);
        cards.textContent = 'Could not load prophet data.';
    }
}

// builds the cards
const displayProphets = (prophets) => {
    prophets.forEach((prophet) => {
        // make elements
        let card = document.createElement('section');
        let fullName = document.createElement('h2');
        let portrait = document.createElement('img');

        fullName.textContent = `${prophet.name} ${prophet.lastname}`;

        portrait.setAttribute('src', prophet.imageurl);
        portrait.setAttribute('alt', `Portrait of ${prophet.name} ${prophet.lastname}`);
        portrait.setAttribute('loading', 'lazy');
        portrait.setAttribute('width', '340');
        portrait.setAttribute('height', '440');

        card.appendChild(fullName);
        card.appendChild(portrait);

        cards.appendChild(card);
    });
};

getProphetData();
