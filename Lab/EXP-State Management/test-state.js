/**
 * ============================================================================
 * Experiment 12 B: Comprehensive Automated Test Suite
 * ============================================================================
 * Tests:
 * 1. Session Visit Counter & State Persistence
 * 2. Route Protection (authMiddleware redirect on unauthenticated access)
 * 3. User Registration with bcrypt password hashing
 * 4. User Login and Session Cookie generation
 * 5. Authenticated Dashboard access
 * 6. Session-based To-Do Manager CRUD operations
 * 7. Session Isolation between different client sessions
 * 8. Theme Cookie persistence and toggling
 * 9. Session Destruction on Logout
 */

const http = require('http');
const app = require('./server');

const TEST_PORT = 3899;
let server;

// Simple Cookie Jar helper for Node native fetch/http
class CookieJar {
    constructor() {
        this.cookies = {};
    }

    setFromHeaders(headers) {
        const raw = headers.getSetCookie ? headers.getSetCookie() : [headers.get('set-cookie')].filter(Boolean);
        for (const str of raw) {
            if (!str) continue;
            const parts = str.split(';')[0].split('=');
            if (parts.length >= 2) {
                const name = parts[0].trim();
                const val = parts.slice(1).join('=').trim();
                this.cookies[name] = val;
            }
        }
    }

    getCookieHeader() {
        return Object.entries(this.cookies)
            .map(([k, v]) => `${k}=${v}`)
            .join('; ');
    }

    clear() {
        this.cookies = {};
    }
}

async function request(path, options = {}, jar = null) {
    const headers = { ...(options.headers || {}) };
    if (jar) {
        const cookieHeader = jar.getCookieHeader();
        if (cookieHeader) {
            headers['Cookie'] = cookieHeader;
        }
    }

    const url = `http://localhost:${TEST_PORT}${path}`;
    const response = await fetch(url, {
        ...options,
        headers,
        redirect: 'manual' // Prevent auto-following so we can assert 302 redirects
    });

    if (jar) {
        jar.setFromHeaders(response.headers);
    }

    const text = await response.text();
    return {
        status: response.status,
        headers: response.headers,
        location: response.headers.get('location'),
        body: text
    };
}

