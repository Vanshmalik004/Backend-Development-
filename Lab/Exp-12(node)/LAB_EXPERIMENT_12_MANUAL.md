# Lab Experiment 12: Node.js, Express.js, and EJS Templating

**Course:** Web Technologies / Full Stack Backend Development  
**Course Outcomes Mapped:**  
- **CO3:** Design and develop server-side web applications and RESTful APIs using modern backend frameworks.  
- **CO4:** Implement server-side rendering (SSR), dynamic templating, request payload validation, and non-blocking asynchronous architectures.  
**Experiment Title:** Implementation of Server-Side JavaScript using Node.js, RESTful Web Services via Express.js, Dynamic Server-Side Rendering with EJS Templating, and Hot-Reloading Workflow with Nodemon.  
**Deliverable Directory:** [`Exp-12(node)/`](file:///Users/vanshmalik/Desktop/Backend/Lab/Exp-12(node)/)

---

## 1. Objectives

By completing this laboratory experiment, students will be able to:
1. **Understand Server-Side JavaScript Runtime Architecture:** Explain the inner workings of Node.js, including Google V8 engine compilation, the single-threaded Event Loop, non-blocking asynchronous I/O, and the C++ Libuv worker thread pool.
2. **Build Production-Ready RESTful APIs with Express.js:** Design standardized HTTP endpoints implementing all core CRUD verbs (`GET`, `POST`, `PUT`, `DELETE`), returning structured JSON payloads and adhering to RFC status code conventions.
3. **Master Request Parameter Dissection:** Handle and differentiate between URL route parameters (`req.params`), URL query strings (`req.query`), and parsed HTTP request bodies (`req.body`).
4. **Implement Server-Side Rendering (SSR) via EJS Templating:** Architect a modular multi-page web application leveraging reusable partials (`header`, `navbar`, `footer`, `alerts`), scriptlets (`<% %>`), HTML-escaped output (`<%= %>`) to neutralize Cross-Site Scripting (XSS), and iteration loops.
5. **Construct a Custom Express Middleware Pipeline:** Develop and sequence middleware functions for high-resolution request timing logging, CORS header injection, payload parsing (`express.json()`, `express.urlencoded()`), static asset serving, and centralized 4-parameter error handling (`(err, req, res, next)`).
6. **Utilize Modern Developer Tooling with Nodemon:** Configure automated hot-reloading with `nodemon.json` to monitor project file changes and streamline development iterations without manual server restarts.

---

## 2. Theoretical Background

### 2.1 The Node.js Concurrency Model: Event Loop & Libuv

Traditional server architectures (such as Apache HTTP Server or classic Java Servlet containers) employ a **thread-per-request** model. In that design, each incoming TCP connection allocates a distinct operating system thread with a dedicated call stack (~1–2 MB memory). Under high concurrency (the C10K problem), system resources become overwhelmed by thread contention, context-switching overhead, and memory exhaustion.

In contrast, **Node.js** utilizes an **event-driven, single-threaded, non-blocking I/O model**:
- **Main Thread (V8 Execution Engine):** All JavaScript application code, call stack frames, and event loop dispatches execute on a single thread.
- **Libuv & C++ Thread Pool:** When asynchronous, blocking operations are requested (file system I/O via `fs`, DNS lookups, or cryptographic hashing via `crypto`), Node offloads the work to the underlying operating system kernel (epoll/kqueue) or a background pool of C++ worker threads managed by **Libuv** (default size: 4 threads).
- **Callback & Microtask Queues:** Once the I/O operation finishes, its associated callback is pushed to the task queue. The Event Loop monitors the Call Stack; as soon as the stack is completely empty, it transfers queued callbacks to the stack for execution.

```
                     Incoming HTTP Requests
                                │
                                ▼
                   ┌─────────────────────────┐
                   │   Node.js Event Loop    │ ◄─── (Single Threaded)
                   └────────────┬────────────┘
                                │
        ┌───────────────────────┴───────────────────────┐
        │ [Offload Asynchronous / Blocking Operations]   │
        ▼                                               ▼
┌─────────────────────────┐                   ┌─────────────────────────┐
│   Libuv Thread Pool     │                   │  Operating System Kernel│
│  (Disk I/O, Crypto)     │                   │  (Sockets, epoll/kqueue)│
└───────────┬─────────────┘                   └────────────┬────────────┘
            │                                              │
            └───────────────────────┬──────────────────────┘
                                    │ [Completion Signal]
                                    ▼
                         ┌──────────────────────┐
                         │    Callback Queue    │
                         └──────────┬───────────┘
                                    │ [Event Loop Tick]
                                    ▼
                         ┌──────────────────────┐
                         │   V8 Call Stack      │
                         └──────────────────────┘
```

---

### 2.2 Express.js Middleware Cascading Pipeline

**Express.js** is a minimalist, unopinionated routing and middleware web framework for Node.js. At its core, an Express application is an ordered chain of **middleware functions**.

A middleware function conforms to the signature `(req, res, next)`:
- `req`: The incoming HTTP request object.
- `res`: The outgoing HTTP response object.
- `next`: A callback function that, when invoked, hands off control to the subsequent middleware registered in the stack.

```
HTTP Request ──► CORS ──► Request Logger ──► Body Parser ──► Route Handler ──► HTTP Response
                           (process.hrtime)    (JSON/URL)       (res.json /
                                                                res.render)
                                                                    │
                                                           [Error Triggered]
                                                                    │
                                                                    ▼
                                                            Error Middleware
                                                            (err,req,res,next)
```

If a middleware does not terminate the request-response cycle (by calling `res.send()`, `res.json()`, `res.render()`, or `res.redirect()`), it **must** call `next()`. Failing to do so causes the request to hang until client timeout.

---

### 2.3 Request Parameter Hierarchy: `params`, `query`, and `body`

Express segments incoming HTTP request data into three distinct access vectors:

| Property | Transport Channel | Syntax / Extraction Example | Primary REST Use Case |
| :--- | :--- | :--- | :--- |
| **`req.params`** | Route path segment placeholder (`/:id`) | `GET /api/products/42` &rarr; `req.params.id === "42"` | Identifying a specific, singular resource entity. |
| **`req.query`** | URL query string (`?key=value&...`) | `GET /api/products?cat=Audio&sort=asc` &rarr; `req.query.cat` | Filtering, searching, sorting, and pagination across collections. |
| **`req.body`** | HTTP request payload entity | `POST /api/products` with JSON `{"name":"Mic"}` | Submitting resource state payloads during mutations (POST, PUT, PATCH). |

---

### 2.4 EJS (Embedded JavaScript) Templating & SSR Cycle

**Server-Side Rendering (SSR)** compiles web page markup directly on the server before transmitting it to the browser. This delivers immediate First Contentful Paint (FCP), superior Search Engine Optimization (SEO), and zero client-side JavaScript initialization penalty for layout rendering.

**EJS Syntax Matrix:**
- `<%= expression %>`: Evaluates the JavaScript expression and **HTML-escapes** the result (converts `<`, `>`, `&`, `"`, `'` into entity codes), guarding against **Cross-Site Scripting (XSS)**.
- `<%- expression %>`: Evaluates and injects **raw, unescaped** HTML into the output stream. Used for embedding modular view partials (e.g., `<%- include('partials/header') %>`).
- `<% code %>`: Executes arbitrary JavaScript statements (control flow, `if/else` conditionals, `forEach` loops) without emitting text into the output buffer.
- `<%# comment %>`: Server-side comment; discarded during the compile pass and never transmitted to the browser DOM.

---

### 2.5 Nodemon Hot-Reloading Workflow

During standard Node.js development, the V8 runtime evaluates scripts once at launch. Any code modification requires manually killing the PID and re-invoking `node server.js`.

**Nodemon** is a development supervisor tool that wraps the Node runtime. It binds filesystem watcher hooks (using `fs.watch` / `chokidar`) across specified directory trees. When any `.js`, `.json`, `.ejs`, or `.css` file is saved, Nodemon safely sends a `SIGUSR2` signal to restart the child process in hundreds of milliseconds.

---

## 3. Project Directory Structure

```
Exp-12(node)/
├── package.json                 # Project manifest, scripts, and runtime/dev dependencies
├── nodemon.json                 # Hot-reloading configuration & file watcher rules
├── server.js                    # Express application entrypoint, view engine setup & listener
├── data/
│   └── products.json            # Persistent JSON database store for hardware catalog
├── middleware/
│   ├── logger.js                # Custom execution timer & HTTP request logger
│   └── errorHandler.js          # Centralized 404 Not Found & 500 Global Error handlers
├── routes/
│   ├── apiRoutes.js             # RESTful API router (GET, POST, PUT, DELETE, filters)
│   └── viewRoutes.js            # Server-Side Rendered (SSR) routes with EJS controllers
├── public/
│   ├── css/
│   │   └── style.css            # Glassmorphism design system, dark/light themes, responsive grid
│   └── js/
│       ├── main.js              # Theme switcher, alert dismissals, product modal controllers
│       ├── api-tester.js        # Live REST API playground client & JSON syntax formatter
│       └── event-loop.js        # Interactive Node.js Event Loop & Queue simulator
├── views/
│   ├── partials/
│   │   ├── header.ejs           # HTML5 head, Google Fonts, meta tags, style imports
│   │   ├── navbar.ejs           # Glassmorphic top navigation with active route indicators
│   │   ├── footer.ejs           # Application footer with live Node runtime badge
│   │   └── alerts.ejs           # Flash notification toast partial
│   ├── pages/
│   │   ├── index.ejs            # Home Dashboard: Live Node telemetry & metric cards
│   │   ├── products.ejs         # SSR Product Inventory: Table, filters, Add/Edit modals
│   │   ├── product-detail.ejs   # Single product deep-dive showcasing req.params.id
│   │   ├── api-explorer.ejs     # Live interactive in-browser HTTP Workbench
│   │   ├── architecture.ejs     # Event Loop & Express Middleware Flow visualizer
│   │   └── lab-manual.ejs       # Built-in Interactive Lab Manual with 12 Viva-Voce accordions
│   ├── 404.ejs                  # Friendly custom 404 error page
│   └── 500.ejs                  # Custom 500 internal server error page
├── test-api.js                  # Automated 30-assertion test suite
├── LAB_EXPERIMENT_12_MANUAL.md  # Comprehensive laboratory manual
└── README.md                    # Quickstart guide and API endpoint documentation
```

---

## 4. Source Code Walkthrough

### 4.1 Server Initialization & Middleware Stack (`server.js`)

```javascript
const express = require('express');
const path = require('path');
const cors = require('cors');

const requestLogger = require('./middleware/logger');
const { notFoundHandler, globalErrorHandler } = require('./middleware/errorHandler');
const { router: apiRouter } = require('./routes/apiRoutes');
const viewRouter = require('./routes/viewRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// 1. Configure EJS View Engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// 2. Register Middleware Stack
app.use(cors());
app.use(requestLogger);                                    // High-resolution logger
app.use(express.json());                                   // application/json parser
app.use(express.urlencoded({ extended: true }));           // form-encoded parser
app.use(express.static(path.join(__dirname, 'public')));   // Static file assets

// 3. Global Template Helpers
app.use((req, res, next) => {
  res.locals.currentYear = new Date().getFullYear();
  res.locals.nodeVersion = process.version;
  res.locals.formatCurrency = (n) => Number(n).toLocaleString('en-US', { style: 'currency', currency: 'USD' });
  next();
});

// 4. Mount Routers
app.use('/api', apiRouter);
app.use('/', viewRouter);

// 5. Error Handlers
app.use(notFoundHandler);
app.use(globalErrorHandler);

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
```

### 4.2 RESTful CRUD API Router (`routes/apiRoutes.js`)

```javascript
// GET /api/products with Query Filtering & Sorting
router.get('/products', (req, res) => {
  let result = [...products];
  const { category, search, minPrice, sort } = req.query;

  if (category && category !== 'all') {
    result = result.filter(p => p.category.toLowerCase() === category.toLowerCase());
  }
  if (search) {
    result = result.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
  }
  if (minPrice) {
    result = result.filter(p => p.price >= parseFloat(minPrice));
  }
  if (sort === 'price_asc') {
    result.sort((a, b) => a.price - b.price);
  }

  res.status(200).json({
    success: true,
    count: result.length,
    data: result
  });
});

// POST /api/products with Validation
router.post('/products', (req, res) => {
  const { name, category, price, stock } = req.body;

  if (!name || !category || price === undefined || price <= 0) {
    return res.status(400).json({
      success: false,
      error: 'Validation Failed',
      message: 'Fields name, category, and positive price are required.'
    });
  }

  const newProduct = {
    id: products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1,
    name: name.trim(),
    category: category.trim(),
    price: parseFloat(price),
    stock: parseInt(stock, 10) || 0,
    createdAt: new Date().toISOString()
  };

  products.push(newProduct);
  res.status(201).json({ success: true, data: newProduct });
});
```

### 4.3 High-Resolution Performance Logger (`middleware/logger.js`)

```javascript
function requestLogger(req, res, next) {
  const startHrTime = process.hrtime();

  res.on('finish', () => {
    const elapsedHrTime = process.hrtime(startHrTime);
    const elapsedMs = (elapsedHrTime[0] * 1000 + elapsedHrTime[1] / 1e6).toFixed(2);
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} ${res.statusCode} - ${elapsedMs}ms`);
  });

  const originalEnd = res.end;
  res.end = function (...args) {
    const elapsed = process.hrtime(startHrTime);
    const ms = (elapsed[0] * 1000 + elapsed[1] / 1e6).toFixed(2);
    if (!res.headersSent) res.setHeader('X-Response-Time', `${ms}ms`);
    return originalEnd.apply(this, args);
  };

  next();
}
```

---

## 5. How to Run and Verify the Experiment

### Step 1: Install Dependencies
Open your terminal inside the project directory:
```bash
cd "/Users/vanshmalik/Desktop/Backend/Lab/Exp-12(node)"
npm install
```

### Step 2: Execute Automated Verification Suite
Run the 30-assertion automated test suite:
```bash
npm test
```
*Expected Output:*
```text
================================================================
🧪 EXPERIMENT 12: AUTOMATED VERIFICATION SUITE
================================================================
  ✅ PASS: GET / returns 200 OK
  ✅ PASS: GET /products returns 200 OK
  ✅ PASS: GET /products/1 returns 200 OK
  ✅ PASS: GET /api/products returns 200 OK
  ✅ PASS: GET /api/products?category=Peripherals returns 200
  ✅ PASS: GET /api/products/1 returns 200
  ✅ PASS: GET /api/products/999 returns 404 Not Found
  ✅ PASS: POST /api/products returns 201 Created
  ✅ PASS: POST /api/products with invalid body returns 400 Bad Request
  ✅ PASS: PUT /api/products/9 returns 200 OK
  ✅ PASS: DELETE /api/products/9 returns 200 OK
  ✅ PASS: GET /api/system/info returns 200 OK
  ✅ PASS: Custom logger sets X-Response-Time header
