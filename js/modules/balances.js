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
                + '</tr>';
        }

        tbody.innerHTML = html;
    },

    filter: function (mode) {
        this.filterMode = mode;
        this.render();
    }
};

window.balances = balances;
