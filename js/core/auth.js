// Authentication - Frontend demo mode only (no backend validation)
const auth = {
    key: 'examPortal_loggedIn',

    wasReload: function () {
        if (window.performance?.navigation?.type === 1) return true;
        const navEntries = window.performance?.getEntriesByType?.('navigation');
        return navEntries?.[0]?.type === 'reload' || false;
    },

    isLoggedIn: function () {
        try {
            return sessionStorage.getItem(this.key) === '1';
        } catch (e) {
            return false;
        }
    },

    login: function (username, password) {
        const u = String(username || '').trim();
        const p = String(password || '').trim();
        if (!u || !p) return false;
        sessionStorage.setItem(this.key, '1');
        return true;
    },

    logout: function () {
        sessionStorage.removeItem(this.key);
        window.location.href = './login.html';
    },

    requireLogin: function () {
        if (this.wasReload()) {
            sessionStorage.removeItem(this.key);
        }
        if (!this.isLoggedIn()) {
            window.location.href = './login.html';
            return false;
        }
        return true;
    }
};

window.auth = auth;

// Guard: require login on index.html
try {
    const path = window.location.pathname?.toLowerCase() || '';
    if (path.includes('index.html') || path.includes('main.html')) {
        auth.requireLogin();
    }
} catch (e) { }
