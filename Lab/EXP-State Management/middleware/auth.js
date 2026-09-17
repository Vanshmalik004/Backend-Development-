/**
 * ============================================================================
 * Experiment 12 B: Authentication & Route Protection Middleware
 * ============================================================================
 */

/**
 * Ensures user is authenticated via session before accessing protected resources.
 */
function authMiddleware(req, res, next) {
    if (req.session && req.session.user) {
        return next();
    }

    // Handle AJAX/JSON requests
    if (req.xhr || (req.headers.accept && req.headers.accept.includes('application/json'))) {
        return res.status(401).json({
            success: false,
            message: 'Authentication required. Active session not found.'
        });
    }

    // Redirect browser requests to login
    return res.redirect('/login?msg=unauthorized');
}

/**
 * Prevents already authenticated users from visiting login/registration pages.
 */
function guestMiddleware(req, res, next) {
    if (req.session && req.session.user) {
        return res.redirect('/dashboard');
    }
    next();
}

module.exports = {
    authMiddleware,
    guestMiddleware
};
