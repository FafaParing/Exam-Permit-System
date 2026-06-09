const teachers = {

    // ✅ TOGGLE STATUS
    toggleUserStatus: function (id) {
        const teacher = db.data.teachers.find(t => t.id === id);

        if (!teacher) {
            showStatusToast("Teacher not found", "error");
            return;
        }

        if (teacher.status === "Active") {
            teacher.status = "Inactive";
            showStatusToast("Teacher deactivated", "warning");
        } else {
            teacher.status = "Active";
            showStatusToast("Teacher activated", "success");
        }

        this.render();
    },

    openAddModal: function () {
        const modal = document.getElementById('add-teacher-modal');
        if (modal) modal.classList.remove('hidden');
    },

    closeAddModal: function () {
        const modal = document.getElementById('add-teacher-modal');
        if (modal) modal.classList.add('hidden');
    },

    saveTeacher: function (event) {
        event.preventDefault();

        const firstName = document.getElementById('teacher-first-name').value.trim();
        const lastName = document.getElementById('teacher-last-name').value.trim();

        const duplicate = db.data.teachers.find(t =>
            (t.firstName || '').toLowerCase() === firstName.toLowerCase() &&
            (t.lastName || '').toLowerCase() === lastName.toLowerCase()
        );

        if (duplicate) {
            showStatusToast("Teacher already exists!", "error");
            return;
        }

        let newId = db.data.teachers.length > 0
            ? Math.max(...db.data.teachers.map(t => t.id)) + 1
            : 1;

        db.data.teachers.push({
            id: newId,
            firstName: firstName,
            lastName: lastName,
            status: "Active"
        });

        showStatusToast("Teacher added successfully!", "success");

        event.target.reset();
        this.closeAddModal();
        this.render();
    },

    render: function () {
        const tbody = document.getElementById('teachers-table-body');
        const search = document.getElementById('teacher-search');

        if (!tbody || !search) return;

        const filter = search.value.toLowerCase();
        let html = '';

        for (let i = 0; i < db.data.teachers.length; i++) {
            const t = db.data.teachers[i];

            const firstName = t.firstName || '';
            const lastName = t.lastName || '';

            const fullName = (firstName + ' ' + lastName).toLowerCase();

            if (filter && fullName.indexOf(filter) === -1) continue;

            let statusBadge =
                t.status === 'Active'
                    ? '<span class="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">Active</span>'
                    : '<span class="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded">Inactive</span>';

            const actionText = (t.status === "Active") ? "Deactivate" : "Activate";

            html += ''
                + '<tr class="bg-white border-b hover:bg-slate-50">'
                + '<td class="px-6 py-4 font-medium text-slate-900">' + t.id + '</td>'
                + '<td class="px-6 py-4">' + lastName + '</td>'
                + '<td class="px-6 py-4">' + firstName + '</td>'
                + '<td class="px-6 py-4">' + statusBadge + '</td>'
                + '<td class="px-6 py-4 text-right text-sm">'
                + '<button onclick="openConfirmModal(\'Change teacher status?\', function(){ teachers.toggleUserStatus(' + t.id + ') })"'
                + ' class="text-brand-600 hover:underline">'
                + actionText
                + '</button>'
                + '</td>'
                + '</tr>';
        }

        if (!html) {
            html = '<tr class="bg-white"><td class="px-6 py-10 text-center text-slate-500" colspan="5">No teachers found.</td></tr>';
        }

        tbody.innerHTML = html;
    }
};

window.teachers = teachers;