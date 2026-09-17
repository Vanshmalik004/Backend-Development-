/**
 * ============================================================================
 * Experiment 12 B (Optional): State Management (Sessions & Cookies in Node.js)
 * Main Application Server
 * ============================================================================
 */

const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const morgan = require('morgan');

// Import Route Handlers
const authRoutes = require('./routes/authRoutes');
const todoRoutes = require('./routes/todoRoutes');
const cookieRoutes = require('./routes/cookieRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// 1. Template Engine Setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// 2. Core Middleware
app.use(morgan('dev'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

// 3. Session Middleware Configuration
app.use(session({
    name: 'connect.sid',                         // Session cookie name
    secret: 'upes-backend-state-secret-2026',    // Key used to sign session ID
    resave: false,                               // Do not save session if unmodified
    saveUninitialized: false,                    // Do not create session until something is stored
    cookie: {
        maxAge: 30 * 60 * 1000,                  // 30 minutes in milliseconds
        httpOnly: true,                          // Prevents client-side JS from reading cookie
        secure: false,                           // Set to true in production over HTTPS
        sameSite: 'lax'
    }
}));

// 4. Global State Middleware & Template Helpers
app.use((req, res, next) => {
    // Increment visit counter stored inside session
    if (!req.session.views) {
        req.session.views = 1;
    } else {
        req.session.views++;
    }

    // Pass session & cookie state to all EJS templates
    res.locals.currentPath = req.path;
    res.locals.user = req.session.user || null;
    res.locals.sessionID = req.sessionID;
    res.locals.views = req.session.views;
    res.locals.todosCount = (req.session.todos || []).length;
    res.locals.theme = req.cookies['theme'] || 'light';
    res.locals.currentYear = new Date().getFullYear();

    next();
});

// 5. Application Routes
app.use('/', authRoutes);
app.use('/todos', todoRoutes);
app.use('/cookies', cookieRoutes);
app.use('/inspector', (req, res) => res.redirect('/cookies'));

// Home Page
app.get('/', (req, res) => {
    res.render('index', {
        title: 'Home - State Management Lab (Exp 12 B)',
        cookies: req.cookies,
        session: req.session
    });
});

// Reset Views Route
app.get('/reset-views', (req, res) => {
    req.session.views = 0;
    res.redirect('/');
});

// 404 Handler
app.use((req, res) => {
    res.status(404).render('index', {
        title: '404 - Not Found',
        errorMessage: `The requested path '${req.path}' was not found.`
    });
});

// Error Handler
app.use((err, req, res, next) => {
    console.error('Server Error:', err);
    res.status(500).send('Internal Server Error: ' + err.message);
});

// Start Server
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`====================================================`);
        console.log(`Experiment 12 B Server running on http://localhost:${PORT}`);
        console.log(`Mode: State Management Demo (Sessions & Cookies)`);
        console.log(`====================================================`);
    });
}

module.exports = app;
