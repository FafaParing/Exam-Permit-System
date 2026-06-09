// Navigation & page switching controller
const nav = {
    to: function (pageId) {
        // Hide all sections
        document.querySelectorAll('.page-section').forEach(el => el.classList.remove('active'));

        // Show target section
        const target = document.getElementById(pageId);
        if (target) target.classList.add('active');

        // Update page title
        const titles = {
            dashboard: 'Dashboard', students: 'Students', teachers: 'Teachers', users: 'Users',
            promissory: 'Promissory Notes', periods: 'Exam Periods',
            permits: 'Exam Permits', 'verification-logs': 'Verification Logs', 
            settings: 'Settings'
        };
        const titleEl = document.getElementById('page-title');
        if (titleEl && titles[pageId]) titleEl.innerText = titles[pageId];

        // Refresh module data
        const pageModule = window[pageId] || (
            pageId === 'verification-logs' ? window.verificationLogs : null
        );
        
        if (pageModule && pageModule.render && typeof pageModule.render === 'function') {
            pageModule.render();
        }

        // Close mobile menu
        if (window.innerWidth < 768) {
            document.getElementById('sidebar')?.classList.add('hidden');
        }
    }
};

window.nav = nav;
