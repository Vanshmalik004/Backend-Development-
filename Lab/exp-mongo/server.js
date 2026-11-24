// server.js
// Experiment 13 A: MongoDB, Mongoose, and Express User Registration and Login System
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');

const app = express();

// Middleware to parse JSON and URL-encoded form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ============================================
// STEP 1: CONNECT TO MONGODB
// ============================================

// Connection string: supports .env, local mongod, or MongoDB Atlas
const DB_URL = process.env.DB_URL || 'mongodb://localhost:27017/userdb';

function connectDB(url = DB_URL) {
  if (url.includes('<db_username>') || url.includes('<username>') || url.includes('<password>')) {
    console.warn('\n⚠️  MongoDB Atlas Setup Reminder:');
    console.warn('   Your connection string contains placeholder angle brackets (e.g., <db_username>).');
    console.warn('   Please edit .env and replace <db_username> with your MongoDB Atlas database user.');
    console.warn('   (Found in Atlas Console -> Security -> Database Access)\n');
  }

  return mongoose.connect(url)
    .then(() => {
      console.log('Connected to MongoDB successfully');
      return mongoose.connection;
    })
    .catch((err) => {
      console.error('MongoDB connection error:', err.message);
      console.log('\nTip: To run with a temporary in-memory database without installing MongoDB, run:');
      console.log('  npm run demo:memory\n');
    });
}

// Connect to DB if running directly or DB_URL is explicitly set
if (process.env.NODE_ENV !== 'test') {
  connectDB();
}

// ============================================
// STEP 2: DEFINE THE USER SCHEMA
// ============================================

// Schema defines the structure of documents in the collection
const userSchema = new mongoose.Schema({
  username: {
    type: String,        // Field must be text
    required: true,      // Field is mandatory
    unique: true         // No two users can have same username
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now    // Automatically set to current date/time
  }
});

// ============================================
// STEP 3: CREATE THE MODEL
// ============================================

// Model is the interface to interact with the database
// Mongoose automatically maps 'User' to the 'users' collection in MongoDB
const User = mongoose.models.User || mongoose.model('User', userSchema);

