// --- 4. MODULE LOGIC: REPORTS ---

const reports = {
    render: function () {
        const semSelect = document.getElementById('report-semester-filter');
        const periodSelect = document.getElementById('report-period-filter');

        if (semSelect) {
            // default to active semester
            if (!semSelect.value) semSelect.value = activeSemester;
        }

        const selectedSemester = semSelect ? semSelect.value : activeSemester;

        const periodsForSemester = [];
        for (let i = 0; i < db.data.examPeriods.length; i++) {
            if (db.data.examPeriods[i].semester === selectedSemester) periodsForSemester.push(db.data.examPeriods[i]);
        }

        if (periodSelect) {
            let options = '';
            for (let j = 0; j < periodsForSemester.length; j++) {
                const p = periodsForSemester[j];
                const label = p.name + (p.status === 'Active' ? ' (Active)' : '');
                options += '<option value="' + p.id + '">' + label + '</option>';
            }
            periodSelect.innerHTML = options || '<option value="">No periods</option>';

            // Keep selected if it exists; otherwise pick active or first
            const desired = String(periodSelect.value || '');
            let desiredExists = false;
            for (let k = 0; k < periodsForSemester.length; k++) {
                if (String(periodsForSemester[k].id) === desired) { desiredExists = true; break; }
            }

            if (!desiredExists) {
                let activeInSelected = null;
                for (let m = 0; m < periodsForSemester.length; m++) {
                    if (periodsForSemester[m].status === 'Active') { activeInSelected = periodsForSemester[m]; break; }
                }

                if (activeInSelected) periodSelect.value = String(activeInSelected.id);
                else if (periodsForSemester[0]) periodSelect.value = String(periodsForSemester[0].id);
            }
        }

        const selectedPeriodId = periodSelect ? String(periodSelect.value || '') : '';
        let selectedPeriod = null;
        for (let n = 0; n < periodsForSemester.length; n++) {
            if (String(periodsForSemester[n].id) === selectedPeriodId) { selectedPeriod = periodsForSemester[n]; break; }
        }

        const list1 = document.getElementById('report-with-balance');
        const list2 = document.getElementById('report-cleared');

        if (!selectedPeriod) {
            if (list1) list1.innerHTML = '<li class="text-slate-400 italic">No exam period selected</li>';
            if (list2) list2.innerHTML = '<li class="text-slate-400 italic">No exam period selected</li>';
            return;
        }

        const permitsForSelection = [];
        for (let a = 0; a < db.data.permits.length; a++) {
            const permit = db.data.permits[a];
            if (permit.semester === selectedSemester && permit.periodName === selectedPeriod.name) permitsForSelection.push(permit);
        }

        const issuedStudentIds = {};
        for (let b = 0; b < permitsForSelection.length; b++) {
            issuedStudentIds[String(permitsForSelection[b].studentId)] = true;
        }

        const eligibleNoPermit = [];
        for (let c = 0; c < db.data.students.length; c++) {
            const student = db.data.students[c];
            const prom = utils.getPromissory(student.id);
            const isEligible = (student.balance == 0) || (prom && prom.status === 'Approved');

            if (isEligible && !issuedStudentIds[String(student.id)]) eligibleNoPermit.push(student);
        }

        if (list1) {
            let html1 = '';
            for (let d = 0; d < permitsForSelection.length; d++) {
                const p2 = permitsForSelection[d];
                const s2 = utils.getStudent(p2.studentId);
                const name = s2 ? (s2.firstName + ' ' + s2.lastName) : ('Student ' + p2.studentId);
                html1 += '<li>' + name + ' — Permit #' + p2.id + '</li>';
            }
            list1.innerHTML = html1 || '<li class="text-slate-400 italic">None</li>';
        }

        if (list2) {
            let html2 = '';
            for (let e = 0; e < eligibleNoPermit.length; e++) {
                const s3 = eligibleNoPermit[e];
                html2 += '<li>' + s3.firstName + ' ' + s3.lastName + ' — Eligible</li>';
            }
            list2.innerHTML = html2 || '<li class="text-slate-400 italic">None</li>';
        }
    }
};

window.reports = reports;
