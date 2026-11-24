// server.js
// Notes Management Application ("My Notes")
// Backend Development Lab Examination (Exam 01)
// Stack: Node.js, Express.js, EJS, MongoDB (Native Driver)

require('dotenv').config();
const path = require('path');
const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');

const app = express();
const PORT = process.env.PORT || 3000;
const DEFAULT_MONGO_URL = process.env.MONGODB_URI || process.env.DB_URL || 'mongodb://127.0.0.1:27017';
const DB_NAME = process.env.DB_NAME || 'notes_lab';
const COLLECTION_NAME = process.env.COLLECTION_NAME || 'notes';

let client = null;
let notesCollection = null;
let memoryServer = null;

// Available Note Categories for consistency and filtering
const CATEGORIES = ['Study', 'Work', 'Personal', 'Ideas', 'Important', 'Other'];

// Helper to mask MongoDB URI credentials for safe logging
function maskMongoUri(uri) {
  try {
    return uri.replace(/:\/\/(.*?):(.*?)@/, '://$1:••••••••@');
  } catch {
    return uri;
  }
}

// Express Configuration
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Middleware to expose categories and query to all views
app.use((req, res, next) => {
  res.locals.categories = CATEGORIES;
  res.locals.query = req.query || {};
  res.locals.currentPath = req.path;
  next();
});

// Database Connection Helper
async function connectDB(customUri = null) {
  if (notesCollection) return notesCollection;

  const uriToUse = customUri || DEFAULT_MONGO_URL;
  const isAtlas = uriToUse.startsWith('mongodb+srv://') || uriToUse.includes('.mongodb.net');
  const timeoutMs = isAtlas ? 8000 : 2500;

  const hasPlaceholders = uriToUse.includes('<db_username>') || uriToUse.includes('<username>') || uriToUse.includes('<password>');
  if (hasPlaceholders) {
    console.warn('\n⚠️  MongoDB Atlas Configuration Notice:');
    console.warn('   Your MONGODB_URI contains placeholder angle brackets (e.g. <db_username>).');
    console.warn('   Please edit .env and replace <db_username> with your MongoDB Atlas database user.');
    console.warn('   (Found in Atlas Console -> Security -> Database Access)\n');
  }

  try {
    console.log(`Connecting to MongoDB at: ${maskMongoUri(uriToUse)} (Database: ${DB_NAME})...`);
    client = new MongoClient(uriToUse, { serverSelectionTimeoutMS: timeoutMs });
    await client.connect();

    const database = client.db(DB_NAME);
    notesCollection = database.collection(COLLECTION_NAME);

    if (isAtlas) {
      console.log(' Successfully connected to MongoDB Atlas Cloud Cluster!');
    } else {
      console.log(' Successfully connected to MongoDB server!');
    }
    return notesCollection;
  } catch (err) {
    console.error('\n❌ MongoDB Connection Error:', err.message);
    if (isAtlas) {
      console.error('💡 Atlas Troubleshooting Tips:');
      console.error('   1. Check username and password in MONGODB_URI (e.g. replace <db_username> with your user).');
      console.error('   2. Verify Network Access in Atlas: Ensure your current IP is added (or 0.0.0.0/0 for testing).');
      console.error('   3. If password contains special characters like @, $, #, ensure they are URL-encoded.\n');
    }

    // Fallback to in-memory MongoDB so server can always start
    console.warn('⚠️  Falling back to built-in in-memory MongoDB server for zero-config demonstration...');
      try {
        const { MongoMemoryServer } = require('mongodb-memory-server');
        memoryServer = await MongoMemoryServer.create();
        const memoryUri = memoryServer.getUri();
        console.log(` In-memory MongoDB running at: ${memoryUri}`);
        client = new MongoClient(memoryUri);
        await client.connect();
        const database = client.db(DB_NAME);
        notesCollection = database.collection(COLLECTION_NAME);

        // Pre-populate with sample notes if collection is empty
        const count = await notesCollection.countDocuments();
        if (count === 0) {
          await notesCollection.insertMany([
            {
              title: 'Backend Lab Exam 01',
              content: 'Design and develop the Notes Management Application using Node.js, Express, EJS, and MongoDB.',
              category: 'Study',
              createdAt: new Date(Date.now() - 3600000 * 4)
            },
            {
              title: 'Express & EJS Templating',
              content: 'Ensure all pages use server-side rendering with partials for header, footer, and category badges.',
              category: 'Work',
              createdAt: new Date(Date.now() - 3600000 * 2)
            },
            {
              title: 'Weekend Project Ideas',
              content: 'Explore WebSockets, Redis caching, and JWT authentication for future backend experiments.',
              category: 'Ideas',
              createdAt: new Date(Date.now() - 3600000)
            }
          ]);
          console.log(' Populated initial sample notes into in-memory database.');
        }
        return notesCollection;
      } catch (memErr) {
        console.error(' Failed to launch in-memory MongoDB:', memErr.message);
        throw err;
      }
  }
}

