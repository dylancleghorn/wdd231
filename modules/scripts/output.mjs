// Renders title and sections list to the page.
// Named exports.

export function setTitle(course) {
    const h1 = document.querySelector("#courseTitle");
    h1.textContent = `${course.code} — ${course.name}`;
}

export function renderSections(sections) {
    const list = document.querySelector("#sectionsList");
    list.innerHTML = "";

    sections.forEach(s => {
        const li = document.createElement("li");

        const name = document.createElement("span");
        name.textContent = `Section ${s.sectionNum}`;

        const enrolled = document.createElement("span");
        enrolled.className = "badge";
        enrolled.textContent = `Enrolled: ${s.enrolled}`;

        const cap = document.createElement("span");
        cap.className = "cap";
        cap.textContent = `Capacity: ${s.capacity}`;

        li.appendChild(name);
        li.appendChild(enrolled);
        li.appendChild(cap);

        list.appendChild(li);
    });
}
