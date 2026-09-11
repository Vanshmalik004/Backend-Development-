# Experiment 12: Node.js, Express.js, and EJS Templating

[![Node.js](https://img.shields.io/badge/Node.js-v24.x-green.svg)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-v4.21-blue.svg)](https://expressjs.com/)
[![EJS](https://img.shields.io/badge/EJS-v3.1-orange.svg)](https://ejs.co/)
[![Nodemon](https://img.shields.io/badge/Nodemon-Hot--Reload-lightgrey.svg)](https://nodemon.io/)
[![Status](https://img.shields.io/badge/Tests-30%2F30%20Passing-brightgreen.svg)]()

A comprehensive, production-grade academic implementation for **Experiment 12** covering:
- **Server-Side JavaScript:** Single-threaded asynchronous Event Loop, Libuv threadpool, V8 runtime telemetry.
- **RESTful CRUD Web API:** Complete implementation of `GET`, `POST`, `PUT`, `DELETE` operations.
- **Request Parameter Spectrum:** Hands-on demonstration of `req.params`, `req.query`, and `req.body`.
- **EJS Templating Engine:** Multi-page Server-Side Rendering (SSR) with modular partials, scriptlets, and XSS sanitization.
- **Cascading Middleware Pipeline:** Request logging with `process.hrtime()`, CORS, JSON body parsers, static file serving, and centralized error handling.
- **Development Productivity Tooling:** Automated hot-reloading with `nodemon.json`.
- **Interactive In-App Workbench:** Built-in REST API Explorer, Event Loop Simulator, and Viva-Voce Examination Module.

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Automated Verification Suite
```bash
npm test
```
Runs 30 automated assertions verifying all RESTful endpoints, status codes, query filters, URL parameters, error handlers, and EJS views.

### 3. Start Development Server (Hot-Reload with Nodemon)
```bash
npm run dev
```
Or start in production mode:
```bash
npm start
```

### 4. Open in Browser
Visit **[http://localhost:3000](http://localhost:3000)** to view the application:
- 📊 **Dashboard:** [http://localhost:3000/](http://localhost:3000/)
- 📦 **Products Catalog (SSR):** [http://localhost:3000/products](http://localhost:3000/products)
- 🧪 **API Playground:** [http://localhost:3000/api-explorer](http://localhost:3000/api-explorer)
- 🔄 **Event Loop Visualizer:** [http://localhost:3000/architecture](http://localhost:3000/architecture)
- 📖 **Lab Manual & Viva-Voce:** [http://localhost:3000/lab-manual](http://localhost:3000/lab-manual)

---

## 📡 REST API Reference

| Verb | Path | Request Data | Description | Status Codes |
| :--- | :--- | :--- | :--- | :--- |
| **`GET`** | `/api/products` | Query: `?category,search,minPrice,sort,stock` | Returns filtered product collection | `200 OK` |
| **`GET`** | `/api/products/:id` | URL Param: `id` | Fetches a single product by numeric ID | `200 OK`, `404 Not Found` |
| **`POST`** | `/api/products` | Body: `{ name, category, price, stock, ... }` | Creates a new product entity | `201 Created`, `400 Bad Request` |
| **`PUT`** | `/api/products/:id` | Param: `id` + Body: JSON fields | Updates existing product entity | `200 OK`, `400 Bad Request`, `404` |
| **`DELETE`**| `/api/products/:id` | URL Param: `id` | Removes product entity from database | `200 OK`, `404 Not Found` |
| **`POST`** | `/api/products/reset`| None | Resets product collection to default seed | `200 OK` |
| **`GET`** | `/api/system/info` | None | Returns live Node.js runtime telemetry | `200 OK` |

---

## 📁 Directory Architecture

```
Exp-12(node)/
├── package.json                 # Dependencies & scripts
├── nodemon.json                 # Hot-reloading watcher configuration
├── server.js                    # Application entry point & middleware chain
├── data/products.json           # Seed database for inventory items
├── middleware/
│   ├── logger.js                # Custom request timing middleware
│   └── errorHandler.js          # Centralized 404 & 500 error handlers
├── routes/
│   ├── apiRoutes.js             # REST API routes
│   └── viewRoutes.js            # SSR EJS page routes
├── public/
│   ├── css/style.css            # Dark/light glassmorphism styles
│   └── js/
│       ├── main.js              # Theme switcher & modal handlers
│       ├── api-tester.js        # Live REST client & response viewer
│       └── event-loop.js        # Interactive Event Loop simulator
├── views/
│   ├── partials/                # header, navbar, footer, alerts
│   ├── pages/                   # index, products, product-detail, api-explorer, architecture, lab-manual
│   ├── 404.ejs                  # Custom 404 page
│   └── 500.ejs                  # Custom 500 page
├── test-api.js                  # 30-assertion automated test suite
├── LAB_EXPERIMENT_12_MANUAL.md  # Official academic laboratory manual
└── README.md                    # Documentation
```

---

## 🎓 Academic Viva-Voce Study Highlights
Refer to [`LAB_EXPERIMENT_12_MANUAL.md`](LAB_EXPERIMENT_12_MANUAL.md) or [`http://localhost:3000/lab-manual`](http://localhost:3000/lab-manual) for all 12 categorized viva questions covering:
- Node.js Event Loop & Libuv C++ Threadpool vs Multi-threaded Apache
- Differences between `req.params`, `req.query`, and `req.body`
- Express middleware flow and `next()`
- XSS prevention with `<%= %>` vs raw `<%- %>`
- HTTP status codes (2xx, 4xx, 5xx)
- Nodemon configuration and hot-reload hooks
