// Application initialization - called after modules are loaded
function appInit() {
    db.init();
    activeSemester = db.data.settings?.activeSemester || activeSemester;

    // Setup search listeners
    document.getElementById('student-search')?.addEventListener('input', () => students.render());
    document.getElementById('teacher-search')?.addEventListener('input', () => teachers.render());
    document.getElementById('user-search')?.addEventListener('input', () => users.render());

    // Mobile menu toggle
    document.getElementById('mobile-menu-btn')?.addEventListener('click', function () {
        document.getElementById('sidebar')?.classList.toggle('hidden');
    });

    // Reports filters
    document.getElementById('report-semester-filter')?.addEventListener('change', () => reports.render());
    document.getElementById('report-period-filter')?.addEventListener('change', () => reports.render());

    // Load initial route
    nav.to('dashboard');
}

window.appInit = appInit;