// Shared Page Template Helper for Consistent, Modern UI Styling
function renderPage(title, content) {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title} | Exp 13 A</title>
      <style>
        :root {
          --primary: #4f46e5;
          --primary-hover: #4338ca;
          --bg: #0f172a;
          --card-bg: #1e293b;
          --border: #334155;
          --text: #f8fafc;
          --text-muted: #94a3b8;
          --success: #10b981;
          --error: #ef4444;
        }
        * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; }
        body {
          background-color: var(--bg);
          color: var(--text);
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 40px 20px;
        }
        .wrapper {
          width: 100%;
          max-width: 860px;
        }
        header {
          text-align: center;
          margin-bottom: 35px;
        }
        .badge {
          display: inline-block;
          background: rgba(79, 70, 229, 0.2);
          color: #a5b4fc;
          border: 1px solid rgba(99, 102, 241, 0.3);
          padding: 4px 12px;
          border-radius: 9999px;
          font-size: 0.82rem;
          font-weight: 600;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          margin-bottom: 12px;
        }
        h1 {
          font-size: 2.2rem;
          font-weight: 800;
          letter-spacing: -0.02em;
          background: linear-gradient(135deg, #ffffff 0%, #cbd5e1 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin-bottom: 8px;
        }
        .subtitle {
          color: var(--text-muted);
          font-size: 1rem;
        }
        .grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(360px, 1fr));
          gap: 24px;
          margin-bottom: 24px;
        }
        .container {
          background: var(--card-bg);
          border: 1px solid var(--border);
          border-radius: 14px;
          padding: 26px;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3);
          transition: transform 0.2s ease, border-color 0.2s ease;
        }
        .container:hover {
          border-color: #475569;
        }
        h2 {
          color: #f1f5f9;
          font-size: 1.3rem;
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .input-group {
          margin-bottom: 14px;
        }
        label {
          display: block;
          font-size: 0.85rem;
          font-weight: 500;
          color: var(--text-muted);
          margin-bottom: 6px;
        }
        input {
          width: 100%;
          padding: 11px 14px;
          background: #0f172a;
          border: 1px solid var(--border);
          border-radius: 8px;
          color: #fff;
          font-size: 0.95rem;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        input:focus {
          border-color: var(--primary);
          box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.25);
        }
        button {
          width: 100%;
          background: var(--primary);
          color: white;
          padding: 12px 20px;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          font-size: 0.95rem;
          transition: background 0.2s, transform 0.1s;
          margin-top: 4px;
        }
        button:hover {
          background: var(--primary-hover);
        }
        button:active {
          transform: translateY(1px);
        }
        .btn-secondary {
          background: #334155;
        }
        .btn-secondary:hover {
          background: #475569;
        }
        .status-box {
          background: var(--card-bg);
          border: 1px solid var(--border);
          border-radius: 14px;
          padding: 36px;
          text-align: center;
          max-width: 580px;
          margin: 40px auto;
          box-shadow: 0 15px 30px rgba(0, 0, 0, 0.4);
        }
        .status-icon {
          font-size: 3rem;
          margin-bottom: 16px;
          display: inline-block;
        }
        .success { color: var(--success); font-size: 1.6rem; font-weight: 700; margin-bottom: 12px; }
        .error { color: var(--error); font-size: 1.6rem; font-weight: 700; margin-bottom: 12px; }
        .info-card {
          background: #0f172a;
          border: 1px solid var(--border);
          border-radius: 8px;
          padding: 16px;
          margin: 20px 0;
          text-align: left;
          font-size: 0.95rem;
        }
        .info-card p {
          margin: 8px 0;
          color: #cbd5e1;
        }
        .info-card strong {
          color: #f8fafc;
        }
        a.back-btn {
          display: inline-block;
          margin-top: 14px;
          color: #a5b4fc;
          text-decoration: none;
          font-weight: 600;
          border: 1px solid rgba(165, 180, 252, 0.3);
          padding: 10px 22px;
          border-radius: 8px;
          transition: all 0.2s;
        }
        a.back-btn:hover {
          background: rgba(165, 180, 252, 0.1);
          color: #ffffff;
        }
        ul.user-list {
          list-style: none;
          margin: 20px 0;
          display: flex;
          flex-direction: column;
          gap: 12px;
          text-align: left;
        }
        ul.user-list li {
          background: #0f172a;
          border: 1px solid var(--border);
          padding: 16px 20px;
          border-radius: 10px;
          display: flex;
          flex-wrap: wrap;
          justify-content: space-between;
          align-items: center;
          gap: 10px;
        }
        .user-tag {
          font-weight: 700;
          color: #818cf8;
          font-size: 1.05rem;
        }
        .user-meta {
          font-size: 0.88rem;
          color: var(--text-muted);
        }
        footer {
          margin-top: 40px;
          text-align: center;
          color: #64748b;
          font-size: 0.85rem;
        }
      </style>
    </head>
    <body>
      <div class="wrapper">
        ${content}
      </div>
      <footer>
        Experiment 13 A &bull; MongoDB, Mongoose, and Express User Registration & Login &bull; UPES SOCS
      </footer>
    </body>
    </html>
  `;
}

// ============================================
// STEP 4: CREATE ROUTES
// ============================================

// HOME ROUTE - Display registration form, login form, and view all users button
app.get('/', (req, res) => {
  const pageContent = `
    <header>
      <span class="badge">Experiment 13 A</span>
      <h1>User Management System</h1>
      <p class="subtitle">MongoDB, Mongoose & Express User Registration and Login Tutorial</p>
    </header>

    <div class="grid">
      <!-- Register New User Form -->
      <div class="container">
        <h2><span>📝</span> Register New User</h2>
        <form action="/signup" method="POST">
          <div class="input-group">
            <label for="reg-username">Username</label>
            <input type="text" id="reg-username" name="username" placeholder="e.g. john_doe" required>
          </div>
          <div class="input-group">
            <label for="reg-email">Email Address</label>
            <input type="email" id="reg-email" name="email" placeholder="e.g. john@example.com" required>
          </div>
          <div class="input-group">
            <label for="reg-password">Password</label>
            <input type="password" id="reg-password" name="password" placeholder="Create a secure password" required>
          </div>
          <button type="submit">Sign Up</button>
        </form>
      </div>

      <!-- Login Form -->
      <div class="container">
        <h2><span>🔐</span> User Login</h2>
        <form action="/login" method="POST">
          <div class="input-group">
            <label for="login-username">Username</label>
            <input type="text" id="login-username" name="username" placeholder="Enter your username" required>
          </div>
          <div class="input-group">
            <label for="login-password">Password</label>
            <input type="password" id="login-password" name="password" placeholder="Enter your password" required>
          </div>
          <button type="submit">Login</button>
        </form>
      </div>
    </div>

    <!-- View All Registered Users Action -->
    <div class="container" style="text-align: center;">
      <h2><span>👥</span> Registered Users Directory</h2>
      <p style="color: var(--text-muted); margin-bottom: 16px;">View all saved user documents stored in MongoDB database collection.</p>
      <form action="/users" method="GET">
        <button type="submit" class="btn-secondary" style="max-width: 280px; margin: 0 auto;">Show All Registered Users</button>
      </form>
    </div>
  `;

  res.send(renderPage('Home', pageContent));
});

// SIGNUP ROUTE - Register a new user
app.post('/signup', async (req, res) => {
  try {
    // Get data from the form submission
    const { username, email, password } = req.body;

    // Create a new user document
    const newUser = new User({
      username: username,
      email: email,
      password: password
    });

    // Save the document to MongoDB
    await newUser.save();

    const content = `
      <div class="status-box">
        <span class="status-icon">🎉</span>
        <h2 class="success">User registered successfully!</h2>
        <div class="info-card">
          <p><strong>Username:</strong> ${username}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Status:</strong> Saved to MongoDB <code>users</code> collection</p>
        </div>
        <a href="/" class="back-btn">&larr; Go back to home</a>
      </div>
    `;
    res.send(renderPage('Registration Successful', content));

  } catch (error) {
    // Handle duplicate username or email error (MongoDB E11000)
    let errorMessage = error.message;
    if (error.code === 11000) {
      errorMessage = 'Error: Username or email already exists in the database.';
    }

    const content = `
      <div class="status-box">
        <span class="status-icon">⚠️</span>
        <h2 class="error">Registration Failed</h2>
        <p style="color: var(--text-muted); margin: 12px 0;">${errorMessage}</p>
        <a href="/" class="back-btn">&larr; Go back and try again</a>
      </div>
    `;
    res.status(400).send(renderPage('Registration Error', content));
  }
});

// LOGIN ROUTE - Check user credentials
app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Find user in database
    const user = await User.findOne({ username: username });

    // Check if user exists
    if (!user) {
      const content = `
        <div class="status-box">
          <span class="status-icon">❌</span>
          <h2 class="error">User not found</h2>
          <p style="color: var(--text-muted); margin: 12px 0;">No account found with username "<strong>${username}</strong>".</p>
          <a href="/" class="back-btn">&larr; Go back and try again</a>
        </div>
      `;
      return res.status(404).send(renderPage('User Not Found', content));
    }

    // Check if password matches
    if (user.password !== password) {
      const content = `
        <div class="status-box">
          <span class="status-icon">🔒</span>
          <h2 class="error">Incorrect password</h2>
          <p style="color: var(--text-muted); margin: 12px 0;">The password you provided is invalid. Please try again.</p>
          <a href="/" class="back-btn">&larr; Go back and try again</a>
        </div>
      `;
      return res.status(401).send(renderPage('Invalid Password', content));
    }

    // Login successful
    const content = `
      <div class="status-box">
        <span class="status-icon">🚀</span>
        <h2 class="success">Login successful!</h2>
        <div class="info-card">
          <p><strong>Welcome back:</strong> ${user.username}</p>
          <p><strong>Email:</strong> ${user.email}</p>
          <p><strong>Account Created:</strong> ${user.createdAt ? user.createdAt.toDateString() : 'N/A'}</p>
        </div>
        <a href="/" class="back-btn">&larr; Go back to home</a>
      </div>
    `;
    res.send(renderPage('Login Successful', content));

  } catch (error) {
    const content = `
      <div class="status-box">
        <span class="status-icon">⚠️</span>
        <h2 class="error">Error: ${error.message}</h2>
        <a href="/" class="back-btn">&larr; Go back and try again</a>
      </div>
    `;
    res.status(500).send(renderPage('Login Error', content));
  }
});

// GET ALL USERS ROUTE - Display all registered users
app.get('/users', async (req, res) => {
  try {
    // Find all users in the database
    const allUsers = await User.find();

    // Check if there are any users
    if (allUsers.length === 0) {
      const content = `
        <div class="status-box">
          <span class="status-icon">📭</span>
          <h2>No users registered yet</h2>
          <p style="color: var(--text-muted); margin: 12px 0;">Be the first user to create an account!</p>
          <a href="/" class="back-btn">&larr; Go back to home</a>
        </div>
      `;
      return res.send(renderPage('Users Directory', content));
    }

    // Create HTML to display users
    let userItems = '';
    allUsers.forEach((user) => {
      userItems += `
        <li>
          <div>
            <span class="user-tag">@${user.username}</span>
            <div class="user-meta">${user.email}</div>
          </div>
          <div class="user-meta">
            Joined ${user.createdAt ? user.createdAt.toLocaleDateString() : 'Recent'}
          </div>
        </li>
      `;
    });

    const content = `
      <div class="container" style="max-width: 680px; margin: 20px auto;">
        <h2><span>👥</span> Registered Users (${allUsers.length})</h2>
        <ul class="user-list">
          ${userItems}
        </ul>
        <div style="text-align: center; margin-top: 24px;">
          <a href="/" class="back-btn">&larr; Go back to home</a>
        </div>
      </div>
    `;
    res.send(renderPage('Registered Users', content));

  } catch (error) {
    const content = `
      <div class="status-box">
        <span class="status-icon">⚠️</span>
        <h2 class="error">Error: ${error.message}</h2>
        <a href="/" class="back-btn">&larr; Go back and try again</a>
      </div>
    `;
    res.status(500).send(renderPage('Error', content));
  }
});

// ============================================
// START THE SERVER
// ============================================

const PORT = process.env.PORT || 3000;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

module.exports = { app, User, connectDB };
