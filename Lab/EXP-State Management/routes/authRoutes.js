/**
 * ============================================================================
 * Experiment 12 B: Authentication Routes (Exercise 1)
 * ============================================================================
 * Implements:
 * - User Registration with bcrypt password hashing
 * - User Login with Session establishment (req.session.user)
 * - Protected User Dashboard
 * - User Logout with Session destruction & cookie cleanup
 */

const express = require('express');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const { authMiddleware, guestMiddleware } = require('../middleware/auth');

const router = express.Router();
const USERS_FILE = path.join(__dirname, '..', 'data', 'users.json');

// Helper to load users
function getUsers() {
    try {
        if (!fs.existsSync(USERS_FILE)) {
            fs.writeFileSync(USERS_FILE, JSON.stringify([]));
        }
        const data = fs.readFileSync(USERS_FILE, 'utf8');
        return JSON.parse(data || '[]');
    } catch (err) {
        console.error('Error reading users file:', err);
        return [];
    }
}

// Helper to save users
function saveUsers(users) {
    try {
        fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf8');
        return true;
    } catch (err) {
        console.error('Error saving users file:', err);
        return false;
    }
}

// GET /register - Registration page
router.get('/register', guestMiddleware, (req, res) => {
    res.render('register', {
        title: 'Register - State Management Demo',
        error: req.query.error || null,
        success: null
    });
});

// POST /register - Process registration
router.post('/register', guestMiddleware, async (req, res) => {
    const { username, password, confirmPassword } = req.body;

    if (!username || !password) {
        return res.render('register', {
            title: 'Register - State Management Demo',
            error: 'Username and password are required.',
            success: null
        });
    }

    if (password.length < 6) {
        return res.render('register', {
            title: 'Register - State Management Demo',
            error: 'Password must be at least 6 characters long.',
            success: null
        });
    }

    if (confirmPassword && password !== confirmPassword) {
        return res.render('register', {
            title: 'Register - State Management Demo',
            error: 'Passwords do not match.',
            success: null
        });
    }

    const users = getUsers();
    const existing = users.find(u => u.username.toLowerCase() === username.trim().toLowerCase());

    if (existing) {
        return res.render('register', {
            title: 'Register - State Management Demo',
            error: 'Username is already taken. Please choose another.',
            success: null
        });
    }

    // Hash password with bcrypt
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser = {
        id: 'usr_' + Date.now(),
        username: username.trim(),
        password: hashedPassword,
        createdAt: new Date().toISOString()
    };

    users.push(newUser);
    saveUsers(users);

    return res.redirect('/login?msg=registered');
});

// GET /login - Login page
router.get('/login', guestMiddleware, (req, res) => {
    let message = null;
    let messageType = 'info';

    if (req.query.msg === 'registered') {
        message = 'Registration successful! You can now log in.';
        messageType = 'success';
    } else if (req.query.msg === 'logged_out') {
        message = 'You have been logged out and your session was destroyed.';
        messageType = 'info';
    } else if (req.query.msg === 'unauthorized') {
        message = 'Please log in to access that protected page.';
        messageType = 'error';
    }

    res.render('login', {
        title: 'Login - State Management Demo',
        error: req.query.error || null,
        message,
        messageType
    });
});

// POST /login - Process login
router.post('/login', guestMiddleware, async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.render('login', {
            title: 'Login - State Management Demo',
            error: 'Both username and password are required.',
            message: null,
            messageType: null
        });
    }

    const users = getUsers();
    const user = users.find(u => u.username.toLowerCase() === username.trim().toLowerCase());

    if (!user) {
        return res.render('login', {
            title: 'Login - State Management Demo',
            error: 'Invalid username or password.',
            message: null,
            messageType: null
        });
    }

    // Compare hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.render('login', {
            title: 'Login - State Management Demo',
            error: 'Invalid username or password.',
            message: null,
            messageType: null
        });
    }

    // Establish Session
    req.session.user = {
        id: user.id,
        username: user.username,
        loginTime: new Date().toISOString()
    };

    // Regenerate or save session
    req.session.save(err => {
        if (err) {
            console.error('Session save error:', err);
            return res.status(500).send('Internal server error during session creation.');
        }
        res.redirect('/dashboard');
    });
});

// GET /dashboard - Protected dashboard
router.get('/dashboard', authMiddleware, (req, res) => {
    const sessionCookie = req.cookies['connect.sid'] || 'Managed via HTTP header';
    const themeCookie = req.cookies['theme'] || 'light';

    res.render('dashboard', {
        title: 'User Dashboard - Protected State',
        user: req.session.user,
        sessionID: req.sessionID,
        views: req.session.views || 1,
        cookieExpiration: req.session.cookie.maxAge,
        theme: themeCookie,
        rawSession: JSON.stringify(req.session, null, 2)
    });
});

// GET /logout - Destroy session & clear session cookie
router.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error('Error destroying session:', err);
            return res.status(500).send('Could not log out.');
        }
        // Explicitly clear the session ID cookie from client browser
        res.clearCookie('connect.sid');
        res.redirect('/login?msg=logged_out');
    });
});

module.exports = router;
