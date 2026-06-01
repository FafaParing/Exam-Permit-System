// --- 4. MODULE LOGIC: BALANCES ---

const balances = {
    filterMode: 'all',

    render: function () {
        const tbody = document.getElementById('balances-table-body');
        if (!tbody) return;

        let html = '';
        for (let i = 0; i < db.data.students.length; i++) {
            const s = db.data.students[i];
            const prom = utils.getPromissory(s.id);
            const isCleared = (s.balance == 0) || (prom && prom.status === 'Approved');

            let show = false;
            if (this.filterMode === 'all') show = true;
            if (this.filterMode === 'cleared' && isCleared) show = true;
            if (this.filterMode === 'with-balance' && !isCleared) show = true;

            if (!show) continue;

            html += ''
                + '<tr class="bg-white border-b hover:bg-slate-50">'
                + '<td class="px-6 py-4 font-medium text-slate-900">' + s.id + '</td>'
                + '<td class="px-6 py-4">' + s.firstName + ' ' + s.lastName + '</td>'
                + '<td class="px-6 py-4 font-mono">' + utils.formatCurrency(s.balance) + '</td>'
                + '<td class="px-6 py-4">'
                + '<span class="' + (isCleared ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50') + ' px-2 py-1 rounded text-xs font-bold">'
                + (isCleared ? 'CLEARED' : 'WITH BALANCE')
                + '</span>'
                + '</td>'
                + '<td class="px-6 py-4 text-right">'
                + '<button onclick="balances.openEditModal(\'' + String(s.id).replace(/'/g, "\\'") + '\')" class="text-brand-600 hover:underline text-sm">Edit Balance</button>'
                + '</td>'
                + '</tr>';
        }

        tbody.innerHTML = html;
    },

    filter: function (mode) {
        this.filterMode = mode;
        this.render();
    },

    openEditModal: function (id) {
        const s = utils.getStudent(id);
        if (!s) return;

        const modal = document.getElementById('balance-edit-modal');
        if (!modal) return;

        const f = modal.querySelector('form');
        f.studentId.value = s.id;
        f.newBalance.value = s.balance;
        utils.openModal('balance-edit-modal');
    },

    update: function (e) {
        e.preventDefault();

        const id = String(e.target.studentId.value || '').replace(/^\s+|\s+$/g, '');
        const newBal = parseFloat(e.target.newBalance.value);

        let student = null;
        for (let i = 0; i < db.data.students.length; i++) {
            if (String(db.data.students[i].id) === id) { student = db.data.students[i]; break; }
        }
        if (!student) return;

        student.balance = newBal;
        db.save();
        db.log('Balance Updated', 'Student ' + student.id + ' balance set to ' + newBal);
        utils.closeModal('balance-edit-modal');
        this.render();
        utils.showToast('Balance updated');
    }
};

window.balances = balances;
