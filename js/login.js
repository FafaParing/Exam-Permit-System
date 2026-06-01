// Basic demo login (no persistence across refresh)

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
            if (show) errEl.classList.remove('hidden');
            else errEl.classList.add('hidden');
        }

        // If already logged in (e.g. you went back), go to app
        try {
            if (sessionStorage.getItem('examPortal_loggedIn') === '1') {
                window.location.href = './index.html';
                return;
            }
        } catch (e) { }

        form.addEventListener('submit', function (e) {
            e.preventDefault();

            const username = userEl ? userEl.value : '';
            const password = passEl ? passEl.value : '';

            const u = String(username || '').trim();
            const p = String(password || '').trim();
            const ok = (u !== '' && p !== '');

            if (!ok) {
                showError(true);
                return;
            }

            try {
                sessionStorage.setItem('examPortal_loggedIn', '1');
            } catch (err) { }

            showError(false);
            window.location.href = './index.html';
        });

        if (userEl) userEl.focus();
    });
})();
