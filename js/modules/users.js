// --- MODULE: USERS ---

function openConfirmModal(message, onConfirm) {
    const modal = document.getElementById("confirm-modal");
    const text = document.getElementById("confirm-text");

    if (!modal || !text) return;

    text.textContent = message;
    modal.classList.remove("hidden");

    document.getElementById("confirm-yes").onclick = function () {
        modal.classList.add("hidden");
        onConfirm();
    };

    document.getElementById("confirm-no").onclick = function () {
        modal.classList.add("hidden");
    };
}

function showStatusToast(message, type = "info") {
    const toast = document.getElementById('toast');

    if (!toast) return;

    toast.textContent = message;

    let bgColor = "bg-blue-500";

    if (type === "success") bgColor = "bg-green-500";
    if (type === "error") bgColor = "bg-red-500";
    if (type === "warning") bgColor = "bg-yellow-500";

    toast.className =
        'fixed top-5 right-5 px-4 py-3 rounded-lg shadow-lg text-white z-50 ' +
        bgColor;

    toast.classList.remove('hidden');

    setTimeout(() => {
        toast.classList.add('hidden');
    }, 2500);
}

const users = {

    //  TOGGLE STATUS (ACTIVE / INACTIVE)
    toggleUserStatus: function (id) {
        const user = db.data.users.find(u => u.id === id);

        if (!user) {
            showStatusToast("User not found", "error");
            return;
        }

        if (user.status === "Active") {
            user.status = "Inactive";
            showStatusToast("User deactivated successfully", "warning");
        } else {
            user.status = "Active";
            showStatusToast("User activated successfully", "success");
        }

        this.render();
    },

    render: function () {
        const tbody = document.getElementById('users-table-body');
        const search = document.getElementById('user-search');

        if (!tbody || !search) return;

        const filter = String(search.value || '').toLowerCase();
        let html = '';

        for (let i = 0; i < db.data.users.length; i++) {
            const u = db.data.users[i];

            const searchFields = (u.name + ' ' + u.email).toLowerCase();

            if (filter && searchFields.indexOf(filter) === -1) continue;

            // ✅ STATUS BADGE
            let statusBadge =
                u.status === 'Active'
                    ? '<span class="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">Active</span>'
                    : '<span class="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded">Inactive</span>';

            // ✅ ACTION BUTTON TEXT
            const actionText = (u.status === "Active") ? "Deactivate" : "Activate";

            html += ''
                + '<tr class="bg-white border-b hover:bg-slate-50">'
                + '<td class="px-6 py-4 font-medium text-slate-900">' + u.id + '</td>'
                + '<td class="px-6 py-4">' + u.name + '</td>'
                + '<td class="px-6 py-4">' + u.email + '</td>'
                + '<td class="px-6 py-4">' + statusBadge + '</td>'
                + '<td class="px-6 py-4 text-right text-sm">'
                + '<button onclick="openConfirmModal(\'Change user status?\', function(){ users.toggleUserStatus(' + u.id + ') })"'
                + ' class="text-brand-600 hover:underline">'
                + actionText
                + '</button>'
                + '</td>'
                + '</tr>';
        }

        if (!html) {
            html = '<tr class="bg-white"><td class="px-6 py-10 text-center text-slate-500" colspan="5">No users found.</td></tr>';
        }

        tbody.innerHTML = html;
    }
};

window.users = users;