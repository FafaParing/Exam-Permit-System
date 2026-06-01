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
                + '<td class="px-6 py-4 text-right">'
                + '<button onclick="teachers.edit(' + t.id + ')" class="text-blue-600 hover:text-blue-900 mr-3"><i class="fa-solid fa-pen"></i></button>'
                + '<button onclick="teachers.delete(' + t.id + ')" class="text-red-600 hover:text-red-900"><i class="fa-solid fa-trash"></i></button>'
                + '</td>'
                + '</tr>';
        }

        tbody.innerHTML = html;
    },

    openModal: function (id) {
        if (typeof id === 'undefined') id = null;

        const modal = document.getElementById('teacher-modal');
        if (!modal) return;
        const form = modal.querySelector('form');
        form.reset();

        modal.querySelector('input[name="id"]').value = '';

        if (id) {
            let t = null;
            for (let i = 0; i < db.data.teachers.length; i++) {
                if (db.data.teachers[i].id === id) { t = db.data.teachers[i]; break; }
            }
            if (!t) return;

            form.querySelector('[name="id"]').value = t.id;
            form.querySelector('[name="name"]').value = t.name;
            form.querySelector('[name="email"]').value = t.email;
            form.querySelector('[name="subjects"]').value = t.subjects;
        }

        utils.openModal('teacher-modal');
    },

    edit: function (id) {
        this.openModal(id);
    },

    save: function (e) {
        e.preventDefault();
        const f = e.target;
        const id = f.id.value;

        const data = {
            id: id ? parseInt(id, 10) : Date.now(),
            name: f.name.value,
            email: f.email.value,
            subjects: f.subjects.value
        };

        if (id) {
            for (let i = 0; i < db.data.teachers.length; i++) {
                if (db.data.teachers[i].id == id) {
                    db.data.teachers[i] = data;
                    break;
                }
            }
        } else {
            db.data.teachers.push(data);
        }

        db.save();
        utils.closeModal('teacher-modal');
        this.render();
        utils.showToast('Teacher saved successfully');
    },

    delete: function (id) {
        if (!confirm('Delete this teacher?')) return;

        const next = [];
        for (let i = 0; i < db.data.teachers.length; i++) {
            if (db.data.teachers[i].id !== id) next.push(db.data.teachers[i]);
        }
        db.data.teachers = next;
        db.save();
        this.render();
    }
};

window.teachers = teachers;
