// Login page handler - frontend authentication only
(function () {
    function onReady(fn) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', fn);
        } else {
            fn();
        }
    }

    onReady(function () {
        const form = document.getElementById('login-form');
        const userEl = document.getElementById('username');
        const passEl = document.getElementById('password');
        const errEl = document.getElementById('login-error');

        if (!form) return;

        function showError(show) {
            if (!errEl) return;
            errEl.classList[show ? 'remove' : 'add']('hidden');
        }

        // Redirect if already logged in
        try {
            if (sessionStorage.getItem('examPortal_loggedIn') === '1') {
                window.location.href = './index.html';
                return;
            }
        } catch (e) { }

        form.addEventListener('submit', function (e) {
            e.preventDefault();
            const u = (userEl?.value || '').trim();
            const p = (passEl?.value || '').trim();

            if (!u || !p) {
                showError(true);
                return;
            }

            sessionStorage.setItem('examPortal_loggedIn', '1');
            showError(false);
            window.location.href = './index.html';
        });

        userEl?.focus();
    });
})();
