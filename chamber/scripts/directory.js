const navBtn = document.getElementById('menu')
const nav = document.getElementById('primary-nav')
navBtn.addEventListener('click', () => {
    nav.classList.toggle('open')
    navBtn.classList.toggle('open')


})

// Footer dates
document.getElementById('year').textContent = new Date().getFullYear()
document.getElementById('lastModified').textContent = document.lastModified

// View toggle
const membersEl = document.getElementById('members')
const gridBtn = document.getElementById('gridBtn')
const listBtn = document.getElementById('listBtn')

function setView(view) {
    const isGrid = view === 'grid'
    membersEl.classList.toggle('list', !isGrid)

    if (isGrid) {
        gridBtn.classList.add('active')
        listBtn.classList.remove('active')
    } else {
        gridBtn.classList.remove('active')
        listBtn.classList.add('active')
    }


}

gridBtn.addEventListener('click', () => setView('grid'))
listBtn.addEventListener('click', () => setView('list'))

document.addEventListener('DOMContentLoaded', () => setView('grid'))

// prefer grid view for smaller screens
window.addEventListener("resize", () => {
    if (window.innerWidth < 700) {
        setView('grid')
    }
});


// Load members
async function loadMembers() {
    const res = await fetch('data/members.json')
    const data = await res.json()

    renderMembers(data)
}

function badge(level) {
    if (level === 3) return 'badge gold'
    if (level === 2) return 'badge silver'
    return 'badge member'
}

function levelText(level) {
    if (level === 3) return 'Gold'
    if (level === 2) return 'Silver'
    return 'Member'
}

function makeCard(m) {
    const card = document.createElement('article')
    card.className = 'member'

    const head = document.createElement('header')
    const img = document.createElement('img')
    img.src = m.image || 'https://placehold.co/100x100'
    img.alt = m.name
    const name = document.createElement('h3')
    name.textContent = m.name
    head.append(img, name)

    const meta = document.createElement('div')
    meta.className = 'meta'
    meta.innerHTML = `
        <p>${m.address}</p>
        <p>${m.phone}</p>
        <a href="${m.website}" target="_blank">${m.website}</a>
        <span class="${badge(m.level)}">${levelText(m.level)}</span>
    `
    card.append(head, meta)
    return card
}

function renderMembers(list) {
    membersEl.innerHTML = ''
    list.forEach(m => membersEl.appendChild(makeCard(m)))
}

loadMembers()
