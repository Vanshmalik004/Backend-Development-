# Experiment 13 A: MongoDB, Mongoose, and Express User Registration and Login System

A beginner-friendly and comprehensive laboratory implementation demonstrating user registration, credential authentication, and data retrieval using **Express.js**, **Mongoose ODM**, and **MongoDB**.

---

## Table of Contents
1. [Experiment Objective](#experiment-objective)
2. [Key Concepts](#key-concepts)
3. [Project Structure](#project-structure)
4. [Installation & Setup](#installation--setup)
5. [How to Run](#how-to-run)
   - [Option 1: Zero-Config In-Memory Server (Instant Demo)](#option-1-zero-config-in-memory-server-instant-demo)
   - [Option 2: Local MongoDB](#option-2-local-mongodb)
   - [Option 3: MongoDB Atlas Cloud](#option-3-mongodb-atlas-cloud)
6. [API & Route Documentation](#api--route-documentation)
7. [Code Architecture Walkthrough](#code-architecture-walkthrough)
8. [Automated Testing](#automated-testing)
9. [Viva & Lab Evaluation Q&A](#viva--lab-evaluation-qa)

---

## Experiment Objective
- Learn how to connect an Express.js backend application to MongoDB using the Mongoose Object Data Modeling (ODM) library.
- Define a strongly-typed schema and model for user documents.
- Implement user registration (`POST /signup`) with duplicate entry prevention (handling MongoDB error code `11000`).
- Implement user authentication (`POST /login`) verifying user existence and password matching.
- Retrieve and render existing user documents (`GET /users`) using `User.find()`.

---

## Key Concepts

### 1. What is Mongoose?
Mongoose is an Object Data Modeling (ODM) library for MongoDB and Node.js. It provides:
- **Schemas**: Define the structure of your documents, default values, and validations.
- **Models**: High-level constructors compiled from schemas that represent collections and allow querying/saving documents.
- **Validation**: Enforces mandatory fields, types, regex checks, and uniqueness before writing to the database.
- **Query Building**: Provides an intuitive promise-based API (`find`, `findOne`, `save`, `updateOne`, `deleteOne`).

### 2. Schema vs Model
- **Schema**: The blueprint specifying field names, data types, constraints, and default values.
  ```javascript
  const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
  });
  ```
- **Model**: The operational wrapper around the schema that directly interacts with the MongoDB collection.
  ```javascript
  const User = mongoose.model('User', userSchema);
  // MongoDB creates a collection called 'users' (lowercase, pluralized)
  ```

---

## Project Structure

```
exp-mongo/
├── .env                                       # Environment configuration
├── .env.example                               # Sample environment variables
├── .gitignore                                 # Git ignore file
├── Exp_13_A_MongoDB_Mongoose_Express_Manual.md # Official syllabus lab manual
├── package.json                               # Dependencies and npm scripts
├── README.md                                  # Complete experiment documentation
├── server.js                                  # Main Express & Mongoose server
└── test-app.js                                # Automated test suite & in-memory runner
```

---

## Installation & Setup

1. Open your terminal and navigate to this experiment directory:
   ```bash
   cd "Lab/exp-mongo"
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

---

## How to Run

### Option 1: Zero-Config In-Memory Server (Instant Demo)
If you do not have MongoDB installed locally and haven't created a MongoDB Atlas cluster yet, you can run the application immediately with an automated in-memory MongoDB database:
```bash
npm run demo:memory
```
This spins up an in-memory MongoDB instance and launches the server at `http://localhost:3000`.

---

### Option 2: Local MongoDB
1. Ensure the MongoDB daemon (`mongod`) is running on your system:
   ```bash
   mongod
   ```
2. Verify `.env` has:
   ```env
   PORT=3000
   DB_URL=mongodb://localhost:27017/userdb
   ```
3. Start the server:
   ```bash
   npm start
   ```
   Or for auto-reloading during development:
   ```bash
   npm run dev
   ```

---

### Option 3: MongoDB Atlas Cloud
1. Create a free cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a database user with username and password under **Database Access**.
3. Allow your IP address under **Network Access** (`0.0.0.0/0` or current IP).
4. Get your connection string under **Connect > Drivers**.
5. Update your `.env` file:
   ```env
   PORT=3000
   DB_URL=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/userdb?retryWrites=true&w=majority
   ```
6. Run the server:
   ```bash
   npm start
   ```

---

## API & Route Documentation

| Method | Route | Description | Parameters / Payload |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | Home page with registration form, login form, and directory button | None |
| `POST` | `/signup` | Registers a new user document in MongoDB | `username`, `email`, `password` |
| `POST` | `/login` | Authenticates user credentials against MongoDB | `username`, `password` |
| `GET` | `/users` | Lists all registered users stored in the database | None |

---

## Code Architecture Walkthrough

### 1. Connection Lifecycle
```javascript
const DB_URL = process.env.DB_URL || 'mongodb://localhost:27017/userdb';

mongoose.connect(DB_URL)
  .then(() => console.log('Connected to MongoDB successfully'))
  .catch(err => console.error('MongoDB connection error:', err));
```

### 2. Handling Duplicate Key Errors (Code 11000)
When creating a document with fields marked `unique: true`, MongoDB enforces a unique index. If a duplicate username or email is submitted, Mongoose catches error code `11000`:
```javascript
try {
  await newUser.save();
  res.send('User registered successfully!');
} catch (error) {
  if (error.code === 11000) {
    res.status(400).send('Error: Username or email already exists');
  } else {
    res.status(500).send(`Error: ${error.message}`);
  }
}
```

### 3. User Authentication
```javascript
const user = await User.findOne({ username: username });
if (!user) {
  return res.status(404).send('User not found');
}
if (user.password !== password) {
  return res.status(401).send('Incorrect password');
}
res.send('Login successful!');
```

---

## Automated Testing

An automated test suite is included in `test-app.js`. It validates all routes, documents, uniqueness constraints, and error codes:

```bash
npm test
```

### Test Coverage:
1. `GET /`: Serving the home page with forms.
2. `POST /signup`: Storing a new user document in MongoDB.
3. `POST /signup`: Rejecting duplicate username/email with code 11000.
4. `POST /login`: Successful authentication with matching credentials.
5. `POST /login`: Rejection with incorrect password (401).
6. `POST /login`: Rejection when user does not exist (404).
7. `GET /users`: Fetching and rendering all registered users.

---

## Viva & Lab Evaluation Q&A

**Q1: What is the role of Mongoose in a Node.js application?**  
**A:** Mongoose is an ODM (Object Data Modeling) library that provides a structured, schema-based solution to model application data, handle validation, build queries, and manage database connections with MongoDB.

**Q2: How does Mongoose determine the collection name?**  
**A:** When defining `mongoose.model('User', userSchema)`, Mongoose automatically creates or accesses a collection with the lowercase, pluralized name: `'users'`.

**Q3: What causes MongoDB error code 11000?**  
**A:** Error code 11000 is a duplicate key error triggered when an attempt is made to insert or update a document with a field value that violates a `unique: true` index constraint.

**Q4: Why should passwords never be stored in plain text in production?**  
**A:** If the database is compromised, plain text passwords expose user accounts across multiple services. Production apps must always hash passwords using a one-way cryptographic hashing algorithm like `bcrypt` with salt rounds.

**Q5: What is the difference between `User.find()` and `User.findOne()`?**  
**A:** `User.find()` returns an array of all documents matching the query criteria (or all documents if empty). `User.findOne()` returns the single first document matching the query, or `null` if not found.
