// --- 4. MODULE LOGIC: DASHBOARD ---

const dashboard = {
    render: function () {
        const stats = {
            students: (db.data.students || []).length,
            teachers: (db.data.teachers || []).length,
            pendingPromissory: 0,
            withBalance: 0,
            cleared: 0,
            activePeriod: null
        };

        const notes = db.data.promissoryNotes || [];
        for (let i = 0; i < notes.length; i++) {
            if (notes[i].status === 'Pending') stats.pendingPromissory++;
        }

        const periods = db.data.examPeriods || [];
        for (let p = 0; p < periods.length; p++) {
            if (periods[p].status === 'Active' && periods[p].semester === activeSemester) {
                stats.activePeriod = periods[p];
                break;
            }
        }

        const students = db.data.students || [];
        for (let s = 0; s < students.length; s++) {
            const prom = utils.getPromissory(students[s].id);
            const isCleared = (students[s].balance == 0) || (prom && prom.status === 'Approved');
            if (isCleared) stats.cleared++; else stats.withBalance++;
        }

        let el;
        el = document.getElementById('dash-total-students');
        if (el) el.innerText = stats.students;
        el = document.getElementById('dash-total-teachers');
        if (el) el.innerText = stats.teachers;
        el = document.getElementById('dash-pending-promissory');
        if (el) el.innerText = stats.pendingPromissory;
        el = document.getElementById('dash-cleared');
        if (el) el.innerText = stats.cleared;
        el = document.getElementById('dash-with-balance');
        if (el) el.innerText = stats.withBalance;
        el = document.getElementById('dash-active-period');
        if (el) el.innerText = stats.activePeriod ? stats.activePeriod.name : 'None';

        const tbody = document.getElementById('activity-log-body');
        if (!tbody) return;

        const logs = db.data.activityLogs || [];
        let html = '';
        for (let l = 0; l < logs.length; l++) {
            html += ''
                + '<tr class="bg-white border-b hover:bg-slate-50">'
                + '<td class="px-6 py-4">' + logs[l].timestamp + '</td>'
                + '<td class="px-6 py-4 font-medium text-slate-900">' + logs[l].activity + '</td>'
                + '<td class="px-6 py-4">' + logs[l].details + '</td>'
                + '</tr>';
        }
        tbody.innerHTML = html;
    }
};

window.dashboard = dashboard;
