/**
 * ============================================================================
 * Experiment 12 B: Part 1 - Standalone Session Management Example
 * ============================================================================
 * Demonstrates:
 * - Using 'express-session' middleware
 * - Tracking visit counts per user session via req.session.views
 * - Destroying sessions and clearing server-side state via /destroy
 */

const express = require('express');
const session = require('express-session');

const app = express();
const PORT = process.env.PORT || 3001;

// Session middleware configuration
app.use(session({
    secret: 'mysecretkey',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 600000 } // 10 minutes
}));

// Route: Visit Counter using Session
app.get('/', (req, res) => {
    if (req.session.views) {
        req.session.views++;
        res.send(`
            <h2>Session Management Demo</h2>
            <p>Welcome back! You visited <strong>${req.session.views}</strong> times.</p>
            <p>Session ID: <code>${req.sessionID}</code></p>
            <p><a href="/">Refresh to Count Visits</a> | <a href="/destroy">Destroy Session</a></p>
        `);
    } else {
        req.session.views = 1;
        res.send(`
            <h2>Session Management Demo</h2>
            <p>Welcome to the session demo! This is your first visit.</p>
            <p>Session ID: <code>${req.sessionID}</code></p>
            <p><a href="/">Refresh to Count Visits</a> | <a href="/destroy">Destroy Session</a></p>
        `);
    }
});

// Route: Destroy Session
app.get('/destroy', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).send('Error destroying session: ' + err.message);
        }
        res.send(`
            <h2>Session Destroyed</h2>
            <p>Your session has been successfully cleared on the server.</p>
            <p><a href="/">Start New Session</a></p>
        `);
    });
});

app.listen(PORT, () => {
    console.log(`[Part 1] Session Demo Server running at http://localhost:${PORT}`);
});

module.exports = app;
