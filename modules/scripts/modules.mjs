// The glue file: imports + event listeners + function calls only.

import byuiCourse from "./course.mjs";
import { populateSections } from "./sections.mjs";
import { setTitle, renderSections } from "./output.mjs";

// Initial page setup
setTitle(byuiCourse);
populateSections(byuiCourse.sections);
renderSections(byuiCourse.sections);

// CHECK YOUR UNDERSTANDING: update the UI after each click
document.querySelector("#enrollStudent").addEventListener("click", function () {
    const sectionNum = document.querySelector("#sectionNumber").value;
    byuiCourse.changeEnrollment(sectionNum);
    renderSections(byuiCourse.sections); // refresh output
});

document.querySelector("#dropStudent").addEventListener("click", function () {
    const sectionNum = document.querySelector("#sectionNumber").value;
    byuiCourse.changeEnrollment(sectionNum, false);
    renderSections(byuiCourse.sections); // refresh output
});
