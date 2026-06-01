// --- 2. UTILITY FUNCTIONS ---

const utils = {
    formatCurrency: function (num) {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(num);
    },

    downloadCSV: function (kind) {
        // kind: 'balance' (issued permits) or 'cleared' (eligible no permit)
        const semSelect = document.getElementById('report-semester-filter');
        const periodSelect = document.getElementById('report-period-filter');

        const selectedSemester = semSelect ? String(semSelect.value || activeSemester) : activeSemester;

        // Find selected period
        const periodsForSemester = [];
        for (let i = 0; i < (db.data.examPeriods || []).length; i++) {
            if (db.data.examPeriods[i].semester === selectedSemester) periodsForSemester.push(db.data.examPeriods[i]);
        }

        let selectedPeriod = null;
        const selectedPeriodId = periodSelect ? String(periodSelect.value || '') : '';
        for (let j = 0; j < periodsForSemester.length; j++) {
            if (String(periodsForSemester[j].id) === selectedPeriodId) {
                selectedPeriod = periodsForSemester[j];
                break;
            }
        }

        if (!selectedPeriod) {
            this.showToast('No exam period selected for export.', 'info');
            return;
        }

        function csvEscape(val) {
            let s = String(val == null ? '' : val);
            // Escape double quotes and wrap in quotes
            s = s.replace(/"/g, '""');
            return '"' + s + '"';
        }

        const rows = [];
        let filename = 'report.csv';

        if (kind === 'balance') {
            filename = 'generated-permits.csv';
            rows.push(['Student ID', 'Student Name', 'Permit ID', 'Semester', 'Period', 'Valid Until']);

            for (let a = 0; a < (db.data.permits || []).length; a++) {
                const p = db.data.permits[a];
                if (p.semester !== selectedSemester) continue;
                if (p.periodName !== selectedPeriod.name) continue;

                const s = this.getStudent(p.studentId);
                const name = s ? (s.firstName + ' ' + s.lastName) : ('Student ' + p.studentId);
                rows.push([
                    p.studentId,
                    name,
                    p.id,
                    p.semester,
                    p.periodName,
                    p.validUntil
                ]);
            }
        } else {
            filename = 'eligible-no-permit.csv';
            rows.push(['Student ID', 'Student Name', 'Semester', 'Period']);

            // issued ids
            const issued = {};
            for (let b = 0; b < (db.data.permits || []).length; b++) {
                const pp = db.data.permits[b];
                if (pp.semester === selectedSemester && pp.periodName === selectedPeriod.name) {
                    issued[String(pp.studentId)] = true;
                }
            }

            for (let c = 0; c < (db.data.students || []).length; c++) {
                const student = db.data.students[c];
                const prom = this.getPromissory(student.id);
                const isEligible = (student.balance == 0) || (prom && prom.status === 'Approved');

                if (!isEligible) continue;
                if (issued[String(student.id)]) continue;

                rows.push([
                    student.id,
                    student.firstName + ' ' + student.lastName,
                    selectedSemester,
                    selectedPeriod.name
                ]);
            }
        }

        // Build CSV
        let csv = '';
        for (let r = 0; r < rows.length; r++) {
            const line = [];
            for (let col = 0; col < rows[r].length; col++) {
                line.push(csvEscape(rows[r][col]));
            }
            csv += line.join(',') + '\n';
        }

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        setTimeout(function () {
            try { URL.revokeObjectURL(url); } catch (e) { }
        }, 1000);
    },

    getSection: function (id) {
        const sections = (db.data && db.data.sections) ? db.data.sections : [];
        for (let i = 0; i < sections.length; i++) {
            if (sections[i].id == id) return sections[i];
        }
        return { name: 'Unassigned' };
    },

    getStudent: function (id) {
        const students = (db.data && db.data.students) ? db.data.students : [];
        for (let i = 0; i < students.length; i++) {
            if (String(students[i].id) == String(id)) return students[i];
        }
        return null;
    },

    getPromissory: function (studentId) {
        const notes = (db.data && db.data.promissoryNotes) ? db.data.promissoryNotes : [];
        for (let i = 0; i < notes.length; i++) {
            if (String(notes[i].studentId) == String(studentId)) return notes[i];
        }
        return null;
    },

    showToast: function (msg, type) {
        if (!type) type = 'success';
        const container = document.getElementById('toast-container');
        if (!container) return;

        const el = document.createElement('div');
        const colors = (type === 'success') ? 'bg-green-600' : (type === 'error' ? 'bg-red-600' : 'bg-blue-600');
        const iconClass = (type === 'success') ? 'fa-check' : 'fa-info-circle';

        el.className = 'toast mb-3 p-4 rounded-lg shadow-lg text-white font-medium text-sm flex items-center ' + colors;
        el.innerHTML = '<i class="fa-solid ' + iconClass + ' mr-3"></i> ' + msg;
        container.appendChild(el);

        // Trigger animation
        setTimeout(function () { el.classList.add('show'); }, 10);
        setTimeout(function () {
            el.classList.remove('show');
            setTimeout(function () { el.remove(); }, 300);
        }, 3000);
    },

    openModal: function (id) {
        const overlay = document.getElementById('modal-overlay');
        if (overlay) {
            overlay.classList.remove('hidden');
            setTimeout(function () { overlay.classList.remove('opacity-0'); }, 10);
        }

        const modal = document.getElementById(id);
        if (modal) {
            modal.classList.remove('hidden');
            setTimeout(function () { modal.classList.remove('scale-95'); }, 10);
        }
    },

    closeModal: function (id) {
        const modal = document.getElementById(id);
        if (modal) modal.classList.add('scale-95');

        setTimeout(function () {
            if (modal) modal.classList.add('hidden');
            const overlay = document.getElementById('modal-overlay');
            if (!overlay) return;
            overlay.classList.add('opacity-0');
            setTimeout(function () { overlay.classList.add('hidden'); }, 300);
        }, 150);
    }
};

window.utils = utils;