async function closeDB() {
  if (client) {
    await client.close();
    client = null;
    notesCollection = null;
  }
  if (memoryServer) {
    await memoryServer.stop();
    memoryServer = null;
  }
}

function getCollection() {
  return notesCollection;
}

// Ensure database connection middleware
app.use(async (req, res, next) => {
  if (!notesCollection) {
    try {
      await connectDB();
    } catch (err) {
      return res.status(500).render('error', {
        title: 'Database Connection Error',
        message: 'Could not connect to MongoDB. Please ensure MongoDB is running at mongodb://127.0.0.1:27017 or launch with in-memory mode.',
        error: process.env.NODE_ENV === 'development' ? err : {}
      });
    }
  }
  next();
});

// ==========================================
// ROUTES
// ==========================================

// Redirect root to /notes
app.get('/', (req, res) => {
  res.redirect('/notes');
});

/**
 * Route: GET /notes
 * Purpose: Display all notes with optional Search (Bonus) and Category Filter (Bonus)
 */
app.get('/notes', async (req, res) => {
  try {
    const { search, category } = req.query;
    const filter = {};

    // Bonus Requirement: Search notes by title (case-insensitive regex)
    if (search && search.trim() !== '') {
      filter.title = { $regex: search.trim(), $options: 'i' };
    }

    // Bonus Requirement: Filter notes by category
    if (category && category.trim() !== '' && category !== 'All') {
      filter.category = category.trim();
    }

    // Retrieve notes sorted by newest first
    const notes = await notesCollection.find(filter).sort({ createdAt: -1 }).toArray();

    // Calculate count per category for dashboard summary pills
    const allNotes = await notesCollection.find({}).toArray();
    const categoryCounts = {};
    CATEGORIES.forEach((cat) => (categoryCounts[cat] = 0));
    allNotes.forEach((n) => {
      if (categoryCounts[n.category] !== undefined) {
        categoryCounts[n.category]++;
      }
    });

    res.render('index', {
      title: 'My Notes - Dashboard',
      notes,
      totalNotes: allNotes.length,
      currentFilter: {
        search: search || '',
        category: category || 'All'
      },
      categoryCounts,
      successMessage: req.query.msg || null
    });
  } catch (err) {
    console.error('Error fetching notes:', err);
    res.status(500).render('error', {
      title: 'Server Error',
      message: 'Failed to retrieve notes from database.',
      error: err
    });
  }
});

/**
 * Route: GET /notes/new
 * Purpose: Display the add-note form
 */
app.get('/notes/new', (req, res) => {
  res.render('new', {
    title: 'Add New Note',
    note: { title: '', content: '', category: 'Study' },
    errorMessage: null
  });
});

/**
 * Route: POST /notes
 * Purpose: Validate inputs, insert new note into MongoDB, redirect to notes list
 */
app.post('/notes', async (req, res) => {
  const { title, content, category } = req.body;
  const trimmedTitle = (title || '').trim();
  const trimmedContent = (content || '').trim();
  const selectedCategory = (category || 'Other').trim();

  // Compulsory Requirement 2: Validate that title and content are not empty
  if (!trimmedTitle || !trimmedContent) {
    return res.status(400).render('new', {
      title: 'Add New Note',
      note: { title: trimmedTitle, content: trimmedContent, category: selectedCategory },
      errorMessage: 'Validation Error: Both Note Title and Content are compulsory and cannot be empty.'
    });
  }

  try {
    const newNote = {
      title: trimmedTitle,
      content: trimmedContent,
      category: selectedCategory,
      createdAt: new Date()
    };

    await notesCollection.insertOne(newNote);
    console.log(` Created note: "${trimmedTitle}" [${selectedCategory}]`);

    res.redirect('/notes?msg=' + encodeURIComponent('Note created successfully!'));
  } catch (err) {
    console.error('Error inserting note:', err);
    res.status(500).render('new', {
      title: 'Add New Note',
      note: { title: trimmedTitle, content: trimmedContent, category: selectedCategory },
      errorMessage: 'Database Error: Could not save note. Please try again.'
    });
  }
});

/**
 * Route: GET /notes/:id
 * Purpose: View a single note detail
 */
