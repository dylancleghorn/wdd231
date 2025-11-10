// Populates the <select> with section numbers.
// Named export as requested.

export function populateSections(sections) {
    const select = document.querySelector("#sectionNumber");
    select.innerHTML = ""; // clear any existing

    sections.forEach(s => {
        const opt = document.createElement("option");
        opt.value = String(s.sectionNum);
        opt.textContent = `Section ${s.sectionNum}`;
        select.appendChild(opt);
    });
}
