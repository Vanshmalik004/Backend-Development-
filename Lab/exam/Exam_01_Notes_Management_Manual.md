# Backend Development Lab Examination: Notes Management Application (Exam 01)

**Course:** Backend Development  
**Institution:** School of Computer Science (SOCS), UPES  
**Student Name:** Vansh Malik  
**Duration:** 60 Minutes  
**Maximum Marks:** 30  

---

## 1. Experiment Objective

To design, develop, and test a full-stack **Notes Management Application ("My Notes")** using **Node.js**, **Express.js**, **EJS (Embedded JavaScript)**, and **MongoDB**.

### Specific Learning Outcomes
- Implement server-side routing and URL parameter handling in Express.
- Utilize server-side templating (EJS) with reusable partials (`header`, `footer`) and dynamic data interpolation.
- Establish persistent connections to MongoDB using the official Node.js driver (`MongoClient`).
- Perform core CRUD (Create, Read, Update, Delete) operations using MongoDB collection methods (`insertOne`, `find`, `updateOne`, `deleteOne`).
- Handle BSON `ObjectId` conversions for unique document querying and deletion.
- Implement server-side input validation and error handling.
- Deliver advanced search and filtering capabilities using regular expression matching and query strings.

---

## 2. Technology Stack & Prerequisites

| Layer | Technology | Role |
| :--- | :--- | :--- |
| **Backend Environment** | Node.js (v18+) | Non-blocking, event-driven JavaScript runtime |
| **Web Server Framework**| Express.js (v4.x) | HTTP request handling, middleware pipeline, routing |
| **Template Engine** | EJS (Embedded JavaScript)| Dynamic HTML generation on the server |
| **Database** | MongoDB | Document-oriented NoSQL database |
| **Database Client** | Native `mongodb` Driver | High-performance direct connection pool |
| **Styling** | Vanilla CSS3 | Custom responsive grid, card components, badge system |

---

## 3. Theoretical Background & Key Concepts

### 3.1 Document-Oriented Database (MongoDB)
Unlike relational databases that store data in fixed-column tables with foreign key constraints, MongoDB stores records as flexible, self-describing **BSON (Binary JSON)** documents inside **collections**.

- **Database:** `notes_lab`
- **Collection:** `notes`
- **Document Structure:**
  ```json
  {
    "_id": ObjectId("65f3a123bc89a4567890def1"),
    "title": "Backend Lab Exam",
    "content": "Implement notes app with Express & MongoDB.",
    "category": "Study",
    "createdAt": "2026-09-22T09:15:00.000Z"
  }
  ```

### 3.2 The Role of `ObjectId`
In MongoDB, each document requires a unique primary key named `_id`. By default, MongoDB assigns a 12-byte `ObjectId` consisting of:
- 4-byte timestamp value (seconds since Unix epoch)
- 5-byte random value (machine and process identifier)
- 3-byte incrementing counter

When querying or deleting documents via URL route parameters (`/notes/:id`), the string parameter must be converted to an `ObjectId`:
```javascript
const { ObjectId } = require('mongodb');
const note = await notesCollection.findOne({ _id: new ObjectId(req.params.id) });
```

### 3.3 Server-Side Rendering (SSR) vs Single-Page Applications (SPA)
In SSR using EJS:
- The server executes the database query, interpolates the data into HTML templates, and sends a complete HTML document to the client browser.
- Advantages include faster initial page rendering, lower client-side resource consumption, zero client-side framework overhead, and superior search engine discoverability.

---

## 4. Route Architecture & Specification

| Method | Route | Description | Compulsory / Bonus |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | Redirects to `/notes` | Compulsory |
| `GET` | `/notes` | Retrieves and displays all notes with search and category filters | Compulsory + Bonus |
| `GET` | `/notes/new` | Renders HTML form for creating a new note | Compulsory |
| `POST` | `/notes` | Validates input and inserts a new note into MongoDB | Compulsory |
| `GET` | `/notes/:id` | Renders detailed view of an individual note | Core |
| `GET` | `/notes/:id/edit` | Renders edit form pre-populated with note data | **Bonus** |
| `POST` | `/notes/:id/edit` | Validates and updates the note document in MongoDB | **Bonus** |
| `POST` | `/notes/:id/delete` | Deletes the note from MongoDB by `ObjectId` | Compulsory |

---

## 5. Implementation Details

### 5.1 MongoDB Connection Pooling
Reusing a single persistent `MongoClient` instance avoids the overhead of establishing a new TCP connection on every HTTP request:
```javascript
const { MongoClient, ObjectId } = require("mongodb");
const mongoURL = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017";
const client = new MongoClient(mongoURL);

let notesCollection;

async function connectDB() {
  await client.connect();
  const database = client.db("notes_lab");
  notesCollection = database.collection("notes");
  console.log("Connected to MongoDB");
}
```

