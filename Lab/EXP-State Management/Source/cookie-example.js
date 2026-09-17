/**
 * ============================================================================
 * Experiment 12 B: Part 2 - Standalone Cookie Management Example
 * ============================================================================
 * Demonstrates:
 * - Using 'cookie-parser' middleware
 * - Setting cookies via res.cookie() with options (maxAge, httpOnly)
 * - Reading cookies sent by the browser via req.cookies
 * - Deleting/clearing cookies via res.clearCookie()
 */

const express = require('express');
const cookieParser = require('cookie-parser');

const app = express();
const PORT = process.env.PORT || 3002;

app.use(cookieParser());

// Home index explaining routes
app.get('/', (req, res) => {
    res.send(`
        <h2>Cookie Management Demo</h2>
        <ul>
            <li><a href="/set-cookie">Set Cookie (username=JohnDoe)</a></li>
            <li><a href="/get-cookie">Get Cookie</a></li>
            <li><a href="/delete-cookie">Delete Cookie</a></li>
        </ul>
        <p>Current Raw Cookies: <code>${JSON.stringify(req.cookies)}</code></p>
    `);
});

// Route: Set a cookie
app.get('/set-cookie', (req, res) => {
    res.cookie('username', 'JohnDoe', {
        maxAge: 900000, // 15 minutes
        httpOnly: true   // Protect against client-side script access
    });
    res.send(`
        <h2>Cookie Set</h2>
        <p>Cookie <code>username=JohnDoe</code> has been set for 15 minutes.</p>
        <p><a href="/get-cookie">Read Cookie</a> | <a href="/">Home</a></p>
    `);
});

// Route: Read the cookie
app.get('/get-cookie', (req, res) => {
    const user = req.cookies['username'];
    if (user) {
        res.send(`
            <h2>Cookie Retrieved</h2>
            <p>Retrieved cookie value: <strong>${user}</strong></p>
            <p><a href="/delete-cookie">Delete Cookie</a> | <a href="/">Home</a></p>
        `);
    } else {
        res.send(`
            <h2>No Cookie Found</h2>
            <p>Cookie <code>username</code> is not set or has expired.</p>
            <p><a href="/set-cookie">Set Cookie</a> | <a href="/">Home</a></p>
        `);
    }
});

// Route: Delete the cookie
app.get('/delete-cookie', (req, res) => {
    res.clearCookie('username');
    res.send(`
        <h2>Cookie Deleted</h2>
        <p>Cookie <code>username</code> has been cleared from browser.</p>
        <p><a href="/get-cookie">Verify Cookie is Gone</a> | <a href="/">Home</a></p>
    `);
});

app.listen(PORT, () => {
    console.log(`[Part 2] Cookie Demo Server running at http://localhost:${PORT}`);
});

module.exports = app;
