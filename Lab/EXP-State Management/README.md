# Experiment 12 B (Optional): State Management in Node.js

**Course:** Backend Development  
**Topic:** Managing Sessions & Cookies using Node.js and Express  
**Author:** Vansh Malik  

---

## 1. Experiment Overview & Objectives

HTTP is an inherently **stateless protocol**. Every incoming request to an HTTP server is completely independent; the server does not natively remember previous interactions, identity, or data between requests.

To build interactive, multi-step web applications (such as user accounts, authentication guards, and shopping carts), developers employ **State Management** via:
1. **Cookies**: Small data pairs stored directly on the client's browser and sent automatically via HTTP `Cookie` request headers.
2. **Sessions**: Secure, server-side data stores indexed by a unique, cryptographically signed Session ID (`connect.sid`).

### Key Learning Objectives:
* Understand the distinction, lifecycle, and security trade-offs of cookies versus sessions.
* Use `express-session` to maintain state, track visits, and store user-specific data.
* Use `cookie-parser` to set, inspect, and delete browser cookies with flags like `HttpOnly`, `Max-Age`, and `Secure`.
* Implement **Exercise 1: Simple User Login System** with `bcrypt` password hashing and `authMiddleware` route protection.
* Implement **Exercise 2: Session-Based To-Do List Manager** demonstrating session isolation.

---

## 2. Cookies vs. Sessions Comparison

| Dimension | Cookies (`cookie-parser`) | Sessions (`express-session`) |
| :--- | :--- | :--- |
| **Storage Location** | Client Browser | Server RAM / Database (Redis, Mongo) |
| **Capacity** | Max ~4 KB per domain | Limited only by server storage |
| **Security** | Susceptible to tampering/XSS unless `HttpOnly` | High; client only holds an encrypted Session ID |
| **Longevity** | Configured via `Max-Age` / `Expires` | Configurable TTL (expires on timeout or browser close) |
| **Primary Use Cases**| Theme/UI preferences, tracking tokens | User authentication, permissions, shopping carts |

---

## 3. Project Directory Structure

```
Lab/EXP-State Management/
│
├── Exp_12_B_State_Management_Manual.md   # Downloaded official lab manual
├── package.json                          # Dependencies & NPM scripts
├── .gitignore                            # Node modules & OS ignores
├── server.js                             # Main integrated Express application
├── test-state.js                         # Automated end-to-end test suite
├── README.md                             # Comprehensive documentation
│
├── Source/                               # Exact standalone examples from manual
│   ├── session-example.js                # Part 1: Standalone visit counter & destroy
│   └── cookie-example.js                 # Part 2: Standalone cookie set/get/delete
│
├── middleware/
│   └── auth.js                           # authMiddleware & guestMiddleware
│
├── routes/
│   ├── authRoutes.js                     # Exercise 1: Register, Login, Dashboard, Logout
│   ├── todoRoutes.js                     # Exercise 2: Session-based To-Do Manager
│   └── cookieRoutes.js                   # Cookie theme toggler & State Inspector API
│
├── data/
│   └── users.json                        # Local JSON user store (bcrypt-hashed passwords)
│
├── views/
│   ├── index.ejs                         # Home overview & state comparison
│   ├── login.ejs                         # User login form
│   ├── register.ejs                      # Registration form with bcrypt
│   ├── dashboard.ejs                     # Protected user dashboard
│   ├── todos.ejs                         # Session-isolated To-Do manager UI
│   ├── inspector.ejs                     # Side-by-side Live State Inspector
│   └── partials/
│       ├── header.ejs                    # Navbar, theme toggle, session stats
│       └── footer.ejs                    # State status strip & credits
│
└── public/
    └── css/
        └── style.css                     # Responsive CSS with light/dark theme variables
```

---

## 4. Installation & Setup

### Prerequisites
* **Node.js**: v18.0.0 or higher
* **npm**: v9.0.0 or higher

