// --- AUTH (Simulation) ---

const auth = {
    key: 'examPortal_loggedIn',

    wasReload: function () {
        // Basic reload detection so login does NOT survive refresh
        // Old API (works in many browsers)
        if (window.performance && window.performance.navigation && window.performance.navigation.type === 1) return true;

        // Newer API
        if (window.performance && typeof window.performance.getEntriesByType === 'function') {
            const navEntries = window.performance.getEntriesByType('navigation');
            if (navEntries && navEntries[0] && navEntries[0].type === 'reload') return true;
        }

        return false;
    },

    isLoggedIn: function () {
        try {
            return sessionStorage.getItem(this.key) === '1';
        } catch (e) {
            return false;
        }
    },

    login: function (username, password) {
        // Demo rule: any non-empty values
        const u = String(username || '').replace(/^\s+|\s+$/g, '');
        const p = String(password || '').replace(/^\s+|\s+$/g, '');
        if (!u || !p) return false;

        try {
            sessionStorage.setItem(this.key, '1');
        } catch (e) { }

        return true;
    },

    logout: function () {
        try {
            sessionStorage.removeItem(this.key);
        } catch (e) { }

        window.location.href = './login.html';
    },

    requireLogin: function () {
        // If user refreshed, treat as logged out
        if (this.wasReload()) {
            try {
                sessionStorage.removeItem(this.key);
            } catch (e) { }
        }

        if (!this.isLoggedIn()) {
            window.location.href = './login.html';
            return false;
        }

        return true;
    }
};

window.auth = auth;

// Guard: app entry page should require login
// (Keep it simple: if this script is loaded on index.html/main.html, enforce it.)
try {
    const path = String(window.location.pathname || '');
    const p = path.toLowerCase();
    if (p.indexOf('index.html') !== -1 || p.indexOf('main.html') !== -1) {
        auth.requireLogin();
    }
} catch (e) { }
