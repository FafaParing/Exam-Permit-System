// --- 4. MODULE LOGIC: PROMISSORY NOTES ---

const promissory = {
    currentReviewId: null,

    render: function () {
        const tbody = document.getElementById('promissory-table-body');
        if (!tbody) return;

        let html = '';
        for (let i = 0; i < db.data.promissoryNotes.length; i++) {
            const p = db.data.promissoryNotes[i];
            const s = utils.getStudent(p.studentId);
            if (!s) continue;

            const badgeColor = (p.status === 'Approved')
                ? 'bg-green-100 text-green-800'
                : (p.status === 'Rejected' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800');

            html += ''
                + '<tr class="bg-white border-b hover:bg-slate-50">'
                + '<td class="px-6 py-4 font-medium text-slate-900">' + s.firstName + ' ' + s.lastName + '</td>'
                + '<td class="px-6 py-4">' + utils.formatCurrency(s.balance) + '</td>'
                + '<td class="px-6 py-4">' + p.reason + '</td>'
                + '<td class="px-6 py-4"><span class="' + badgeColor + ' text-xs font-medium px-2.5 py-0.5 rounded">' + p.status + '</span></td>'
                + '<td class="px-6 py-4 text-right">'
                + '<button onclick="promissory.openReview(' + p.id + ')" class="text-brand-600 hover:underline text-sm">Review</button>'
                + '</td>'
                + '</tr>';
        }

        tbody.innerHTML = html;
    },

    openReview: function (id) {
        this.currentReviewId = id;

        let p = null;
        for (let i = 0; i < db.data.promissoryNotes.length; i++) {
            if (db.data.promissoryNotes[i].id === id) { p = db.data.promissoryNotes[i]; break; }
        }
        if (!p) return;

        const s = utils.getStudent(p.studentId);
        if (!s) return;

        const div = document.getElementById('promissory-details');
        if (div) {
            div.innerHTML = ''
                + '<div class="flex justify-between"><span class="text-slate-500">Student:</span> <span class="font-medium">' + s.firstName + ' ' + s.lastName + '</span></div>'
                + '<div class="flex justify-between"><span class="text-slate-500">Balance:</span> <span class="font-medium">' + utils.formatCurrency(s.balance) + '</span></div>'
                + '<div class="mt-2"><span class="text-slate-500">Reason:</span> <p class="bg-slate-50 p-2 rounded mt-1">' + p.reason + '</p></div>';
        }

        const remarks = document.getElementById('promissory-remarks');
        if (remarks) remarks.value = p.remarks || '';

        utils.openModal('promissory-review-modal');
    },

    updateStatus: function (status) {
        let p = null;
        for (let i = 0; i < db.data.promissoryNotes.length; i++) {
            if (db.data.promissoryNotes[i].id === this.currentReviewId) { p = db.data.promissoryNotes[i]; break; }
        }
        if (!p) return;

        p.status = status;

        const remarks = document.getElementById('promissory-remarks');
        p.remarks = remarks ? remarks.value : '';

        db.save();
        db.log('Promissory Updated', 'Note #' + p.id + ' marked as ' + status);
        utils.closeModal('promissory-review-modal');
        this.render();
        utils.showToast('Note ' + status);
    }
};

window.promissory = promissory;