### 5.2 Form Validation & Note Creation
Input fields are sanitized and verified to ensure neither title nor content is submitted empty:
```javascript
app.post('/notes', async (req, res) => {
  const { title, content, category } = req.body;
  const trimmedTitle = (title || '').trim();
  const trimmedContent = (content || '').trim();

  if (!trimmedTitle || !trimmedContent) {
    return res.status(400).render('new', {
      title: 'Add New Note',
      note: { title: trimmedTitle, content: trimmedContent, category },
      errorMessage: 'Validation Error: Both Note Title and Content are required.'
    });
  }

  await notesCollection.insertOne({
    title: trimmedTitle,
    content: trimmedContent,
    category: category || 'Other',
    createdAt: new Date()
  });

  res.redirect('/notes');
});
```

### 5.3 Note Deletion
```javascript
app.post('/notes/:id/delete', async (req, res) => {
  const { id } = req.params;
  await notesCollection.deleteOne({ _id: new ObjectId(id) });
  res.redirect('/notes');
});
```

### 5.4 Bonus Features: Search & Category Filtering
```javascript
const { search, category } = req.query;
const filter = {};

if (search && search.trim() !== '') {
  filter.title = { $regex: search.trim(), $options: 'i' }; // Case-insensitive title search
}

if (category && category !== 'All') {
  filter.category = category.trim();
}

const notes = await notesCollection.find(filter).sort({ createdAt: -1 }).toArray();
```

---

## 6. Verification and Automated Testing

The experiment includes an automated test script (`test-notes.js`) testing all requirements:
1. **HTTP Status Codes:** Verifies `302 Found` for redirects, `200 OK` for template rendering, `400 Bad Request` for invalid input, and `404 Not Found` for invalid IDs.
2. **Database Integrity:** Directly queries the MongoDB collection to verify document insertion, correct property assignment (`createdAt`, `category`), and deletion confirmation.
3. **Template Output:** Confirms that generated HTML contains note cards, category badges, and deletion action buttons.

---

## 7. Viva Voce Questions & Answers

### Q1. What is the difference between BSON and JSON?
**Answer:** JSON is a human-readable text format supporting basic types (string, number, boolean, array, object, null). BSON (Binary JSON) is a binary-encoded serialization of JSON-like documents used internally by MongoDB. BSON adds support for specialized data types not expressible in standard JSON, including `ObjectId`, `Date`, `Binary data`, `Decimal128`, and 64-bit integers (`Long`), while facilitating high-speed parsing and traversal.

### Q2. Why is `ObjectId` required when querying documents by their `_id`?
**Answer:** In MongoDB, the `_id` field is stored as a BSON `ObjectId` (a 12-byte hexadecimal representation), not a plain string. When a client submits an ID through an Express route (`/notes/:id`), `req.params.id` is a string. Passing a string directly into `{ _id: req.params.id }` will fail to match because type comparison in MongoDB is strict. Converting via `new ObjectId(req.params.id)` ensures the query matches the internal BSON type.

### Q3. Why should we reuse `MongoClient` rather than calling `client.connect()` per request?
**Answer:** Creating a new database connection for each HTTP request incurs severe network latency, causes thread exhaustion, and overburdens the MongoDB daemon with TCP handshakes and authentication handshakes. Reusing a single `MongoClient` enables connection pooling, where a pool of pre-established sockets is shared across concurrent asynchronous requests.

### Q4. What is the purpose of `express.urlencoded({ extended: true })` middleware?
**Answer:** HTML forms submit data with the MIME type `application/x-www-form-urlencoded`. Express by default does not parse incoming request bodies. The `express.urlencoded()` middleware parses these URL-encoded payloads and populates `req.body` with JavaScript key-value pairs. Setting `extended: true` allows parsing of rich objects and arrays using the `qs` library.

### Q5. How does EJS prevent Cross-Site Scripting (XSS) attacks?
**Answer:** EJS uses different delimiter tags:
- `<%= value %>` automatically HTML-escapes special characters (converting `<`, `>`, `&`, `"`, `'` to their HTML entity equivalents), mitigating XSS vulnerabilities.
- `<%- value %>` outputs unescaped raw HTML (used selectively for including trusted layout partials like `<%- include('partials/header') %>`).

---

## 8. Evaluation Scheme Mapping

| Evaluation Criteria | Maximum Marks | Achieved Features |
| :--- | :---: | :--- |
| **Project setup and MongoDB connection** | 5 | Modular Express configuration, native `MongoClient` pool, zero-config in-memory fallback. |
| **Add-note form and insertion** | 6 | Clean EJS form (`GET /notes/new`), `createdAt` timestamp, input trimming, MongoDB `insertOne`. |
| **Retrieve and display notes** | 6 | Home page grid (`GET /notes`), Title, Content preview, Category badge, Date, Empty state. |
| **Delete operation** | 4 | Single-action `POST /notes/:id/delete`, `ObjectId` conversion, removal from MongoDB, redirect. |
| **EJS template usage** | 4 | Modular `views/` directory with reusable `partials/header.ejs` and `partials/footer.ejs`. |
| **Validation and error handling** | 3 | Server-side validation rejecting empty title/content (`400 Bad Request`) with error message. |
| **Code organization and interface** | 2 | Clean separation of concerns, robust CSS design system, responsive card grid. |
| **Bonus Requirements** | +3 | **All 4 bonus features implemented:** Note editing, title search, category filter, custom CSS UI. |
| **Total** | **30 Marks** | **Full Marks + Maximum Bonus Eligibility** |
