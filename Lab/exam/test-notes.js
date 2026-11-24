// test-notes.js
// Automated Test Suite & In-Memory Demonstration Runner for Exam 01 (Notes Management Application)

process.env.NODE_ENV = 'test';
const http = require('http');
const querystring = require('querystring');
const { MongoClient, ObjectId } = require('mongodb');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { app, connectDB, closeDB, getCollection } = require('./server');

let mongoServer;
let client;
let notesCollection;

// HTTP Request helper
function makeRequest(server, options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data
        });
      });
    });

    req.on('error', reject);

    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}

async function startDatabase() {
  const localUrl = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017';
  try {
    console.log(`Checking local MongoDB connection at: ${localUrl}...`);
    client = new MongoClient(localUrl, { serverSelectionTimeoutMS: 2000 });
    await client.connect();
    const db = client.db('notes_lab_test');
    notesCollection = db.collection('notes');
    console.log(' Connected to local MongoDB instance for testing.');
    await connectDB(localUrl);
    return localUrl;
  } catch (e) {
    console.log(' Local MongoDB offline. Starting in-memory MongoDB instance for verification...');
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    console.log(` In-memory MongoDB running at: ${uri}`);
    await connectDB(uri);
    notesCollection = getCollection();
    return uri;
  }
}

async function runTests() {
  console.log('\n======================================================');
  console.log('🧪 RUNNING EXAM 01 AUTOMATED VERIFICATION SUITE');
  console.log('======================================================\n');

  await startDatabase();

  // Clear collection for a clean test run
  await notesCollection.deleteMany({});

  // Start test server on an ephemeral port
  const server = app.listen(0);
  const port = server.address().port;
  console.log(` Test server listening on port: ${port}\n`);

  let passed = 0;
  let failed = 0;

  function assert(condition, testName) {
    if (condition) {
      console.log(`  PASS: ${testName}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${testName}`);
      failed++;
    }
  }

  try {
    // ----------------------------------------------------
    // TEST 1: GET / redirects to /notes
    // ----------------------------------------------------
    const res1 = await makeRequest(server, {
      hostname: '127.0.0.1',
      port,
      path: '/',
      method: 'GET'
    });
    assert(
      res1.statusCode === 302 && res1.headers.location === '/notes',
      'GET / redirects to /notes (Status 302)'
    );

    // ----------------------------------------------------
    // TEST 2: GET /notes returns 200 and renders empty state
    // ----------------------------------------------------
    const res2 = await makeRequest(server, {
      hostname: '127.0.0.1',
      port,
      path: '/notes',
      method: 'GET'
    });
    assert(
      res2.statusCode === 200 && res2.body.includes('No Notes Available'),
      'GET /notes renders 200 OK with empty state indicator'
    );

    // ----------------------------------------------------
    // TEST 3: GET /notes/new renders Add Note form
    // ----------------------------------------------------
    const res3 = await makeRequest(server, {
      hostname: '127.0.0.1',
      port,
      path: '/notes/new',
      method: 'GET'
    });
    assert(
      res3.statusCode === 200 &&
        res3.body.includes('Add New Note') &&
        res3.body.includes('name="title"'),
      'GET /notes/new renders 200 OK with add-note form'
    );

    // ----------------------------------------------------
    // TEST 4: POST /notes validation fails for empty title/content
    // ----------------------------------------------------
    const invalidPayload = querystring.stringify({
      title: '',
      content: '',
      category: 'Study'
    });
    const res4 = await makeRequest(
      server,
      {
        hostname: '127.0.0.1',
        port,
        path: '/notes',
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(invalidPayload)
        }
      },
      invalidPayload
    );
    assert(
      res4.statusCode === 400 && res4.body.includes('Validation Error'),
      'POST /notes with empty fields returns 400 with validation error message'
    );

    // ----------------------------------------------------
    // TEST 5: POST /notes successfully creates a note
    // ----------------------------------------------------
    const validPayload = querystring.stringify({
      title: 'Backend Exam Study Guide',
      content: 'Review Express routing, MongoDB CRUD operations, and EJS templates.',
      category: 'Study'
    });
    const res5 = await makeRequest(
      server,
      {
        hostname: '127.0.0.1',
        port,
        path: '/notes',
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(validPayload)
        }
      },
      validPayload
    );
    assert(
      res5.statusCode === 302 && res5.headers.location.startsWith('/notes'),
      'POST /notes creates document and redirects to /notes (Status 302)'
    );

    // Verify in database directly
    const createdNote = await notesCollection.findOne({ title: 'Backend Exam Study Guide' });
    assert(
      createdNote !== null &&
        createdNote.category === 'Study' &&
        createdNote.createdAt instanceof Date,
      'MongoDB contains new note with title, content, category, and createdAt Date'
    );

    const noteId = createdNote._id.toString();

    // ----------------------------------------------------
    // TEST 6: GET /notes renders note with title, category, delete button
    // ----------------------------------------------------
    const res6 = await makeRequest(server, {
      hostname: '127.0.0.1',
      port,
      path: '/notes',
      method: 'GET'
    });
    assert(
      res6.statusCode === 200 &&
        res6.body.includes('Backend Exam Study Guide') &&
        res6.body.includes('badge-study') &&
        res6.body.includes(`/notes/${noteId}/delete`),
      'GET /notes renders note card with title, category badge, and delete button'
    );

    // ----------------------------------------------------
    // TEST 7: GET /notes/:id renders note detail
    // ----------------------------------------------------
    const res7 = await makeRequest(server, {
      hostname: '127.0.0.1',
      port,
      path: `/notes/${noteId}`,
      method: 'GET'
    });
    assert(
      res7.statusCode === 200 && res7.body.includes('Review Express routing'),
      'GET /notes/:id renders 200 OK with complete note content'
    );

    // ----------------------------------------------------
    // TEST 8: GET /notes/:id/edit renders edit form (Bonus)
    // ----------------------------------------------------
    const res8 = await makeRequest(server, {
      hostname: '127.0.0.1',
      port,
      path: `/notes/${noteId}/edit`,
      method: 'GET'
    });
    assert(
      res8.statusCode === 200 &&
        res8.body.includes('Edit Note') &&
        res8.body.includes('Backend Exam Study Guide'),
      'GET /notes/:id/edit pre-populates form with existing note data'
    );

    // ----------------------------------------------------
    // TEST 9: POST /notes/:id/edit updates note in DB (Bonus)
    // ----------------------------------------------------
    const editPayload = querystring.stringify({
      title: 'Updated Exam Study Guide',
      content: 'Updated: Master MongoDB native driver with Express & EJS.',
      category: 'Important'
    });
    const res9 = await makeRequest(
      server,
      {
        hostname: '127.0.0.1',
        port,
        path: `/notes/${noteId}/edit`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(editPayload)
        }
      },
      editPayload
    );
    assert(
      res9.statusCode === 302 && res9.headers.location.startsWith('/notes'),
      'POST /notes/:id/edit updates note and redirects to /notes (Status 302)'
    );

    const updatedNote = await notesCollection.findOne({ _id: new ObjectId(noteId) });
    assert(
      updatedNote.title === 'Updated Exam Study Guide' &&
        updatedNote.category === 'Important' &&
        updatedNote.updatedAt instanceof Date,
      'MongoDB reflects updated title, category, and updatedAt timestamp'
    );

    // ----------------------------------------------------
    // TEST 10: Search notes by title (Bonus)
    // ----------------------------------------------------
    const res10Match = await makeRequest(server, {
      hostname: '127.0.0.1',
      port,
      path: '/notes?search=Updated',
      method: 'GET'
    });
    const res10NoMatch = await makeRequest(server, {
      hostname: '127.0.0.1',
      port,
      path: '/notes?search=NonExistentTitleXYZ',
      method: 'GET'
    });
    assert(
      res10Match.body.includes('Updated Exam Study Guide') &&
        res10NoMatch.body.includes('No Notes Available'),
      'Search query ?search= successfully filters notes by title (regex)'
    );

    // ----------------------------------------------------
    // TEST 11: Filter notes by category (Bonus)
    // ----------------------------------------------------
    const res11Match = await makeRequest(server, {
      hostname: '127.0.0.1',
      port,
      path: '/notes?category=Important',
      method: 'GET'
    });
    const res11NoMatch = await makeRequest(server, {
      hostname: '127.0.0.1',
      port,
      path: '/notes?category=Personal',
      method: 'GET'
    });
    assert(
      res11Match.body.includes('Updated Exam Study Guide') &&
        res11NoMatch.body.includes('No Notes Available'),
      'Category filter ?category= correctly filters notes'
    );

    // ----------------------------------------------------
    // TEST 12: POST /notes/:id/delete removes note from MongoDB
    // ----------------------------------------------------
    const res12 = await makeRequest(server, {
      hostname: '127.0.0.1',
      port,
      path: `/notes/${noteId}/delete`,
      method: 'POST'
    });
    assert(
      res12.statusCode === 302 && res12.headers.location.startsWith('/notes'),
      'POST /notes/:id/delete removes note and redirects (Status 302)'
    );

    const deletedCheck = await notesCollection.findOne({ _id: new ObjectId(noteId) });
    assert(deletedCheck === null, 'Verified note document is deleted from MongoDB collection');

    // ----------------------------------------------------
    // Summary
    // ----------------------------------------------------
    console.log('\n------------------------------------------------------');
    console.log(`Test Results: ${passed} Passed, ${failed} Failed`);
    console.log('------------------------------------------------------\n');

    if (failed > 0) {
      console.error('❌ Some tests failed.');
      process.exit(1);
    } else {
      console.log('🎉 ALL EXAM 01 REQUIREMENTS & BONUS TESTS PASSED PERFECTLY!\n');
    }
  } finally {
    server.close();
    await closeDB();
    process.exit(failed > 0 ? 1 : 0);
  }
}

// Support --server flag for standalone live demo
if (process.argv.includes('--server')) {
  (async () => {
    await startDatabase();
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`\n======================================================`);
      console.log(`🚀 My Notes live demo server running on: http://localhost:${PORT}`);
      console.log(`   Press Ctrl+C to stop.`);
      console.log(`======================================================\n`);
    });
  })();
} else {
  runTests().catch((err) => {
    console.error('Unhandled error during test execution:', err);
    process.exit(1);
  });
}