async function runTests() {
    console.log('======================================================================');
    console.log('🧪 Running Automated Test Suite for Experiment 12 B: State Management');
    console.log('======================================================================\n');

    let passed = 0;
    let failed = 0;

    function assert(condition, message) {
        if (condition) {
            console.log(`  ✅ PASS: ${message}`);
            passed++;
        } else {
            console.error(`  ❌ FAIL: ${message}`);
            failed++;
        }
    }

    try {
        await new Promise((resolve) => {
            server = app.listen(TEST_PORT, resolve);
        });

        const jar1 = new CookieJar();
        const jar2 = new CookieJar();

        // ---------------------------------------------------------------------
        // Test 1: Session Visit Counter
        // ---------------------------------------------------------------------
        console.log('Test Group 1: Session Visit Counter & Cookie Jar');
        const res1 = await request('/', {}, jar1);
        assert(res1.status === 200, 'Home page returns HTTP 200 OK');
        assert(Boolean(jar1.cookies['connect.sid']), 'Session ID cookie (connect.sid) set on first visit');
        assert(res1.body.includes('Your Session Visits: <strong>1</strong>'), 'Visit counter initialized to 1');

        const res2 = await request('/', {}, jar1);
        assert(res2.body.includes('Your Session Visits: <strong>2</strong>'), 'Visit counter incremented to 2 for same session');

        // ---------------------------------------------------------------------
        // Test 2: Protected Route Guard (authMiddleware)
        // ---------------------------------------------------------------------
        console.log('\nTest Group 2: Route Protection (authMiddleware)');
        const unauthRes = await request('/dashboard', {}, jar1);
        assert(unauthRes.status === 302, 'Unauthenticated access to /dashboard redirects (302)');
        assert(unauthRes.location.includes('/login'), 'Redirects unauthenticated user to /login');

        // ---------------------------------------------------------------------
        // Test 3: User Registration with Hashed Password
        // ---------------------------------------------------------------------
        console.log('\nTest Group 3: User Registration (Exercise 1)');
        const testUser = 'user_' + Date.now();
        const regRes = await request('/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                username: testUser,
                password: 'securePassword123',
                confirmPassword: 'securePassword123'
            })
        }, jar1);

        assert(regRes.status === 302 && regRes.location.includes('/login?msg=registered'), 'Successful registration redirects to login');

        // ---------------------------------------------------------------------
        // Test 4: User Authentication & Session Establishment
        // ---------------------------------------------------------------------
        console.log('\nTest Group 4: User Login & Authenticated Session');
        const loginRes = await request('/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                username: testUser,
                password: 'securePassword123'
            })
        }, jar1);

        assert(loginRes.status === 302 && loginRes.location.includes('/dashboard'), 'Valid login redirects to /dashboard');

        // Verify authenticated dashboard access
        const authDashboard = await request('/dashboard', {}, jar1);
        assert(authDashboard.status === 200, 'Authenticated session can access protected /dashboard');
        assert(authDashboard.body.includes(testUser), `Dashboard displays username (${testUser})`);
        assert(authDashboard.body.includes('Active Session Details'), 'Dashboard displays session security attributes');

        // ---------------------------------------------------------------------
        // Test 5: Session-Based To-Do Manager (Exercise 2)
        // ---------------------------------------------------------------------
        console.log('\nTest Group 5: Session-Based To-Do Manager (Exercise 2)');
        const addTodoRes = await request('/todos/add', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({ todoItem: 'Finish Lab Experiment 12 B' })
        }, jar1);
        assert(addTodoRes.status === 302, 'Adding todo redirects back to /todos');

        const todosPage = await request('/todos', {}, jar1);
        assert(todosPage.body.includes('Finish Lab Experiment 12 B'), 'Session to-do list contains the added item');

        // ---------------------------------------------------------------------
        // Test 6: Session Isolation
        // ---------------------------------------------------------------------
        console.log('\nTest Group 6: Session Isolation Between Clients');
        const client2Todos = await request('/todos', {}, jar2);
        assert(
            !client2Todos.body.includes('Finish Lab Experiment 12 B') &&
            client2Todos.body.includes('Your session to-do list is currently empty'),
            'Client 2 (distinct session) does not see Client 1 todos (Session Isolation confirmed)'
        );

        // ---------------------------------------------------------------------
        // Test 7: Theme Cookie Management
        // ---------------------------------------------------------------------
        console.log('\nTest Group 7: Cookie Management & Preferences');
        const themeRes = await request('/cookies/theme', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({ theme: 'dark' })
        }, jar1);

        assert(Boolean(jar1.cookies['theme']), 'Theme cookie set in response');
        assert(jar1.cookies['theme'] === 'dark', 'Theme cookie value is "dark"');

        const homeDark = await request('/', {}, jar1);
        assert(homeDark.body.includes('class="theme-dark"'), 'Page renders with dark theme class from cookie');

        // ---------------------------------------------------------------------
        // Test 8: Logout & Session Destruction
        // ---------------------------------------------------------------------
        console.log('\nTest Group 8: Logout & Session Destruction');
        const logoutRes = await request('/logout', {}, jar1);
        assert(logoutRes.status === 302, 'Logout redirects to login');

        // Verify dashboard is locked again
        const postLogoutDashboard = await request('/dashboard', {}, jar1);
        assert(postLogoutDashboard.status === 302 && postLogoutDashboard.location.includes('/login'), 'Session destroyed: /dashboard access is denied after logout');

    } catch (err) {
        console.error('Fatal test error:', err);
        failed++;
    } finally {
        if (server) {
            server.close();
        }
    }

    console.log('\n======================================================================');
    console.log(`📊 Test Summary: ${passed} Passed, ${failed} Failed`);
    console.log('======================================================================\n');

    if (failed > 0) {
        process.exit(1);
    }
}

if (require.main === module) {
    runTests();
}

module.exports = { runTests };
