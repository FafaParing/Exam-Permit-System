// --- 4. MODULE LOGIC: SECTIONS ---

const sections = {
    render: function () {
        const tbody = document.getElementById('sections-table-body');
        if (!tbody) return;

        let html = '';
        for (let i = 0; i < db.data.sections.length; i++) {
            const s = db.data.sections[i];
            html += ''
                + '<tr class="bg-white border-b hover:bg-slate-50">'
                + '<td class="px-6 py-4 font-medium text-slate-900">' + s.name + '</td>'
                + '<td class="px-6 py-4">' + s.course + '</td>'
                + '<td class="px-6 py-4">' + s.yearLevel + '</td>'
                + '<td class="px-6 py-4">' + s.adviser + '</td>'
                + '<td class="px-6 py-4 text-right">'
                + '<button onclick="sections.edit(' + s.id + ')" class="text-blue-600 hover:text-blue-900 mr-3"><i class="fa-solid fa-pen"></i></button>'
                + '<button onclick="sections.delete(' + s.id + ')" class="text-red-600 hover:text-red-900"><i class="fa-solid fa-trash"></i></button>'
                + '</td>'
                + '</tr>';
        }

        tbody.innerHTML = html;
    },

    openModal: function () {
        const modal = document.getElementById('section-modal');
        if (!modal) return;
        const form = modal.querySelector('form');
        form.reset();
        utils.openModal('section-modal');
    },

    edit: function (id) {
        let section = null;
        for (let i = 0; i < db.data.sections.length; i++) {
            if (db.data.sections[i].id === id) { section = db.data.sections[i]; break; }
        }
        if (!section) return;

        const modal = document.getElementById('section-modal');
        if (!modal) return;
        const f = modal.querySelector('form');

        f.id.value = section.id;
        f.name.value = section.name;
        f.course.value = section.course;
        f.yearLevel.value = section.yearLevel;

        utils.openModal('section-modal');
    },

    save: function (e) {
        e.preventDefault();
        const f = e.target;

        const data = {
            id: f.id.value ? parseInt(f.id.value, 10) : Date.now(),
            name: f.name.value,
            course: f.course.value,
            yearLevel: parseInt(f.yearLevel.value, 10),
            adviser: 'TBD' // Simplified
        };

        if (f.id.value) {
            for (let i = 0; i < db.data.sections.length; i++) {
                if (db.data.sections[i].id == f.id.value) {
                    db.data.sections[i] = data;
                    break;
                }
            }
        } else {
            db.data.sections.push(data);
        }

        db.save();
        utils.closeModal('section-modal');
        this.render();
        utils.showToast('Section saved');
    },

    delete: function (id) {
        if (!confirm('Delete section?')) return;

        const next = [];
        for (let i = 0; i < db.data.sections.length; i++) {
            if (db.data.sections[i].id !== id) next.push(db.data.sections[i]);
        }
        db.data.sections = next;
        db.save();
        this.render();
    }
};

window.sections = sections;