----------------------------------------------------------------
TOTAL TESTS: 30 | PASSED: 30 | FAILED: 0
----------------------------------------------------------------
```

### Step 3: Run with Nodemon (Development Mode)
```bash
npm run dev
```
Nodemon monitors all `.js`, `.ejs`, `.json`, and `.css` files. Saving changes will automatically trigger instantaneous server reloads.

### Step 4: Browser Verification
Open your browser and navigate to:
1. **Home Dashboard:** [`http://localhost:3000/`](http://localhost:3000/) — Review live Node.js memory metrics, V8 version, platform architecture, and system uptime.
2. **SSR Product Catalog:** [`http://localhost:3000/products`](http://localhost:3000/products) — Test category filters, search input, sorting, and the modal dialog for creating products.
3. **Interactive API Explorer:** [`http://localhost:3000/api-explorer`](http://localhost:3000/api-explorer) — Dispatch live `GET`, `POST`, `PUT`, `DELETE` requests and inspect formatted JSON responses.
4. **Architecture Visualizer:** [`http://localhost:3000/architecture`](http://localhost:3000/architecture) — Step through the interactive Event Loop simulation (Sync, `setTimeout`, `fs.readFile`, Promise microtasks).
5. **Interactive Lab Manual:** [`http://localhost:3000/lab-manual`](http://localhost:3000/lab-manual) — Review viva-voce questions and study guides directly in the app.

---

## 6. Viva-Voce Questions and Answers

### Q1: What is the Node.js Event Loop, and how does it achieve high concurrency despite being single-threaded?
**Answer:** Node.js runs JavaScript on a single thread using Google's V8 engine. High concurrency is accomplished via **non-blocking asynchronous I/O** powered by **Libuv**. When an I/O task (such as database queries, network sockets, or file reads) is executed, Node delegates the task to the underlying operating system kernel or to the Libuv C++ thread pool. The single main thread immediately proceeds to execute subsequent JavaScript code. When the I/O operation finishes, Libuv pushes its callback to the Callback Queue. When the Call Stack is empty, the Event Loop pushes the callback onto the stack, enabling thousands of concurrent connections with minimal memory overhead.

### Q2: Differentiate between `req.params`, `req.query`, and `req.body` in Express.js.
**Answer:**
- **`req.params`:** Represents route path parameters defined with colon tokens (e.g. `/products/:id`). Accessed via `req.params.id`. Used to identify individual entities.
- **`req.query`:** Represents URL query strings following the `?` delimiter (e.g. `/products?category=Audio&limit=10`). Used for filtering, sorting, searching, and pagination.
- **`req.body`:** Represents payload data submitted in the HTTP request entity body (e.g., JSON via REST API or URL-encoded form submissions). Requires body-parsing middleware (`express.json()` or `express.urlencoded()`) to populate.

### Q3: What is Express middleware, and what happens if `next()` is omitted?
**Answer:** Middleware functions have access to the request object (`req`), response object (`res`), and the `next` function in the application’s request-response cycle. Middleware performs tasks such as logging, authentication, CORS validation, and parsing. If a middleware function does not terminate the response cycle (e.g., via `res.send()`, `res.json()`, `res.render()`), it **must** call `next()` to hand off control to the subsequent middleware. Omitting `next()` causes the client request to hang indefinitely until connection timeout.

### Q4: Why must `npm install` be run, and what is the difference between `dependencies` and `devDependencies`?
**Answer:** `npm install` reads `package.json` and downloads the exact version-resolved packages into the local `node_modules` directory. **`dependencies`** (e.g., `express`, `ejs`, `cors`) are required for the application to run in production runtime environments. **`devDependencies`** (e.g., `nodemon`) are tools only required during local software development and testing, and are excluded from lean production container builds (`npm install --production`).

### Q5: Why should `<%= %>` be favored over `<%- %>` for dynamic user content in EJS?
**Answer:** `<%= %>` performs automatic HTML entity escaping on dangerous characters (`<`, `>`, `&`, `"`, `'`), neutralizing **Cross-Site Scripting (XSS)** vulnerabilities if an attacker attempts to inject malicious `<script>` tags. `<%- %>` emits raw, unescaped HTML; it must strictly be reserved for trusted server-side template includes (e.g., `<%- include('partials/header') %>`).

### Q6: How does an Express error-handling middleware function differ from standard middleware?
**Answer:** An error-handling middleware function in Express is defined with **four explicit parameters**: `(err, req, res, next)`. Express inspects function arity (`fn.length === 4`). When an error is forwarded via `next(err)` or thrown inside a handler, Express skips all subsequent regular 3-parameter middleware and routes execution directly to the 4-parameter error handler.

### Q7: What are the primary HTTP status code families in REST API engineering?
**Answer:**
- **2xx (Success):** `200 OK` (Standard success), `201 Created` (Resource created via POST), `204 No Content` (Successful action with no body returned).
- **3xx (Redirection):** `301 Moved Permanently`, `304 Not Modified` (HTTP caching).
- **4xx (Client Error):** `400 Bad Request` (Validation failure), `401 Unauthorized` (Missing credentials), `403 Forbidden` (Insufficient permissions), `404 Not Found` (Missing resource).
- **5xx (Server Error):** `500 Internal Server Error` (Unhandled exception).

### Q8: What is Nodemon, and how does `nodemon.json` configure its behavior?
**Answer:** Nodemon is a CLI utility that monitors the filesystem for file modifications and automatically restarts the Node.js application process. In `nodemon.json`, developers configure `watch` (directories to observe), `ext` (file extensions to trigger restarts, e.g. `js,json,ejs,css`), `ignore` (directories to skip, like `node_modules` and upload folders), and `delay` (debounce threshold in milliseconds).

### Q9: What is the purpose of `process.hrtime()` in performance monitoring?
**Answer:** `process.hrtime()` returns high-resolution real time in a `[seconds, nanoseconds]` tuple. Unlike `Date.now()`, which is tied to the system clock and susceptible to clock drift or NTP adjustments, `hrtime` produces monotonic, sub-millisecond precision ideal for benchmarking API route latency and setting `X-Response-Time` headers.

### Q10: What is the role of `express.static()` middleware?
**Answer:** `express.static('public')` is a built-in middleware based on `serve-static`. It directly serves static assets (CSS stylesheets, client JavaScript, images, favicon) from the designated directory. It automatically computes MIME types, handles HTTP caching headers (`ETag`, `Last-Modified`), and supports range requests without requiring custom route handlers.

### Q11: Explain the difference between Server-Side Rendering (SSR) with EJS versus Single-Page Applications (SPA) with React/Vue.
**Answer:** In SSR with EJS, the server compiles HTML and dynamic data on each request, delivering fully formed markup to the client. This offers fast initial page rendering, low client memory usage, and optimal search engine indexability. In an SPA, the server returns a bare HTML shell and a large JavaScript bundle; the client browser downloads the bundle, makes asynchronous API calls (`fetch`), and builds the DOM dynamically in browser memory.

### Q12: How does Node.js handle uncaught exceptions and graceful shutdowns?
**Answer:** Node exposes process-level event hooks: `process.on('uncaughtException', cb)` and `process.on('unhandledRejection', cb)` to catch unhandled errors before process termination. For graceful shutdowns, listening to OS termination signals (`process.on('SIGTERM', cb)` or `SIGINT`) allows the HTTP server to finish ongoing requests (`server.close()`), persist cached buffers, close database pools, and exit cleanly with code 0.

---

## 7. Conclusion

In this experiment, a complete, resilient, and production-grade server-side application was engineered utilizing **Node.js**, **Express.js**, and **EJS Templating**. The project successfully achieved:
1. Implementation of a non-blocking asynchronous server architecture.
2. A comprehensive RESTful API providing full CRUD functionality across URL route parameters (`req.params`), query strings (`req.query`), and JSON request bodies (`req.body`).
3. Server-side rendering using modular EJS partials, scriptlets, and XSS-safe output encoding.
4. Custom middleware development for high-resolution request timing and centralized error management.
5. An automated development lifecycle configured via Nodemon hot-reloading.

All criteria mapped to Course Outcomes **CO3** and **CO4** were successfully met and thoroughly verified.
