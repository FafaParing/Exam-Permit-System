// --- 3. NAVIGATION & UI CONTROLLER ---

const nav = {
    to: function (pageId) {
        // Hide all sections
        const sectionEls = document.querySelectorAll('.page-section');
        for (let i = 0; i < sectionEls.length; i++) {
            sectionEls[i].classList.remove('active');
        }

        // Show target
        const target = document.getElementById(pageId);
        if (target) target.classList.add('active');

        // Update Title
        const titles = {
            dashboard: 'Dashboard',
            students: 'Students',
            teachers: 'Teachers',
            sections: 'Sections',
            balances: 'Student Balances',
            promissory: 'Promissory Notes',
            periods: 'Exam Periods',
            permits: 'Exam Permits',
            reports: 'Reports',
            settings: 'Settings'
        };

        const titleEl = document.getElementById('page-title');
        if (titleEl && titles[pageId]) titleEl.innerText = titles[pageId];

        // Refresh data for that page
        if (pageId === 'dashboard' && window.dashboard) dashboard.render();
        if (pageId === 'students' && window.students) students.render();
        if (pageId === 'teachers' && window.teachers) teachers.render();
        if (pageId === 'sections' && window.sections) window.sections.render();
        if (pageId === 'balances' && window.balances) balances.render();
        if (pageId === 'promissory' && window.promissory) promissory.render();
        if (pageId === 'periods' && window.periods) periods.render();
        if (pageId === 'permits' && window.permits) permits.render();
        if (pageId === 'reports' && window.reports) reports.render();
        if (pageId === 'settings' && window.settings) settings.render();

        // Mobile menu close
        if (window.innerWidth < 768) {
            const sidebar = document.getElementById('sidebar');
            if (sidebar) sidebar.classList.add('hidden');
        }
    }
};

window.nav = nav;
