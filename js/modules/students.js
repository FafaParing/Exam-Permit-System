// --- 4. MODULE LOGIC: STUDENTS ---

function _trim(str) {
    return String(str || '').replace(/^\s+|\s+$/g, '');
}

function _escapeSingleQuotes(str) {
    return String(str).replace(/'/g, "\\'");
}

const students = {
    idPrefix: '02000',

    isValidStudentId: function (id) {
        return /^02000\d{6}$/.test(_trim(id));
    },

    generateId: function () {
        const existing = {};
        for (let i = 0; i < db.data.students.length; i++) {
            existing[String(db.data.students[i].id)] = true;
        }

        // Try random IDs first
        for (let tries = 0; tries < 100; tries++) {
            const rand = Math.floor(Math.random() * 1000000);
            let randStr = String(rand);
            while (randStr.length < 6) randStr = '0' + randStr;
            const candidate = this.idPrefix + randStr;
            if (!existing[candidate]) return candidate;
        }

        // Fallback: deterministic-ish based on time, with collision handling
        const base = (Date.now() % 1000000);
        for (let offset = 0; offset < 1000000; offset++) {
            const next = (base + offset) % 1000000;
            let nextStr = String(next);
            while (nextStr.length < 6) nextStr = '0' + nextStr;
            const candidate2 = this.idPrefix + nextStr;
            if (!existing[candidate2]) return candidate2;
        }

        throw new Error('Unable to generate unique Student ID');
    },

    render: function () {
        const tbody = document.getElementById('students-table-body');
        const search = document.getElementById('student-search');
        if (!tbody || !search) return;

        const filter = String(search.value || '').toLowerCase();
        let html = '';

        for (let i = 0; i < db.data.students.length; i++) {
            const s = db.data.students[i];
            const section = utils.getSection(s.sectionId);
            const prom = utils.getPromissory(s.id);
            const nameLower = (s.firstName + ' ' + s.lastName).toLowerCase();

            if (nameLower.indexOf(filter) === -1) continue;

            // Status
            let statusBadge = '<span class="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded">Not Eligible</span>';
            if (s.balance == 0 || (prom && prom.status === 'Approved')) {
                statusBadge = '<span class="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">Eligible</span>';
            }

            // Promissory status
            let promStatus = 'None';
            if (prom) {
                const color = (prom.status === 'Approved') ? 'text-green-600' : (prom.status === 'Rejected' ? 'text-red-600' : 'text-amber-600');
                promStatus = '<span class="' + color + ' font-medium">' + prom.status + '</span>';
            }

            const sid = _escapeSingleQuotes(s.id);

            html += ''
                + '<tr class="bg-white border-b hover:bg-slate-50 transition-colors">'
                + '<td class="px-6 py-4 font-medium text-slate-900">' + s.id + '</td>'
                + '<td class="px-6 py-4">' + s.firstName + ' ' + s.lastName + '</td>'
                + '<td class="px-6 py-4">' + s.course + ' / ' + s.yearLevel + '</td>'
                + '<td class="px-6 py-4">' + section.name + '</td>'
                + '<td class="px-6 py-4 font-mono">' + utils.formatCurrency(s.balance) + '</td>'
                + '<td class="px-6 py-4">' + promStatus + '</td>'
                + '<td class="px-6 py-4">' + statusBadge + '</td>'
                + '<td class="px-6 py-4 text-right">'
                + '<button onclick="students.edit(\'' + sid + '\')" class="text-blue-600 hover:text-blue-900 mr-3"><i class="fa-solid fa-pen"></i></button>'
                + '<button onclick="students.delete(\'' + sid + '\')" class="text-red-600 hover:text-red-900"><i class="fa-solid fa-trash"></i></button>'
                + '</td>'
                + '</tr>';
        }

        tbody.innerHTML = html;
    },

    openModal: function (id) {
        if (typeof id === 'undefined') id = null;

        const modal = document.getElementById('student-modal');
        if (!modal) return;

        const form = modal.querySelector('form');
        form.reset();
        modal.querySelector('input[name="id"]').value = '';

        const studentIdInput = form.querySelector('[name="studentId"]');

        // Populate sections
        const select = document.getElementById('student-section-select');
        let options = '';
        for (let i = 0; i < db.data.sections.length; i++) {
            options += '<option value="' + db.data.sections[i].id + '">' + db.data.sections[i].name + '</option>';
        }
        if (select) select.innerHTML = options;

        if (id) {
            const s = utils.getStudent(id);
            if (!s) return;

            form.querySelector('[name="id"]').value = s.id;
            studentIdInput.value = s.id;
            studentIdInput.readOnly = true;
            studentIdInput.classList.add('bg-slate-50');

            form.querySelector('[name="firstName"]').value = s.firstName;
            form.querySelector('[name="lastName"]').value = s.lastName;
            form.querySelector('[name="course"]').value = s.course;
            form.querySelector('[name="yearLevel"]').value = s.yearLevel;
            form.querySelector('[name="sectionId"]').value = s.sectionId;
            form.querySelector('[name="balance"]').value = s.balance;
        } else {
            studentIdInput.value = '';
            studentIdInput.readOnly = false;
            studentIdInput.classList.remove('bg-slate-50');
        }

        utils.openModal('student-modal');
    },

    edit: function (id) {
        this.openModal(id);
    },

    save: function (e) {
        e.preventDefault();
        const f = e.target;
        const existingId = _trim(f.id.value);

        let newId = _trim(f.studentId.value);
        if (!existingId) {
            if (!newId) newId = this.generateId();

            if (!this.isValidStudentId(newId)) {
                utils.showToast('Invalid Student ID format. Use 02000 + 6 digits.', 'error');
                return;
            }

            let isDuplicate = false;
            for (let i = 0; i < db.data.students.length; i++) {
                if (String(db.data.students[i].id) === newId) {
                    isDuplicate = true;
                    break;
                }
            }

            if (isDuplicate) {
                utils.showToast('Student ID already exists. Please use a unique ID.', 'error');
                return;
            }
        } else {
            // Keep ID immutable for existing records
            newId = existingId;
        }

        const studentData = {
            id: newId,
            firstName: f.firstName.value,
            lastName: f.lastName.value,
            course: f.course.value,
            yearLevel: parseInt(f.yearLevel.value, 10),
            sectionId: parseInt(f.sectionId.value, 10),
            balance: parseFloat(f.balance.value)
        };

        if (existingId) {
            let idx = -1;
            for (let j = 0; j < db.data.students.length; j++) {
                if (String(db.data.students[j].id) === existingId) {
                    idx = j;
                    break;
                }
            }
            if (idx >= 0) db.data.students[idx] = studentData;
            db.log('Student Updated', 'Updated ' + studentData.firstName + ' ' + studentData.lastName);
        } else {
            db.data.students.push(studentData);
            db.log('Student Added', 'Added ' + studentData.firstName + ' ' + studentData.lastName);
        }

        db.save();
        utils.closeModal('student-modal');
        this.render();
        utils.showToast('Student saved successfully');
    },

    delete: function (id) {
        if (!confirm('Are you sure you want to delete this student?')) return;

        const next = [];
        for (let i = 0; i < db.data.students.length; i++) {
            if (String(db.data.students[i].id) !== String(id)) next.push(db.data.students[i]);
        }
        db.data.students = next;
        db.save();
        this.render();
        utils.showToast('Student deleted', 'info');
    }
};

window.students = students;