app.get('/notes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return res.status(400).render('error', {
        title: 'Invalid ID',
        message: `The provided note ID "${id}" is not a valid MongoDB ObjectId.`,
        error: {}
      });
    }

    const note = await notesCollection.findOne({ _id: new ObjectId(id) });
    if (!note) {
      return res.status(404).render('error', {
        title: 'Note Not Found',
        message: 'The requested note does not exist or has been deleted.',
        error: {}
      });
    }

    res.render('show', {
      title: note.title,
      note
    });
  } catch (err) {
    console.error('Error fetching note by ID:', err);
    res.status(500).render('error', {
      title: 'Server Error',
      message: 'Failed to retrieve note details.',
      error: err
    });
  }
});

/**
 * Route: GET /notes/:id/edit
 * Purpose: [Bonus Requirement] Display edit form pre-populated with note details
 */
app.get('/notes/:id/edit', async (req, res) => {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return res.status(400).render('error', {
        title: 'Invalid ID',
        message: 'Invalid MongoDB ObjectId format.',
        error: {}
      });
    }

    const note = await notesCollection.findOne({ _id: new ObjectId(id) });
    if (!note) {
      return res.status(404).render('error', {
        title: 'Note Not Found',
        message: 'The note you wish to edit could not be found.',
        error: {}
      });
    }

    res.render('edit', {
      title: `Edit Note - ${note.title}`,
      note,
      errorMessage: null
    });
  } catch (err) {
    console.error('Error loading edit form:', err);
    res.status(500).render('error', {
      title: 'Server Error',
      message: 'Error fetching note for edit.',
      error: err
    });
  }
});

/**
 * Route: POST /notes/:id/edit
 * Purpose: [Bonus Requirement] Validate and update an existing note
 */
app.post('/notes/:id/edit', async (req, res) => {
  const { id } = req.params;
  const { title, content, category } = req.body;
  const trimmedTitle = (title || '').trim();
  const trimmedContent = (content || '').trim();
  const selectedCategory = (category || 'Other').trim();

  if (!ObjectId.isValid(id)) {
    return res.status(400).render('error', {
      title: 'Invalid ID',
      message: 'Invalid MongoDB ObjectId format.',
      error: {}
    });
  }

  // Validate fields
  if (!trimmedTitle || !trimmedContent) {
    return res.status(400).render('edit', {
      title: 'Edit Note',
      note: { _id: id, title: trimmedTitle, content: trimmedContent, category: selectedCategory },
      errorMessage: 'Validation Error: Title and content cannot be empty.'
    });
  }

  try {
    const result = await notesCollection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          title: trimmedTitle,
          content: trimmedContent,
          category: selectedCategory,
          updatedAt: new Date()
        }
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).render('error', {
        title: 'Note Not Found',
        message: 'Could not find the note to update.',
        error: {}
      });
    }

    console.log(` Updated note: ${id} -> "${trimmedTitle}"`);
    res.redirect(`/notes?msg=${encodeURIComponent('Note updated successfully!')}`);
  } catch (err) {
    console.error('Error updating note:', err);
    res.status(500).render('edit', {
      title: 'Edit Note',
      note: { _id: id, title: trimmedTitle, content: trimmedContent, category: selectedCategory },
      errorMessage: 'Database Error: Failed to update note.'
    });
  }
});

/**
 * Route: POST /notes/:id/delete
 * Purpose: Compulsory Requirement 3: Delete note from MongoDB and redirect
 */
app.post('/notes/:id/delete', async (req, res) => {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return res.status(400).render('error', {
        title: 'Invalid ID',
        message: 'Invalid MongoDB ObjectId format.',
        error: {}
      });
    }

    const result = await notesCollection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return res.status(404).render('error', {
        title: 'Note Not Found',
        message: 'Could not delete: Note does not exist.',
        error: {}
      });
    }

    console.log(` Deleted note with ID: ${id}`);
    res.redirect('/notes?msg=' + encodeURIComponent('Note deleted successfully.'));
  } catch (err) {
    console.error('Error deleting note:', err);
    res.status(500).render('error', {
      title: 'Delete Failed',
      message: 'Failed to delete note from MongoDB.',
      error: err
    });
  }
});

// 404 Catch-All Route
app.use((req, res) => {
  res.status(404).render('error', {
    title: '404 - Page Not Found',
    message: `The requested path "${req.originalUrl}" was not found on this server.`,
    error: {}
  });
});

// Start Server when invoked directly
if (require.main === module) {
  connectDB()
    .then(() => {
      app.listen(PORT, () => {
        console.log(`\n=================================================`);
        console.log(`🚀 My Notes Application running on: http://localhost:${PORT}`);
        console.log(`📁 Database: ${DB_NAME} | Collection: ${COLLECTION_NAME}`);
        console.log(`📋 Available Categories: ${CATEGORIES.join(', ')}`);
        console.log(`=================================================\n`);
      });
    })
    .catch((err) => {
      console.error('Failed to start server:', err.message);
      process.exit(1);
    });
}

module.exports = { app, connectDB, closeDB, getCollection, CATEGORIES };
