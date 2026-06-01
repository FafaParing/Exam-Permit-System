// --- 4. MODULE LOGIC: STUDENTS ---

function _trim(str) {
    return String(str || '').replace(/^\s+|\s+$/g, '');
}

function _escapeSingleQuotes(str) {
    return String(str).replace(/'/g, "\\'");
}

const students = {
    idPrefix: '02000',
    pageSize: 25,
    page: 1,
    sortKey: 'id',
    sortDir: 'asc',
    lastFilter: '',

    _safeLower: function (val) {
        return String(val == null ? '' : val).toLowerCase();
    },

    _cmp: function (a, b) {
        if (a === b) return 0;
        if (a == null && b != null) return -1;
        if (a != null && b == null) return 1;
        return (a < b) ? -1 : 1;
    },

    _setSortIndicators: function () {
        const keys = ['id', 'name', 'course', 'yearSection', 'balance', 'promissory', 'status'];

        for (let i = 0; i < keys.length; i++) {
            const el = document.getElementById('students-sort-' + keys[i]);
            if (el) el.textContent = '';
        }

        const active = document.getElementById('students-sort-' + this.sortKey);
        if (active) active.textContent = (this.sortDir === 'asc') ? '▲' : '▼';
    },

    _setPaginationUI: function (totalItems) {
        const totalPages = Math.max(1, Math.ceil(totalItems / this.pageSize));
        if (this.page > totalPages) this.page = totalPages;
        if (this.page < 1) this.page = 1;

        const start = totalItems ? ((this.page - 1) * this.pageSize + 1) : 0;
        const end = Math.min(totalItems, this.page * this.pageSize);

        const rangeEl = document.getElementById('students-range-info');
        const pageEl = document.getElementById('students-page-info');
        const prevBtn = document.getElementById('students-prev-btn');
        const nextBtn = document.getElementById('students-next-btn');

        if (rangeEl) rangeEl.textContent = totalItems ? ('Showing ' + start + '–' + end + ' of ' + totalItems) : 'No results';
        if (pageEl) pageEl.textContent = 'Page ' + this.page + ' of ' + totalPages;

        if (prevBtn) prevBtn.disabled = (this.page <= 1);
        if (nextBtn) nextBtn.disabled = (this.page >= totalPages);
    },

    sortBy: function (key) {
        if (this.sortKey === key) {
            this.sortDir = (this.sortDir === 'asc') ? 'desc' : 'asc';
        } else {
            this.sortKey = key;
            this.sortDir = 'asc';
        }
        this.page = 1;
        this.render();
    },

    prevPage: function () {
        if (this.page > 1) {
            this.page = this.page - 1;
            this.render();
        }
    },

    nextPage: function () {
        this.page = this.page + 1;
        this.render();
    },

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

        const filter = this._safeLower(search.value || '');
        if (filter !== this.lastFilter) {
            this.page = 1;
            this.lastFilter = filter;
        }

        // Filter -> sort -> paginate
        const rows = [];
        for (let i = 0; i < db.data.students.length; i++) {
            const s = db.data.students[i];
            const fullName = (s.firstName + ' ' + s.lastName);
            const nameLower = this._safeLower(fullName);
            if (filter && nameLower.indexOf(filter) === -1) continue;

            const section = utils.getSection(s.sectionId);
            const sectionName = section && section.name ? section.name : '-';
            const prom = utils.getPromissory(s.id);
            const eligible = (s.balance == 0) || (prom && prom.status === 'Approved');
            const promStatusText = prom ? String(prom.status || '') : '';

            rows.push({
                s: s,
                fullName: fullName,
                sectionName: sectionName,
                prom: prom,
                promStatusText: promStatusText,
                eligible: eligible,
                idx: i
            });
        }

        const sortKey = this.sortKey;
        const dirMult = (this.sortDir === 'asc') ? 1 : -1;
        const self = this;

        rows.sort(function (a, b) {
            let av;
            let bv;

            if (sortKey === 'id') {
                av = String(a.s.id);
                bv = String(b.s.id);
            } else if (sortKey === 'name') {
                av = self._safeLower(a.fullName);
                bv = self._safeLower(b.fullName);
            } else if (sortKey === 'course') {
                av = self._safeLower(a.s.course);
                bv = self._safeLower(b.s.course);
            } else if (sortKey === 'yearSection') {
                av = String(a.s.yearLevel) + ' ' + self._safeLower(a.sectionName);
                bv = String(b.s.yearLevel) + ' ' + self._safeLower(b.sectionName);
            } else if (sortKey === 'balance') {
                av = parseFloat(a.s.balance);
                bv = parseFloat(b.s.balance);
                if (isNaN(av)) av = 0;
                if (isNaN(bv)) bv = 0;
            } else if (sortKey === 'promissory') {
                av = self._safeLower(a.promStatusText || '');
                bv = self._safeLower(b.promStatusText || '');
            } else if (sortKey === 'status') {
                // Eligible first when ascending
                av = a.eligible ? 0 : 1;
                bv = b.eligible ? 0 : 1;
            } else {
                av = a.idx;
                bv = b.idx;
            }

            const c = self._cmp(av, bv);
            if (c !== 0) return c * dirMult;
            return self._cmp(a.idx, b.idx);
        });

        const total = rows.length;
        const totalPages = Math.max(1, Math.ceil(total / this.pageSize));
        if (this.page < 1) this.page = 1;
        if (this.page > totalPages) this.page = totalPages;

        const startIndex = (this.page - 1) * this.pageSize;
        const endIndex = Math.min(total, startIndex + this.pageSize);

        let html = '';
        for (let r = startIndex; r < endIndex; r++) {
            const row = rows[r];
            const s2 = row.s;
            const prom2 = row.prom;

            // Status
            let statusBadge = '<span class="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded">Not Eligible</span>';
            if (row.eligible) {
                statusBadge = '<span class="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">Eligible</span>';
            }

            // Promissory status
            let promStatus = 'None';
            if (prom2) {
                const color = (prom2.status === 'Approved') ? 'text-green-600' : (prom2.status === 'Rejected' ? 'text-red-600' : 'text-amber-600');
                promStatus = '<span class="' + color + ' font-medium">' + prom2.status + '</span>';
            }

            const sid = _escapeSingleQuotes(s2.id);
            html += ''
                + '<tr class="bg-white border-b hover:bg-slate-50 transition-colors">'
                + '<td class="px-6 py-4 font-medium text-slate-900">' + s2.id + '</td>'
                + '<td class="px-6 py-4">' + row.fullName + '</td>'
                + '<td class="px-6 py-4">' + s2.course + '</td>'
                + '<td class="px-6 py-4">' + s2.yearLevel + ' / ' + row.sectionName + '</td>'
                + '<td class="px-6 py-4 font-mono">' + utils.formatCurrency(s2.balance) + '</td>'
                + '<td class="px-6 py-4">' + promStatus + '</td>'
                + '<td class="px-6 py-4">' + statusBadge + '</td>'
                + '<td class="px-6 py-4 text-right">'
                + '<button onclick="students.edit(\'' + sid + '\')" class="text-blue-600 hover:text-blue-900 mr-3"><i class="fa-solid fa-pen"></i></button>'
                + '<button onclick="students.delete(\'' + sid + '\')" class="text-red-600 hover:text-red-900"><i class="fa-solid fa-trash"></i></button>'
                + '</td>'
                + '</tr>';
        }

        if (!html) {
            html = '<tr class="bg-white"><td class="px-6 py-10 text-center text-slate-500" colspan="8">No students found.</td></tr>';
        }

        tbody.innerHTML = html;
        this._setSortIndicators();
        this._setPaginationUI(total);
    },

    openModal: function (id) {
        if (typeof id === 'undefined') id = null;

        const modal = document.getElementById('student-modal');
        if (!modal) return;

        const form = modal.querySelector('form');
        form.reset();
        modal.querySelector('input[name="id"]').value = '';

        const studentIdInput = form.querySelector('[name="studentId"]');
        const balanceDisplay = document.getElementById('student-balance-display');

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
            if (balanceDisplay) balanceDisplay.textContent = utils.formatCurrency(s.balance);
        } else {
            studentIdInput.value = '';
            studentIdInput.readOnly = false;
            studentIdInput.classList.remove('bg-slate-50');

            // Balance is managed outside this system (mock/display only)
            if (balanceDisplay) balanceDisplay.textContent = utils.formatCurrency(0);
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

        // Balance is view-only in this system; preserve existing value if present.
        let preservedBalance = 0;
        if (existingId) {
            const existingStudent = utils.getStudent(existingId);
            if (existingStudent && typeof existingStudent.balance !== 'undefined' && existingStudent.balance !== null) {
                preservedBalance = parseFloat(existingStudent.balance);
                if (isNaN(preservedBalance)) preservedBalance = 0;
            }
        }

        const studentData = {
            id: newId,
            firstName: f.firstName.value,
            lastName: f.lastName.value,
            course: f.course.value,
            yearLevel: parseInt(f.yearLevel.value, 10),
            sectionId: parseInt(f.sectionId.value, 10),
            balance: preservedBalance
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
