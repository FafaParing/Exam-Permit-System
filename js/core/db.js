// --- 1. DATA LAYER (Mock Backend) ---

// Global academic setting (default)
let activeSemester = '1st Semester';

function padLeft(str, len, ch) {
    str = String(str);
    while (str.length < len) str = String(ch) + str;
    return str;
}

function arrayHas(arr, value) {
    if (!arr || !arr.length) return false;
    for (let i = 0; i < arr.length; i++) {
        if (arr[i] === value) return true;
    }
    return false;
}

const db = {
    key: 'examPortal_v1',
    data: {
        students: [],
        teachers: [],
        sections: [],
        promissoryNotes: [],
        examPeriods: [],
        permits: [],
        settings: { schoolName: 'University of Tech', academicYear: '2023-2024' },
        activityLogs: []
    },

    init: function () {
        const stored = localStorage.getItem(this.key);
        if (stored) {
            this.data = JSON.parse(stored);
            const changed = this.migrateStudentIds();
            const semChanged = this.migrateSemesterData();
            if (changed || semChanged) this.save();
        } else {
            this.seed();
        }
    },

    migrateStudentIds: function () {
        function isValid(id) {
            return /^02000\d{6}$/.test(String(id).replace(/^\s+|\s+$/g, ''));
        }

        const studentsArr = (this.data.students && this.data.students.length) ? this.data.students : [];
        const promArr = (this.data.promissoryNotes && this.data.promissoryNotes.length) ? this.data.promissoryNotes : [];
        const permitsArr = (this.data.permits && this.data.permits.length) ? this.data.permits : [];

        const existing = {};
        for (let i = 0; i < studentsArr.length; i++) {
            const sid = String(studentsArr[i].id);
            if (isValid(sid)) existing[sid] = true;
        }

        const mapping = {};
        let mutated = false;

        for (let j = 0; j < studentsArr.length; j++) {
            const student = studentsArr[j];
            const oldId = String(student.id).replace(/^\s+|\s+$/g, '');
            if (isValid(oldId)) continue;

            const digitsOnly = /^\d+$/.test(oldId) ? oldId : '';
            let base6 = (digitsOnly ? digitsOnly.slice(-6) : String(Date.now() % 1000000));
            base6 = padLeft(base6, 6, '0');

            let offset = 0;
            let candidate = '02000' + base6;
            while (existing[candidate]) {
                offset++;
                const next = (parseInt(base6, 10) + offset) % 1000000;
                candidate = '02000' + padLeft(String(next), 6, '0');
            }

            existing[candidate] = true;
            mapping[oldId] = candidate;
            student.id = candidate;
            mutated = true;
        }

        // If no mapping, only student objects were potentially cleaned.
        let mappingKeys = 0;
        for (const k in mapping) {
            if (Object.prototype.hasOwnProperty.call(mapping, k)) {
                mappingKeys++;
                break;
            }
        }
        if (mappingKeys === 0) return mutated;

        for (let p = 0; p < promArr.length; p++) {
            const note = promArr[p];
            const oldRef = String(note.studentId).replace(/^\s+|\s+$/g, '');
            if (mapping[oldRef]) {
                note.studentId = mapping[oldRef];
                mutated = true;
            }
        }

        for (let q = 0; q < permitsArr.length; q++) {
            const permit = permitsArr[q];
            const oldPermitRef = String(permit.studentId).replace(/^\s+|\s+$/g, '');
            if (mapping[oldPermitRef]) {
                permit.studentId = mapping[oldPermitRef];
                mutated = true;
            }
        }

        return mutated;
    },

    migrateSemesterData: function () {
        const semesters = ['1st Semester', '2nd Semester', 'Summer'];
        let mutated = false;

        if (!this.data.settings || typeof this.data.settings !== 'object') {
            this.data.settings = { schoolName: 'University of Tech', academicYear: '2023-2024' };
            mutated = true;
        }

        if (!this.data.settings.activeSemester || !arrayHas(semesters, this.data.settings.activeSemester)) {
            this.data.settings.activeSemester = '1st Semester';
            mutated = true;
        }

        if (!this.data.examPeriods || !this.data.examPeriods.length) this.data.examPeriods = [];
        if (!this.data.permits || !this.data.permits.length) this.data.permits = [];

        for (let i = 0; i < this.data.examPeriods.length; i++) {
            const period = this.data.examPeriods[i];
            if (!period.semester || !arrayHas(semesters, period.semester)) {
                period.semester = this.data.settings.activeSemester;
                mutated = true;
            }
        }

        // Enforce: only exam periods under the active semester can be active
        for (let j = 0; j < this.data.examPeriods.length; j++) {
            const period2 = this.data.examPeriods[j];
            if (period2.status === 'Active' && period2.semester !== this.data.settings.activeSemester) {
                period2.status = 'Inactive';
                mutated = true;
            }
        }

        // Ensure permits carry semester info (best-effort for existing data)
        for (let k = 0; k < this.data.permits.length; k++) {
            const permit = this.data.permits[k];
            if (!permit.semester || !arrayHas(semesters, permit.semester)) {
                let matching = null;
                for (let m = 0; m < this.data.examPeriods.length; m++) {
                    const ep = this.data.examPeriods[m];
                    if (ep.name === permit.periodName && ep.semester) {
                        matching = ep;
                        break;
                    }
                }
                permit.semester = matching ? matching.semester : this.data.settings.activeSemester;
                mutated = true;
            }
        }

        return mutated;
    },

    save: function () {
        localStorage.setItem(this.key, JSON.stringify(this.data));
    },

    seed: function () {
        // Seed Initial Data
        this.data.sections = [
            { id: 1, name: 'BSIT-1A', course: 'BSIT', yearLevel: 1, adviser: 'Mr. Smith' },
            { id: 2, name: 'BSCS-2A', course: 'BSCS', yearLevel: 2, adviser: 'Ms. Doe' },
            { id: 3, name: 'BSBA-3A', course: 'BSBA', yearLevel: 3, adviser: 'Mr. Brown' }
        ];
        this.data.teachers = [
            { id: 1, name: 'Mr. Smith', email: 'smith@school.edu', subjects: 'Programming 101' },
            { id: 2, name: 'Ms. Doe', email: 'doe@school.edu', subjects: 'Data Structures' }
        ];
        this.data.students = [
            { id: '02000000001', firstName: 'John', lastName: 'Doe', course: 'BSIT', yearLevel: 1, sectionId: 1, balance: 0 },
            { id: '02000000002', firstName: 'Jane', lastName: 'Smith', course: 'BSIT', yearLevel: 1, sectionId: 1, balance: 5000 },
            { id: '02000000003', firstName: 'Alice', lastName: 'Johnson', course: 'BSCS', yearLevel: 2, sectionId: 2, balance: 2500 },
            { id: '02000000004', firstName: 'Bob', lastName: 'Brown', course: 'BSBA', yearLevel: 3, sectionId: 3, balance: 100 }
        ];
        this.data.promissoryNotes = [
            { id: 1, studentId: '02000000002', reason: 'Typhoon affected family', date: '2023-10-01', status: 'Pending', remarks: '' }
        ];
        this.data.examPeriods = [
            { id: 1, name: 'Prelim', semester: '1st Semester', startDate: '2023-08-01', endDate: '2023-08-15', status: 'Inactive' },
            { id: 2, name: 'Midterm', semester: '1st Semester', startDate: '2023-10-01', endDate: '2023-10-15', status: 'Active' }
        ];
        this.data.activityLogs = [
            { timestamp: new Date().toLocaleString(), activity: 'System Initialized', details: 'Seed data loaded' }
        ];
        this.save();
    },

    log: function (activity, details) {
        if (!this.data.activityLogs) this.data.activityLogs = [];
        this.data.activityLogs.unshift({ timestamp: new Date().toLocaleString(), activity: activity, details: details });
        if (this.data.activityLogs.length > 50) this.data.activityLogs.pop(); // Keep only last 50
        this.save();
    }
};

window.db = db;
