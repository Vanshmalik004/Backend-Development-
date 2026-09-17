/**
 * ============================================================================
 * Experiment 12 B: Cookie Management & State Inspector Routes
 * ============================================================================
 * Implements:
 * - Theme cookie toggling (dark/light mode)
 * - Custom cookie creation and deletion
 * - Live State Inspector (visualizing Cookies vs Session side-by-side)
 */

const express = require('express');
const router = express.Router();

// POST /cookies/theme - Toggle or set theme preference cookie
router.post('/theme', (req, res) => {
    const currentTheme = req.cookies['theme'] || 'light';
    const newTheme = req.body.theme || (currentTheme === 'light' ? 'dark' : 'light');

    res.cookie('theme', newTheme, {
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        httpOnly: false                   // Accessible to CSS/JS for theme styling
    });

    const referer = req.get('Referer') || '/';
    res.redirect(referer);
});

// POST /cookies/custom - Set a custom user preference cookie
router.post('/custom', (req, res) => {
    const { cookieName, cookieValue, maxAgeSeconds, isHttpOnly } = req.body;

    if (cookieName && cookieValue) {
        res.cookie(cookieName.trim(), cookieValue.trim(), {
            maxAge: (parseInt(maxAgeSeconds, 10) || 300) * 1000,
            httpOnly: isHttpOnly === 'true' || isHttpOnly === true
        });
    }

    res.redirect('/inspector');
});

// POST /cookies/delete - Delete a specific cookie
router.post('/delete', (req, res) => {
    const { cookieName } = req.body;
    if (cookieName) {
        res.clearCookie(cookieName.trim());
    }
    res.redirect('/inspector');
});

// GET /inspector - Visual State Inspector page
router.get('/', (req, res) => {
    res.render('inspector', {
        title: 'State Inspector - Cookies vs Sessions',
        cookies: req.cookies,
        session: req.session,
        sessionID: req.sessionID,
        cookieExpires: req.session.cookie.maxAge ? `${req.session.cookie.maxAge / 1000}s` : 'Session'
    });
});

// GET /cookies/api - JSON representation of current client state
router.get('/api', (req, res) => {
    res.json({
        success: true,
        sessionID: req.sessionID,
        session: {
            user: req.session.user || null,
            views: req.session.views || 0,
            todosCount: (req.session.todos || []).length,
            cookieConfig: req.session.cookie
        },
        cookies: req.cookies
    });
});

module.exports = router;
