// --- 4. MODULE LOGIC: EXAM PERMITS ---

const permits = {
    generateAllEligible: function () {
        let activePeriod = null;
        for (let i = 0; i < db.data.examPeriods.length; i++) {
            const p = db.data.examPeriods[i];
            if (p.status === 'Active' && p.semester === activeSemester) { activePeriod = p; break; }
        }

        if (!activePeriod) {
            utils.showToast('No active exam period found!', 'error');
            return;
        }

        let count = 0;

        for (let s = 0; s < db.data.students.length; s++) {
            const student = db.data.students[s];

            // Check if already exists for this period
            let exists = false;
            for (let x = 0; x < db.data.permits.length; x++) {
                const permit = db.data.permits[x];
                if (permit.studentId === student.id && permit.periodName === activePeriod.name && permit.semester === activeSemester) {
                    exists = true;
                    break;
                }
            }
            if (exists) continue;

            const prom = utils.getPromissory(student.id);
            if (student.balance == 0 || (prom && prom.status === 'Approved')) {
                db.data.permits.push({
                    id: Date.now() + Math.floor(Math.random() * 1000),
                    studentId: student.id,
                    semester: activeSemester,
                    periodName: activePeriod.name,
                    validUntil: activePeriod.endDate
                });
                count++;
            }
        }

        if (count > 0) {
            db.save();
            db.log('Permits Generated', count + ' permits generated for ' + activePeriod.name);
            this.render();
            utils.showToast(count + ' permits generated successfully');
        } else {
            utils.showToast('No new eligible students found for permits.', 'info');
        }
    },

    render: function () {
        const tbody = document.getElementById('permits-table-body');
        if (!tbody) return;

        let html = '';
        for (let i = 0; i < db.data.permits.length; i++) {
            const p = db.data.permits[i];
            const s = utils.getStudent(p.studentId);
            if (!s) continue;
            const section = utils.getSection(s.sectionId);

            html += ''
                + '<tr class="bg-white border-b hover:bg-slate-50">'
                + '<td class="px-6 py-4 font-medium text-slate-900">#' + p.id + '</td>'
                + '<td class="px-6 py-4">' + s.firstName + ' ' + s.lastName + '</td>'
                + '<td class="px-6 py-4">' + section.name + '</td>'
                + '<td class="px-6 py-4">' + p.periodName + '</td>'
                + '<td class="px-6 py-4">' + p.validUntil + '</td>'
                + '<td class="px-6 py-4 text-right">'
                + '<button onclick="permits.view(' + p.id + ')" class="bg-slate-800 text-white px-3 py-1 rounded text-xs hover:bg-slate-700"><i class="fa-solid fa-eye mr-1"></i> View</button>'
                + '</td>'
                + '</tr>';
        }

        tbody.innerHTML = html;
    },

    view: function (id) {
        let permit = null;
        for (let i = 0; i < db.data.permits.length; i++) {
            if (db.data.permits[i].id === id) { permit = db.data.permits[i]; break; }
        }
        if (!permit) return;

        const s = utils.getStudent(permit.studentId);
        if (!s) return;

        const section = utils.getSection(s.sectionId);
        const schoolName = (db.data.settings && db.data.settings.schoolName) ? db.data.settings.schoolName : '';

        const qrData = JSON.stringify({ permitId: permit.id, studentId: s.id, period: permit.periodName });

        const content = document.getElementById('permit-content');
        if (!content) return;

        content.innerHTML = ''
            + '<div class="border-b-2 border-slate-800 pb-4 mb-4 text-center">'
            + '<h4 class="text-xl font-bold uppercase tracking-widest">' + schoolName + '</h4>'
            + '<p class="text-sm font-medium text-slate-600">EXAMINATION PERMIT</p>'
            + '</div>'
            + '<div class="text-left space-y-2 text-sm mb-6 bg-slate-50 p-4 rounded">'
            + '<p><span class="font-bold w-20 inline-block">Name:</span> ' + s.lastName + ', ' + s.firstName + '</p>'
            + '<p><span class="font-bold w-20 inline-block">Course:</span> ' + s.course + '</p>'
            + '<p><span class="font-bold w-20 inline-block">Year:</span> ' + s.yearLevel + '</p>'
            + '<p><span class="font-bold w-20 inline-block">Section:</span> ' + section.name + '</p>'
            + '<p><span class="font-bold w-20 inline-block">Semester:</span> ' + (permit.semester || activeSemester) + '</p>'
            + '<p><span class="font-bold w-20 inline-block">Period:</span> ' + permit.periodName + '</p>'
            + '<p class="text-xs text-slate-500 italic mt-2">Valid Until: ' + permit.validUntil + '</p>'
            + '</div>'
            + '<img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=' + encodeURIComponent(qrData) + '" alt="QR Code" class="mx-auto border p-2 rounded">'
            + '<p class="mt-2 text-xs text-slate-400">Permit ID: ' + permit.id + '</p>';

        utils.openModal('permit-view-modal');
    }
};

window.permits = permits;
