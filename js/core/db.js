// Database layer - Frontend-only with mock data (no persistence)
// Data resets on page reload

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
        verificationLogs: [],
        settings: { schoolName: 'University of Tech', academicYear: '2023-2024' },
        activityLogs: []
    },

    init: function () {
        // Frontend-only mode: always use fresh mock data on each page load
        this.seed();
    },

    save: function () {
        // Frontend-only: no persistence to backend or localStorage
    },

    seed: function () {
        // Seed Initial Data - always start fresh with mock data
        this.data.sections = [
            { id: 1, name: 'A', course: 'BSIT', yearLevel: 1, adviser: 'Mr. Smith' },
            { id: 2, name: 'B', course: 'BSIT', yearLevel: 1, adviser: 'Ms. Doe' },
            { id: 3, name: 'C', course: 'BSIT', yearLevel: 1, adviser: 'Mr. Brown' }
        ];
        this.data.teachers = [
            { id: 1, name: 'Mr. Smith', email: 'smith@school.edu', subjects: 'Programming 101' },
            { id: 2, name: 'Ms. Doe', email: 'doe@school.edu', subjects: 'Data Structures' },
            { id: 3, name: 'Mr. Johnson', email: 'johnson@school.edu', subjects: 'Database Management' }
        ];
        this.data.students = [
            { id: '02000000001', firstName: 'John', lastName: 'Doe', course: 'BSIT', yearLevel: 1, sectionId: 1, balance: 0 },
            { id: '02000000002', firstName: 'Jane', lastName: 'Smith', course: 'BSIT', yearLevel: 1, sectionId: 1, balance: 5000 },
            { id: '02000000003', firstName: 'Alice', lastName: 'Johnson', course: 'BSCS', yearLevel: 2, sectionId: 2, balance: 2500 },
            { id: '02000000004', firstName: 'Bob', lastName: 'Brown', course: 'BSBA', yearLevel: 3, sectionId: 3, balance: 100 },
            { id: '02000000005', firstName: 'Emma', lastName: 'Davis', course: 'BSIT', yearLevel: 2, sectionId: 1, balance: 1200 },
            { id: '02000000006', firstName: 'Michael', lastName: 'Wilson', course: 'BSCS', yearLevel: 1, sectionId: 2, balance: 0 }
        ];
        this.data.promissoryNotes = [
            { id: 1, studentId: '02000000002', reason: 'Typhoon affected family', date: '2023-10-01', status: 'Pending', remarks: '' },
            { id: 2, studentId: '02000000005', reason: 'Financial hardship', date: '2023-10-05', status: 'Approved', remarks: 'Approved by Dean' }
        ];
        this.data.examPeriods = [
            { id: 1, name: 'Prelim', semester: '1st Semester', startDate: '2023-08-01', endDate: '2023-08-15', status: 'Inactive' },
            { id: 2, name: 'Midterm', semester: '1st Semester', startDate: '2023-10-01', endDate: '2023-10-15', status: 'Active' },
            { id: 3, name: 'Finals', semester: '1st Semester', startDate: '2023-12-01', endDate: '2023-12-15', status: 'Inactive' }
        ];
        this.data.activityLogs = [
            { timestamp: new Date().toLocaleString(), activity: 'Application Started', details: 'Frontend initialized with mock data' }
        ];
        this.data.verificationLogs = [
            { id: 1, studentName: 'John Doe', permitId: 'P001', examPeriod: 'Midterm', scannedAt: '2023-10-01 08:30:00', teacherName: 'Mr. Smith' },
            { id: 2, studentName: 'Jane Smith', permitId: 'P002', examPeriod: 'Midterm', scannedAt: '2023-10-01 09:15:00', teacherName: 'Ms. Doe' },
            { id: 3, studentName: 'Alice Johnson', permitId: 'P003', examPeriod: 'Midterm', scannedAt: '2023-10-01 10:45:00', teacherName: 'Mr. Johnson' }
        ];
    },

    log: function (activity, details) {
        // Frontend-only: logs kept in memory (not persisted)
        if (!this.data.activityLogs) this.data.activityLogs = [];
        this.data.activityLogs.unshift({ timestamp: new Date().toLocaleString(), activity: activity, details: details });
        if (this.data.activityLogs.length > 50) this.data.activityLogs.pop();
    }
};

window.db = db;
