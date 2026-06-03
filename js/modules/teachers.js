// --- 4. MODULE LOGIC: TEACHERS ---

const teachers = {
    render: function () {
        const tbody = document.getElementById('teachers-table-body');
        const search = document.getElementById('teacher-search');
        if (!tbody || !search) return;

        const filter = String(search.value || '').toLowerCase();
        let html = '';

        for (let i = 0; i < db.data.teachers.length; i++) {
            const t = db.data.teachers[i];
            if (String(t.name || '').toLowerCase().indexOf(filter) === -1) continue;

            html += ''
                + '<tr class="bg-white border-b hover:bg-slate-50">'
                + '<td class="px-6 py-4 font-medium text-slate-900">' + t.id + '</td>'
                + '<td class="px-6 py-4">' + t.name + '</td>'
                + '<td class="px-6 py-4">' + t.email + '</td>'
                + '<td class="px-6 py-4">' + (t.subjects || '') + '</td>'
                + '</tr>';
        }

        if (!html) {
            html = '<tr class="bg-white"><td class="px-6 py-10 text-center text-slate-500" colspan="4">No teachers found.</td></tr>';
        }

        tbody.innerHTML = html;
    }
};

window.teachers = teachers;
