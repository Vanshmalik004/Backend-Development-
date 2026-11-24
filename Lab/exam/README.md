# Exam 01: Notes Management Application ("My Notes")

A full-stack, server-side rendered **Notes Management Application** built for the **Backend Development Lab Examination (UPES SOCS)**.

---

## 📌 Table of Contents
1. [Experiment Overview](#experiment-overview)
2. [Technology Stack](#technology-stack)
3. [Features & Requirements Checklist](#features--requirements-checklist)
4. [Project Structure](#project-structure)
5. [Installation & Setup](#installation--setup)
6. [How to Run](#how-to-run)
   - [Option 1: Instant Zero-Config Demo (Built-in In-Memory MongoDB)](#option-1-instant-zero-config-demo-built-in-in-memory-mongodb)
   - [Option 2: Local MongoDB Lab Instance](#option-2-local-mongodb-lab-instance)
7. [Routing & API Reference](#routing--api-reference)
8. [MongoDB Schema & Data Model](#mongodb-schema--data-model)
9. [Automated Testing](#automated-testing)
10. [Bonus Features Implemented](#bonus-features-implemented)

---

## 🎯 Experiment Overview

The objective is to design and develop a web application named **My Notes** that allows users to create, view, search, filter, edit, and delete notes. Notes are stored in MongoDB and rendered server-side using **Express.js** and **EJS**.

---

## 🛠️ Technology Stack

| Component | Technology | Description |
| :--- | :--- | :--- |
| **Runtime** | Node.js (v18+) | Server-side JavaScript runtime |
| **Framework** | Express.js | Fast, minimalist web framework for Node.js |
| **Template Engine** | EJS (Embedded JavaScript) | Server-side template rendering |
| **Database** | MongoDB | Document database (`notes_lab.notes`) |
| **Database Driver** | MongoDB Node.js Driver (`mongodb`) | Native `MongoClient` & `ObjectId` |
| **Styles** | Vanilla CSS3 | Modern responsive grid, glassmorphism, category badges |

---

## ✅ Features & Requirements Checklist

### 1. Compulsory Requirements
- [x] **Display Notes (`GET /notes`)**: Retrieves all notes stored in MongoDB and displays Title, Content, Category, Creation Date, and Delete button.
- [x] **Empty State**: Displays a friendly message ("No Notes Available") when the database is empty or no results match the filter.
- [x] **Add Note Form (`GET /notes/new`)**: Clean HTML form with fields for Title, Category, and Content.
- [x] **Validation & Insertion (`POST /notes`)**: Validates that title and content are not empty. Inserts into MongoDB with creation timestamp and redirects back to `/notes`.
- [x] **Delete Note (`POST /notes/:id/delete`)**: Deletes note by `ObjectId` and redirects to the list.
- [x] **Server-Side Templates**: Clean EJS templates with modular partials for header, footer, and navigation.

### 2. Bonus Requirements (All 4 Implemented for Maximum Marks!)
- [x] **Edit Existing Note (`GET /notes/:id/edit` & `POST /notes/:id/edit`)**: Pre-populated edit form and update handler.
- [x] **Search Notes by Title (`GET /notes?search=...`)**: Real-time regex title search query.
- [x] **Filter Notes by Category (`GET /notes?category=...`)**: Interactive category pills with count badges (`Study`, `Work`, `Personal`, `Ideas`, `Important`).
- [x] **Premium User Interface**: Custom responsive design with polished typography, card hover animations, and alert banners.

---

## 📂 Project Structure

```text
exam/
├── .env.example                          # Environment variable template
├── .gitignore                            # Git ignore rules
├── Exam_01_Notes_Management_Manual.md     # Official syllabus lab manual with viva Q&A
├── package.json                          # Project dependencies & npm scripts
├── README.md                             # Comprehensive project documentation
├── server.js                             # Express application & MongoDB connection logic
├── test-notes.js                         # Automated verification test suite
├── public/
│   ├── css/
│   │   └── styles.css                    # Modern CSS design system & responsive layout
│   └── js/
│       └── app.js                        # Client-side confirmation & alert dismissal
└── views/
    ├── partials/
    │   ├── header.ejs                    # Navbar, branding & search bar partial
    │   └── footer.ejs                    # Semantic footer partial
    ├── index.ejs                         # Notes dashboard (grid, category pills, search)
    ├── new.ejs                           # Add note form with validation feedback
    ├── edit.ejs                          # Edit note form
    ├── show.ejs                          # Single note detail view
    └── error.ejs                         # 404 & 500 error display
```

---

## 🚀 Installation & Setup

1. Open your terminal and navigate to the project directory:
   ```bash
   cd "Backend-Development-/Lab/exam"
   # or
   cd "Lab/exam"
   ```

2. Install all required dependencies:
   ```bash
   npm install
   ```

---

## 💻 How to Run

### Option 1: Instant Zero-Config Demo (Built-in In-Memory MongoDB)
If a local MongoDB daemon is not running on your machine, you can launch the app immediately using the built-in in-memory MongoDB runner:
```bash
npm run demo:memory
```
*(Also, if you run `npm start` while local MongoDB is offline, `server.js` automatically detects this and starts an in-memory instance with sample notes for zero-hassle evaluation!)*

Open your browser at:
```text
http://localhost:3000
```

---

### Option 2: Local MongoDB Lab Instance
If your local MongoDB server is active:
```bash
# Ensure MongoDB is listening at mongodb://127.0.0.1:27017
npm start
```
To run with live reload during development:
```bash
npm run dev
```

---

### Option 3: MongoDB Atlas Cloud (Recommended for Remote / Cloud Setup)

You can easily connect this experiment to a free **MongoDB Atlas** cloud cluster:

1. **Get your Atlas Connection String:**
   - Log into [MongoDB Atlas](https://cloud.mongodb.com/).
   - Under **Clusters**, click **Connect** -> **Drivers** -> **Node.js**.
   - Copy the SRV connection string:
     ```text
     mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/notes_lab?retryWrites=true&w=majority
     ```

2. **Configure Atlas Security Settings:**
   - **Network Access:** In the Atlas sidebar, navigate to **Network Access** -> **Add IP Address** -> select **Allow Access From Anywhere** (`0.0.0.0/0`) or add your current IP address.
   - **Database Access:** Verify that your database user has read/write privileges and remember your password. *(Note: If your password contains special characters like `@` or `$`, encode them, e.g., `@` becomes `%40`)*.

3. **Set your `.env` file:**
   Open the `.env` file in the project folder and paste your connection string:
   ```env
   PORT=3000
   MONGODB_URI=mongodb+srv://yourUser:yourPassword@cluster0.xxxxx.mongodb.net/notes_lab?retryWrites=true&w=majority
   DB_NAME=notes_lab
   COLLECTION_NAME=notes
   ```

4. **Verify Atlas Connection:**
   Run the built-in diagnostic test tool:
   ```bash
   npm run test:atlas
   ```

5. **Start Application:**
   ```bash
   npm start
   ```
   The application will connect to your MongoDB Atlas cluster and log:
   ` Successfully connected to MongoDB Atlas Cloud Cluster!`

---

## 🛣️ Routing & API Reference

| Method | Route | Description | Compulsory / Bonus |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | Redirects to `/notes` | Compulsory |
| `GET` | `/notes` | Displays all notes with optional `?search=` and `?category=` | Compulsory + Bonus |
| `GET` | `/notes/new` | Renders the note creation form | Compulsory |
| `POST` | `/notes` | Validates input and inserts a new note into MongoDB | Compulsory |
| `GET` | `/notes/:id` | Displays detailed view of a single note | Core |
| `GET` | `/notes/:id/edit` | Displays form pre-populated with note details for editing | **Bonus** |
| `POST` | `/notes/:id/edit` | Updates the existing note document in MongoDB | **Bonus** |
| `POST` | `/notes/:id/delete` | Deletes note by MongoDB `_id` and redirects | Compulsory |

---

## 🗄️ MongoDB Schema & Data Model

Connection details:
```text
URL: mongodb://127.0.0.1:27017
Database: notes_lab
Collection: notes
```

Document structure:
```json
{
  "_id": "ObjectId('65f3a123bc89a4567890def1')",
  "title": "Backend Lab Exam",
  "content": "Complete Notes Management application using Express, EJS, and MongoDB.",
  "category": "Study",
  "createdAt": "2026-09-22T09:15:00.000Z",
  "updatedAt": "2026-09-22T09:30:00.000Z"
}
```

---

## 🧪 Automated Testing

An automated verification test suite is provided in `test-notes.js`. It executes 12 end-to-end tests validating every required route, MongoDB operation, validation rule, search filter, and deletion.

To run the test suite:
```bash
npm test
```

Expected Output:
```text
======================================================
🧪 RUNNING EXAM 01 AUTOMATED VERIFICATION SUITE
======================================================

  PASS: GET / redirects to /notes (Status 302)
  PASS: GET /notes renders 200 OK with empty state indicator
  PASS: GET /notes/new renders 200 OK with add-note form
  PASS: POST /notes with empty fields returns 400 with validation error message
  PASS: POST /notes creates document and redirects to /notes (Status 302)
  PASS: MongoDB contains new note with title, content, category, and createdAt Date
  PASS: GET /notes renders note card with title, category badge, and delete button
  PASS: GET /notes/:id renders 200 OK with complete note content
  PASS: GET /notes/:id/edit pre-populates form with existing note data
  PASS: POST /notes/:id/edit updates note and redirects to /notes (Status 302)
  PASS: MongoDB reflects updated title, category, and updatedAt timestamp
  PASS: Search query ?search= successfully filters notes by title (regex)
  PASS: Category filter ?category= correctly filters notes
  PASS: POST /notes/:id/delete removes note and redirects (Status 302)
  PASS: Verified note document is deleted from MongoDB collection

------------------------------------------------------
Test Results: 12 Passed, 0 Failed
------------------------------------------------------
🎉 ALL EXAM 01 REQUIREMENTS & BONUS TESTS PASSED PERFECTLY!
```

---

## 👨‍💻 Author
- **Name:** Vansh Malik
- **Course:** Backend Development Lab (UPES SOCS)
