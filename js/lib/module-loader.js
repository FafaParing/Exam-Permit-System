// Dynamic module loader - loads HTML fragments from partials/modules/
// Requires running via a local server (e.g., Live Server)

(function () {
    function get(url, cb) {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.onreadystatechange = function () {
            if (xhr.readyState !== 4) return;
            if ((xhr.status >= 200 && xhr.status < 300) || (xhr.status === 0 && xhr.responseText)) {
                cb(null, xhr.responseText);
                return;
            }
            cb(new Error('Failed to load: ' + url + ' (status ' + xhr.status + ')'));
        };
        xhr.send(null);
    }

    function showError(root, msg) {
        if (!root) return;
        root.innerHTML = '<div class="bg-white border border-slate-200 rounded-xl p-6">'
            + '<h3 class="text-slate-800 font-semibold mb-2">Module load error</h3>'
            + '<p class="text-slate-600 text-sm">' + msg + '</p>'
            + '<p class="text-slate-500 text-xs mt-3">Tip: Open with Live Server (http://localhost...) not file://</p>'
            + '</div>';
    }

    function loadAll(files, done) {
        const out = [];

        function next(i) {
            if (i >= files.length) {
                done(null, out.join('\n'));
                return;
            }

            get(files[i], function (err, text) {
                if (err) {
                    done(err);
                    return;
                }
                out.push(text);
                next(i + 1);
            });
        }

        next(0);
    }

    function start() {
        const root = document.getElementById('modules-root');
        if (!root) return;

        root.innerHTML = '<div class="text-slate-500 text-sm">Loading modules...</div>';

        const files = [
            './partials/modules/dashboard.html',
            './partials/modules/students.html',
            './partials/modules/teachers.html',
            './partials/modules/users.html',
            './partials/modules/promissory.html',
            './partials/modules/periods.html',
            './partials/modules/permits.html',
            './partials/modules/verification-logs.html',
            './partials/modules/reports.html',
            './partials/modules/settings.html'
        ];

        loadAll(files, function (err, html) {
            if (err) {
                showError(root, err.message);
                return;
            }
            root.innerHTML = html;
            if (window.appInit) window.appInit();
            else if (window.console && console.error) console.error('appInit() not found');
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', start);
    } else {
        start();
    }
})();
