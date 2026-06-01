// --- 4. MODULE LOGIC: EXAM PERIODS ---

const periods = {
    render: function () {
        const tbody = document.getElementById('periods-table-body');
        if (!tbody) return;

        let html = '';
        for (let i = 0; i < db.data.examPeriods.length; i++) {
            const p = db.data.examPeriods[i];
            if (p.semester !== activeSemester) continue;

            html += ''
                + '<tr class="bg-white border-b hover:bg-slate-50">'
                + '<td class="px-6 py-4 font-medium text-slate-900">' + p.name + '</td>'
                + '<td class="px-6 py-4">' + p.semester + '</td>'
                + '<td class="px-6 py-4">' + p.startDate + '</td>'
                + '<td class="px-6 py-4">' + p.endDate + '</td>'
                + '<td class="px-6 py-4">'
                + '<span class="' + (p.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-800') + ' text-xs font-medium px-2.5 py-0.5 rounded">' + p.status + '</span>'
                + '</td>'
                + '<td class="px-6 py-4 text-right">'
                + (p.status !== 'Active' ? '<button onclick="periods.activate(' + p.id + ')" class="text-brand-600 hover:underline text-sm mr-2">Set Active</button>' : '')
                + '<button onclick="periods.delete(' + p.id + ')" class="text-red-600 hover:text-red-900 text-sm"><i class="fa-solid fa-trash"></i></button>'
                + '</td>'
                + '</tr>';
        }

        tbody.innerHTML = html;
    },

    openModal: function () {
        const modal = document.getElementById('period-modal');
        if (!modal) return;

        const f = modal.querySelector('form');
        f.reset();
        if (f && f.semester) f.semester.value = activeSemester;

        utils.openModal('period-modal');
    },

    save: function (e) {
        e.preventDefault();
        const f = e.target;

        const data = {
            id: Date.now(),
            name: f.name.value,
            semester: f.semester.value,
            startDate: f.startDate.value,
            endDate: f.endDate.value,
            status: 'Inactive'
        };

        db.data.examPeriods.push(data);
        db.save();
        utils.closeModal('period-modal');
        this.render();
        utils.showToast('Period added');
    },

    activate: function (id) {
        let p = null;
        for (let i = 0; i < db.data.examPeriods.length; i++) {
            if (db.data.examPeriods[i].id === id) { p = db.data.examPeriods[i]; break; }
        }
        if (!p) return;

        if (p.semester !== activeSemester) {
            utils.showToast('You can only activate periods in the Active Semester.', 'error');
            return;
        }

        // Only one active period per active semester; also enforce other semesters inactive
        for (let j = 0; j < db.data.examPeriods.length; j++) {
            db.data.examPeriods[j].status = 'Inactive';
        }

        p.status = 'Active';
        db.save();
        db.log('Exam Period Activated', p.name + ' is now active');
        this.render();
        utils.showToast(p.name + ' is now Active');
    },

    delete: function (id) {
        if (!confirm('Delete this period?')) return;

        const next = [];
        for (let i = 0; i < db.data.examPeriods.length; i++) {
            if (db.data.examPeriods[i].id !== id) next.push(db.data.examPeriods[i]);
        }
        db.data.examPeriods = next;
        db.save();
        this.render();
    }
};

window.periods = periods;
