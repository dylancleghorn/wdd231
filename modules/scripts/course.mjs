// Holds course data and enrollment logic.
// NOTE: No DOM calls here; no renderSections inside changeEnrollment.

const byuiCourse = {
    code: "WDD 231",
    name: "Web Frontend Development I",
    sections: [
        { sectionNum: 1, enrolled: 24, capacity: 30 },
        { sectionNum: 2, enrolled: 18, capacity: 20 },
        { sectionNum: 3, enrolled: 30, capacity: 30 }
    ],

    /**
     * Enroll or drop a student in a section.
     * @param {string|number} sectionNum - section number from UI (string) or number
     * @param {boolean} enroll - true to enroll, false to drop
     */
    changeEnrollment(sectionNum, enroll = true) {
        const num = Number(sectionNum);
        const section = this.sections.find(s => s.sectionNum === num);
        if (!section) return;

        if (enroll) {
            if (section.enrolled < section.capacity) {
                section.enrolled += 1;
            }
        } else {
            if (section.enrolled > 0) {
                section.enrolled -= 1;
            }
        }

        // DO NOT call renderSections here (moved to output module).
        // (Per instructions: remove renderSections(this.sections) here.)
    }
};

export default byuiCourse;
