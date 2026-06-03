// Verification Logs - Records of QR code scans at exam entries

const verificationLogs = {
    render: function () {
        const tbody = document.getElementById('verification-logs-table-body');
        if (!tbody) return;

        const logs = db.data.verificationLogs || [];
        if (logs.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="px-6 py-8 text-center text-slate-500">No verification logs yet</td></tr>';
        } else {
            tbody.innerHTML = logs.map(log => `
                <tr class="bg-white border-b hover:bg-slate-50">
                    <td class="px-6 py-4 font-medium text-slate-900">${log.studentName}</td>
                    <td class="px-6 py-4 font-mono text-sm">${log.permitId}</td>
                    <td class="px-6 py-4">${log.examPeriod}</td>
                    <td class="px-6 py-4 text-sm">${log.scannedAt}</td>
                    <td class="px-6 py-4">${log.teacherName}</td>
                </tr>
            `).join('');
        }

        // Update stats
        this.updateStats();
    },

    updateStats: function () {
        const logs = db.data.verificationLogs || [];
        
        // Total scans
        const totalEl = document.getElementById('total-scans');
        if (totalEl) totalEl.innerText = logs.length;

        // Today's scans
        const today = new Date().toLocaleDateString();
        const todayScans = logs.filter(log => {
            const logDate = new Date(log.scannedAt).toLocaleDateString();
            return logDate === today;
        }).length;
        const todayEl = document.getElementById('today-scans');
        if (todayEl) todayEl.innerText = todayScans;

        // Unique students
        const uniqueStudents = new Set(logs.map(log => log.studentName)).size;
        const uniqueEl = document.getElementById('unique-students');
        if (uniqueEl) uniqueEl.innerText = uniqueStudents;
    }
};

window.verificationLogs = verificationLogs;
