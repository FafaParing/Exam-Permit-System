// NOTE:
// The app logic was split into multiple files under:
//   - ./js/core/
//   - ./js/modules/
//   - ./js/init.js
//
// This file is kept only for backward compatibility.
// main.html no longer loads it.

try {
    if (window && window.console && console.warn) {
        console.warn('app.js is deprecated. Use the scripts in ./js/core and ./js/modules.');
    }
} catch (e) {
    // ignore
}

/*

const teachers = {
                    </tr>
                `;
            }
        });
    },
    filter(mode) {
        this.filterMode = mode;
        this.render();
    }
};

const promissory = {
    currentReviewId: null,
    render() {
        const tbody = document.getElementById('promissory-table-body');
        tbody.innerHTML = db.data.promissoryNotes.map(p => {
            const s = utils.getStudent(p.studentId);
            const badgeColor = p.status === 'Approved' ? 'bg-green-100 text-green-800' : (p.status === 'Rejected' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800');
            return `
            <tr class="bg-white border-b hover:bg-slate-50">
                <td class="px-6 py-4 font-medium text-slate-900">${s.firstName} ${s.lastName}</td>
                <td class="px-6 py-4">${utils.formatCurrency(s.balance)}</td>
                <td class="px-6 py-4">${p.reason}</td>
                <td class="px-6 py-4"><span class="${badgeColor} text-xs font-medium px-2.5 py-0.5 rounded">${p.status}</span></td>
                <td class="px-6 py-4 text-right">
                    <button onclick="promissory.openReview(${p.id})" class="text-brand-600 hover:underline text-sm">Review</button>
                </td>
            </tr>
            `;
        }).join('');
    },
    openReview(id) {
        this.currentReviewId = id;
        const p = db.data.promissoryNotes.find(x => x.id === id);
        const s = utils.getStudent(p.studentId);
        const div = document.getElementById('promissory-details');
        div.innerHTML = `
            <div class="flex justify-between"><span class="text-slate-500">Student:</span> <span class="font-medium">${s.firstName} ${s.lastName}</span></div>
            <div class="flex justify-between"><span class="text-slate-500">Balance:</span> <span class="font-medium">${utils.formatCurrency(s.balance)}</span></div>
            <div class="mt-2"><span class="text-slate-500">Reason:</span> <p class="bg-slate-50 p-2 rounded mt-1">${p.reason}</p></div>
        `;
        document.getElementById('promissory-remarks').value = p.remarks || '';
        utils.openModal('promissory-review-modal');
    },
    updateStatus(status) {
        const p = db.data.promissoryNotes.find(x => x.id === this.currentReviewId);
        p.status = status;
        p.remarks = document.getElementById('promissory-remarks').value;
        db.save();
        db.log('Promissory Updated', `Note #${p.id} marked as ${status}`);
        utils.closeModal('promissory-review-modal');
        this.render();
        utils.showToast(`Note ${status}`);
    }
};

const periods = {
    render() {
        const tbody = document.getElementById('periods-table-body');
        const filtered = db.data.examPeriods.filter(p => p.semester === activeSemester);
        tbody.innerHTML = filtered.map(p => `
            <tr class="bg-white border-b hover:bg-slate-50">
                <td class="px-6 py-4 font-medium text-slate-900">${p.name}</td>
                <td class="px-6 py-4">${p.semester}</td>
                <td class="px-6 py-4">${p.startDate}</td>
                <td class="px-6 py-4">${p.endDate}</td>
                <td class="px-6 py-4">
                    <span class="${p.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-800'} text-xs font-medium px-2.5 py-0.5 rounded">${p.status}</span>
                </td>
                <td class="px-6 py-4 text-right">
                    ${p.status !== 'Active' ? `<button onclick="periods.activate(${p.id})" class="text-brand-600 hover:underline text-sm mr-2">Set Active</button>` : ''}
                    <button onclick="periods.delete(${p.id})" class="text-red-600 hover:text-red-900 text-sm"><i class="fa-solid fa-trash"></i></button>
                </td>
            </tr>
        `).join('');
    },
    openModal() {
        document.querySelector('#period-modal form').reset();
        const f = document.querySelector('#period-modal form');
        if (f && f.semester) f.semester.value = activeSemester;
        utils.openModal('period-modal');
    },
    save(e) {
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
    activate(id) {
        const p = db.data.examPeriods.find(x => x.id === id);
        if (!p) return;

        if (p.semester !== activeSemester) {
            utils.showToast('You can only activate periods in the Active Semester.', 'error');
            return;
        }

        // Only one active period per active semester; also enforce other semesters inactive
        db.data.examPeriods.forEach(period => {
            if (period.semester === activeSemester) period.status = 'Inactive';
            if (period.semester !== activeSemester) period.status = 'Inactive';
        });
        p.status = 'Active';
        db.save();
        db.log('Exam Period Activated', `${p.name} is now active`);
        this.render();
        utils.showToast(`${p.name} is now Active`);
    },
    delete(id) {
        if (confirm('Delete this period?')) {
            db.data.examPeriods = db.data.examPeriods.filter(p => p.id !== id);
            db.save();
            this.render();
        }
    }
};

const permits = {
    generateAllEligible() {
        const activePeriod = db.data.examPeriods.find(p => p.status === 'Active' && p.semester === activeSemester);
        if (!activePeriod) {
            utils.showToast('No active exam period found!', 'error');
            return;
        }

        let count = 0;
        db.data.students.forEach(s => {
            // Check if already exists for this period
            const exists = db.data.permits.find(p => p.studentId === s.id && p.periodName === activePeriod.name && p.semester === activeSemester);
            if (exists) return;

            const prom = utils.getPromissory(s.id);
            if (s.balance == 0 || (prom && prom.status === 'Approved')) {
                db.data.permits.push({
                    id: Date.now() + Math.floor(Math.random() * 1000),
                    studentId: s.id,
                    semester: activeSemester,
                    periodName: activePeriod.name,
                    validUntil: activePeriod.endDate
                });
                count++;
            }
        });

        if (count > 0) {
            db.save();
            db.log('Permits Generated', `${count} permits generated for ${activePeriod.name}`);
            this.render();
            utils.showToast(`${count} permits generated successfully`);
        } else {
            utils.showToast('No new eligible students found for permits.', 'info');
        }
    },
    render() {
        const tbody = document.getElementById('permits-table-body');
        tbody.innerHTML = db.data.permits.map(p => {
            const s = utils.getStudent(p.studentId);
            const section = utils.getSection(s.sectionId);
            return `
            <tr class="bg-white border-b hover:bg-slate-50">
                <td class="px-6 py-4 font-medium text-slate-900">#${p.id}</td>
                <td class="px-6 py-4">${s.firstName} ${s.lastName}</td>
                <td class="px-6 py-4">${section.name}</td>
                <td class="px-6 py-4">${p.periodName}</td>
                <td class="px-6 py-4">${p.validUntil}</td>
                <td class="px-6 py-4 text-right">
                    <button onclick="permits.view(${p.id})" class="bg-slate-800 text-white px-3 py-1 rounded text-xs hover:bg-slate-700"><i class="fa-solid fa-eye mr-1"></i> View</button>
                </td>
            </tr>
            `;
        }).join('');
    },
    view(id) {
        const p = db.data.permits.find(x => x.id === id);
        const s = utils.getStudent(p.studentId);
        const section = utils.getSection(s.sectionId);
        const schoolName = db.data.settings.schoolName;
        const qrData = JSON.stringify({ permitId: p.id, studentId: s.id, period: p.periodName });

        const content = document.getElementById('permit-content');
        content.innerHTML = `
            <div class="border-b-2 border-slate-800 pb-4 mb-4 text-center">
                <h4 class="text-xl font-bold uppercase tracking-widest">${schoolName}</h4>
                <p class="text-sm font-medium text-slate-600">EXAMINATION PERMIT</p>
            </div>
            <div class="text-left space-y-2 text-sm mb-6 bg-slate-50 p-4 rounded">
                <p><span class="font-bold w-20 inline-block">Name:</span> ${s.lastName}, ${s.firstName}</p>
                <p><span class="font-bold w-20 inline-block">Course:</span> ${s.course}</p>
                <p><span class="font-bold w-20 inline-block">Year:</span> ${s.yearLevel}</p>
                <p><span class="font-bold w-20 inline-block">Section:</span> ${section.name}</p>
                <p><span class="font-bold w-20 inline-block">Semester:</span> ${p.semester || activeSemester}</p>
                <p><span class="font-bold w-20 inline-block">Period:</span> ${p.periodName}</p>
                <p class="text-xs text-slate-500 italic mt-2">Valid Until: ${p.validUntil}</p>
            </div>
            <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(qrData)}" alt="QR Code" class="mx-auto border p-2 rounded">
            <p class="mt-2 text-xs text-slate-400">Permit ID: ${p.id}</p>
        `;
        utils.openModal('permit-view-modal');
    }
};

const reports = {
    render() {
        const semSelect = document.getElementById('report-semester-filter');
        const periodSelect = document.getElementById('report-period-filter');

        if (semSelect) {
            // default to active semester
            if (!semSelect.value) semSelect.value = activeSemester;
        }

        const selectedSemester = semSelect ? semSelect.value : activeSemester;

        const periodsForSemester = db.data.examPeriods.filter(p => p.semester === selectedSemester);
        if (periodSelect) {
            periodSelect.innerHTML = periodsForSemester.map(p => {
                const label = `${p.name}${p.status === 'Active' ? ' (Active)' : ''}`;
                return `<option value="${p.id}">${label}</option>`;
            }).join('') || '<option value="">No periods</option>';

            const activeInSelected = periodsForSemester.find(p => p.status === 'Active');
            const desired = periodSelect.value;
            const desiredExists = desired && periodsForSemester.some(p => String(p.id) === String(desired));
            if (!desiredExists) {
                if (activeInSelected) periodSelect.value = String(activeInSelected.id);
                else if (periodsForSemester[0]) periodSelect.value = String(periodsForSemester[0].id);
            }
        }

        const selectedPeriodId = periodSelect ? String(periodSelect.value || '') : '';
        const selectedPeriod = periodsForSemester.find(p => String(p.id) === selectedPeriodId);

        const list1 = document.getElementById('report-with-balance');
        const list2 = document.getElementById('report-cleared');

        if (!selectedPeriod) {
            if (list1) list1.innerHTML = '<li class="text-slate-400 italic">No exam period selected</li>';
            if (list2) list2.innerHTML = '<li class="text-slate-400 italic">No exam period selected</li>';
            return;
        }

        const permitsForSelection = db.data.permits
            .filter(p => p.semester === selectedSemester && p.periodName === selectedPeriod.name);

        const issuedStudentIds = new Set(permitsForSelection.map(p => String(p.studentId)));
        const eligibleNoPermit = db.data.students.filter(s => {
            const prom = utils.getPromissory(s.id);
            const isEligible = (s.balance == 0 || (prom && prom.status === 'Approved'));
            return isEligible && !issuedStudentIds.has(String(s.id));
        });

        if (list1) {
            list1.innerHTML = permitsForSelection.map(p => {
                const s = utils.getStudent(p.studentId);
                const name = s ? `${s.firstName} ${s.lastName}` : `Student ${p.studentId}`;
                return `<li>${name} — Permit #${p.id}</li>`;
            }).join('') || '<li class="text-slate-400 italic">None</li>';
        }

        if (list2) {
            list2.innerHTML = eligibleNoPermit.map(s => `<li>${s.firstName} ${s.lastName} — Eligible</li>`).join('') || '<li class="text-slate-400 italic">None</li>';
        }
    }
};

const settings = {
    render() {
        const f = document.getElementById('settings-form');
        f.schoolName.value = db.data.settings.schoolName;
        f.academicYear.value = db.data.settings.academicYear;
        if (f.activeSemester) f.activeSemester.value = db.data.settings.activeSemester || activeSemester;
    },
    save(e) {
        e.preventDefault();
        db.data.settings.schoolName = e.target.schoolName.value;
        db.data.settings.academicYear = e.target.academicYear.value;
        if (e.target.activeSemester) {
            db.data.settings.activeSemester = e.target.activeSemester.value;
            activeSemester = db.data.settings.activeSemester;

            // Enforce: only exam periods under the selected semester are shown/active
            db.data.examPeriods.forEach(p => {
                if (p.semester !== activeSemester) p.status = 'Inactive';
            });
        }
        db.save();
        utils.showToast('Settings saved');
    }
};

const auth = {
    logout() {
        if (confirm('Logout simulation?')) {
            location.reload();
        }
    }
};

// --- 5. INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    db.init();

    activeSemester = db.data.settings.activeSemester || activeSemester;

    // Set up search listeners
    document.getElementById('student-search').addEventListener('input', () => students.render());
    document.getElementById('teacher-search').addEventListener('input', () => teachers.render());

    // Mobile menu toggle
    document.getElementById('mobile-menu-btn').addEventListener('click', () => {
        document.getElementById('sidebar').classList.toggle('hidden');
    });

    // Reports filters
    const reportSem = document.getElementById('report-semester-filter');
    const reportPeriod = document.getElementById('report-period-filter');
    if (reportSem) reportSem.addEventListener('change', () => reports.render());
    if (reportPeriod) reportPeriod.addEventListener('change', () => reports.render());

    // Initial Route
    nav.to('dashboard');
});

*/
