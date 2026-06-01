// --- 5. INITIALIZATION ---
// Called by ./js/module-loader.js after the module HTML fragments are injected.

function appInit() {
    db.init();

    activeSemester = (db.data.settings && db.data.settings.activeSemester) ? db.data.settings.activeSemester : activeSemester;

    // Set up search listeners
    const studentSearch = document.getElementById('student-search');
    if (studentSearch) studentSearch.addEventListener('input', function () { students.render(); });

    const teacherSearch = document.getElementById('teacher-search');
    if (teacherSearch) teacherSearch.addEventListener('input', function () { teachers.render(); });

    // Mobile menu toggle
    const menuBtn = document.getElementById('mobile-menu-btn');
    if (menuBtn) {
        menuBtn.addEventListener('click', function () {
            const sidebar = document.getElementById('sidebar');
            if (sidebar) sidebar.classList.toggle('hidden');
        });
    }

    // Reports filters
    const reportSem = document.getElementById('report-semester-filter');
    const reportPeriod = document.getElementById('report-period-filter');
    if (reportSem) reportSem.addEventListener('change', function () { reports.render(); });
    if (reportPeriod) reportPeriod.addEventListener('change', function () { reports.render(); });

    // Initial Route
    nav.to('dashboard');
}

window.appInit = appInit;
