// test-app.js
// Automated Test Suite & In-Memory Demonstration Runner for Experiment 13 A

process.env.NODE_ENV = 'test';
const http = require('http');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { app, User, connectDB } = require('./server');

let mongoServer;

// Helper to make HTTP requests against our test server
function makeRequest(server, options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        resolve({ statusCode: res.statusCode, headers: res.headers, body: data });
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
  // First check if DB_URL or a local MongoDB is reachable
  const targetUrl = process.env.DB_URL;
  if (targetUrl) {
    try {
      console.log(`Checking connection to: ${targetUrl}...`);
      await mongoose.connect(targetUrl, { serverSelectionTimeoutMS: 2000 });
      console.log(' Connected to configured MongoDB instance!');
      return targetUrl;
    } catch (e) {
      console.log(' Configured MongoDB unreachable, starting in-memory MongoDB instance...');
    }
  }

  // Fallback to in-memory MongoDB
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  console.log(` In-memory MongoDB instance started at: ${uri}`);
  await mongoose.connect(uri);
  return uri;
}

async function runTests() {
  console.log('\n======================================================');
  console.log('🧪 RUNNING EXPERIMENT 13 A AUTOMATED VERIFICATION');
  console.log('======================================================\n');

  await startDatabase();

  // Clear existing users from test database
  await User.deleteMany({});
  await User.syncIndexes();

  // Start test server on an ephemeral port
  const server = app.listen(0);
  const port = server.address().port;

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`   ${message}`);
      passed++;
    } else {
      console.error(` ❌ FAIL: ${message}`);
      failed++;
    }
  }

  try {
    // ----------------------------------------------------
    // Test 1: GET / (Home Page)
    // ----------------------------------------------------
    console.log('\n[Test 1] Serving Home Page (GET /)');
    const homeRes = await makeRequest(server, {
      hostname: '127.0.0.1',
      port,
      path: '/',
      method: 'GET'
    });
    assert(homeRes.statusCode === 200, 'Status code is 200 OK');
    assert(homeRes.body.includes('Register New User'), 'Contains "Register New User" section');
    assert(homeRes.body.includes('User Login'), 'Contains "User Login" section');
    assert(homeRes.body.includes('Show All Registered Users'), 'Contains "Show All Registered Users" button');

    // ----------------------------------------------------
    // Test 2: POST /signup (New User Registration)
    // ----------------------------------------------------
    console.log('\n[Test 2] Registering New User (POST /signup)');
    const signupData = 'username=alex_smith&email=alex@example.com&password=secretpassword123';
    const signupRes = await makeRequest(
      server,
      {
        hostname: '127.0.0.1',
        port,
        path: '/signup',
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(signupData)
        }
      },
      signupData
    );
    assert(signupRes.statusCode === 200, 'Registration returned 200 OK');
    assert(signupRes.body.includes('User registered successfully!'), 'Response confirms registration');
    assert(signupRes.body.includes('alex_smith'), 'Displays registered username');

    // Verify document in MongoDB
    const userInDb = await User.findOne({ username: 'alex_smith' });
    assert(userInDb !== null, 'User document exists in MongoDB');
    assert(userInDb.email === 'alex@example.com', 'Stored email matches form submission');

    // ----------------------------------------------------
    // Test 3: POST /signup (Duplicate Key Prevention - Code 11000)
    // ----------------------------------------------------
    console.log('\n[Test 3] Preventing Duplicate User Registration');
    const dupRes = await makeRequest(
      server,
      {
        hostname: '127.0.0.1',
        port,
        path: '/signup',
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(signupData)
        }
      },
      signupData
    );
    assert(dupRes.statusCode === 400, 'Duplicate signup rejected with 400 Bad Request');
    assert(
      dupRes.body.includes('already exists') || dupRes.body.includes('E11000'),
      'Catches Mongoose error 11000 duplicate key'
    );

    // ----------------------------------------------------
    // Test 4: POST /login (Successful Authentication)
    // ----------------------------------------------------
    console.log('\n[Test 4] User Login with Correct Credentials (POST /login)');
    const validLoginData = 'username=alex_smith&password=secretpassword123';
    const validLoginRes = await makeRequest(
      server,
      {
        hostname: '127.0.0.1',
        port,
        path: '/login',
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(validLoginData)
        }
      },
      validLoginData
    );
    assert(validLoginRes.statusCode === 200, 'Valid login returned 200 OK');
    assert(validLoginRes.body.includes('Login successful!'), 'Body contains "Login successful!"');
    assert(validLoginRes.body.includes('Welcome back, alex_smith') || validLoginRes.body.includes('alex_smith'), 'Includes welcome message');

    // ----------------------------------------------------
    // Test 5: POST /login (Incorrect Password)
    // ----------------------------------------------------
    console.log('\n[Test 5] User Login with Incorrect Password');
    const wrongPassData = 'username=alex_smith&password=wrongpassword';
    const wrongPassRes = await makeRequest(
      server,
      {
        hostname: '127.0.0.1',
        port,
        path: '/login',
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(wrongPassData)
        }
      },
      wrongPassData
    );
    assert(wrongPassRes.statusCode === 401, 'Incorrect password rejected with 401 Unauthorized');
    assert(wrongPassRes.body.includes('Incorrect password'), 'Response body shows "Incorrect password"');

    // ----------------------------------------------------
    // Test 6: POST /login (User Not Found)
    // ----------------------------------------------------
    console.log('\n[Test 6] User Login with Unknown Username');
    const unknownUserData = 'username=nonexistent_user&password=randompassword';
    const unknownUserRes = await makeRequest(
      server,
      {
        hostname: '127.0.0.1',
        port,
        path: '/login',
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(unknownUserData)
        }
      },
      unknownUserData
    );
    assert(unknownUserRes.statusCode === 404, 'Unknown user rejected with 404 Not Found');
    assert(unknownUserRes.body.includes('User not found'), 'Response body indicates user not found');

    // ----------------------------------------------------
    // Test 7: GET /users (Query All Registered Users)
    // ----------------------------------------------------
    console.log('\n[Test 7] Listing Registered Users (GET /users)');
    const usersRes = await makeRequest(server, {
      hostname: '127.0.0.1',
      port,
      path: '/users',
      method: 'GET'
    });
    assert(usersRes.statusCode === 200, 'GET /users returned 200 OK');
    assert(usersRes.body.includes('alex_smith'), 'Lists registered user alex_smith');
    assert(usersRes.body.includes('alex@example.com'), 'Lists email alex@example.com');

  } finally {
    server.close();
    await mongoose.disconnect();
    if (mongoServer) {
      await mongoServer.stop();
    }
  }

  console.log('\n======================================================');
  console.log(`📊 VERIFICATION COMPLETE: ${passed} Passed, ${failed} Failed`);
  console.log('======================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

// Demo server runner mode (runs full server backed by in-memory MongoDB)
async function runDemoServer() {
  console.log('\n======================================================');
  console.log('🚀 STARTING ZERO-CONFIGURATION IN-MEMORY DEMO SERVER');
  console.log('======================================================\n');

  await startDatabase();
  const PORT = process.env.PORT || 3000;

  app.listen(PORT, () => {
    console.log(`\n Server is ready and running!`);
    console.log(` Open in browser: http://localhost:${PORT}`);
    console.log(` Press Ctrl+C to stop.\n`);
  });
}

if (process.argv.includes('--server')) {
  runDemoServer().catch((err) => {
    console.error('Error starting demo server:', err);
    process.exit(1);
  });
} else {
  runTests().catch((err) => {
    console.error('Test execution error:', err);
    process.exit(1);
  });
}