### Install Dependencies
Navigate to this directory and install required npm packages:
```bash
cd "Lab/EXP-State Management"
npm install
```

---

## 5. Running the Application

### Option A: Run the Full Integrated Web Application (Recommended)
```bash
npm start
# or with nodemon for live reload:
npm run dev
```
Open **`http://localhost:3000`** in your web browser.

### Option B: Run Standalone Examples from Manual
* **Part 1 (Session Example):**
  ```bash
  npm run example:session
  # Runs at http://localhost:3001
  ```
* **Part 2 (Cookie Example):**
  ```bash
  npm run example:cookie
  # Runs at http://localhost:3002
  ```

---

## 6. Implementation Highlights

### 1. Route Protection Middleware (`middleware/auth.js`)
```javascript
function authMiddleware(req, res, next) {
    if (req.session && req.session.user) {
        return next(); // Authenticated
    }
    return res.redirect('/login?msg=unauthorized');
}
```

### 2. Session Destruction on Logout (`routes/authRoutes.js`)
```javascript
router.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) return res.status(500).send('Logout failed.');
        res.clearCookie('connect.sid'); // Clear session cookie from client
        res.redirect('/login?msg=logged_out');
    });
});
```

### 3. Session-Based To-Do Storage (`routes/todoRoutes.js`)
```javascript
router.post('/add', (req, res) => {
    req.session.todos = req.session.todos || [];
    req.session.todos.push({
        id: Date.now().toString(),
        text: req.body.todoItem,
        completed: false
    });
    res.redirect('/todos');
});
```

### 4. Theme Cookie Preference (`routes/cookieRoutes.js`)
```javascript
router.post('/theme', (req, res) => {
    const currentTheme = req.cookies['theme'] || 'light';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    res.cookie('theme', newTheme, { maxAge: 30 * 24 * 60 * 60 * 1000 });
    res.redirect('back');
});
```

---

## 7. Automated Testing & Verification

Run the automated test suite to verify session creation, route guards, bcrypt authentication, to-do isolation, and cookie lifecycle:

```bash
npm test
```

### Test Suite Execution Output:
```text
======================================================================
🧪 Running Automated Test Suite for Experiment 12 B: State Management
======================================================================

Test Group 1: Session Visit Counter & Cookie Jar
  ✅ PASS: Home page returns HTTP 200 OK
  ✅ PASS: Session ID cookie (connect.sid) set on first visit
  ✅ PASS: Visit counter initialized to 1
  ✅ PASS: Visit counter incremented to 2 for same session

Test Group 2: Route Protection (authMiddleware)
  ✅ PASS: Unauthenticated access to /dashboard redirects (302)
  ✅ PASS: Redirects unauthenticated user to /login

Test Group 3: User Registration (Exercise 1)
  ✅ PASS: Successful registration redirects to login

Test Group 4: User Login & Authenticated Session
  ✅ PASS: Valid login redirects to /dashboard
  ✅ PASS: Authenticated session can access protected /dashboard
  ✅ PASS: Dashboard displays username
  ✅ PASS: Dashboard displays session security attributes

Test Group 5: Session-Based To-Do Manager (Exercise 2)
  ✅ PASS: Adding todo redirects back to /todos
  ✅ PASS: Session to-do list contains the added item

Test Group 6: Session Isolation Between Clients
  ✅ PASS: Client 2 (distinct session) does not see Client 1 todos (Session Isolation confirmed)

Test Group 7: Cookie Management & Preferences
  ✅ PASS: Theme cookie set in response
  ✅ PASS: Theme cookie value is "dark"
  ✅ PASS: Page renders with dark theme class from cookie

Test Group 8: Logout & Session Destruction
  ✅ PASS: Logout redirects to login
  ✅ PASS: Session destroyed: /dashboard access is denied after logout

======================================================================
📊 Test Summary: 15 Passed, 0 Failed
======================================================================
```
