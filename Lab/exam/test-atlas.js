// test-atlas.js
// Utility to test and verify connection to MongoDB Atlas Cloud Cluster

require('dotenv').config();
const { MongoClient } = require('mongodb');

const uri = process.argv[2] || process.env.MONGODB_URI || process.env.DB_URL;
const dbName = process.env.DB_NAME || 'notes_lab';

function maskUri(str) {
  try {
    return str.replace(/:\/\/(.*?):(.*?)@/, '://$1:••••••••@');
  } catch {
    return str;
  }
}

async function testAtlasConnection() {
  console.log('\n======================================================');
  console.log('🌐 TESTING MONGODB ATLAS CONNECTION');
  console.log('======================================================\n');

  if (!uri || uri.includes('127.0.0.1') || uri.includes('localhost')) {
    console.log('⚠️  No MongoDB Atlas URI detected.');
    console.log('\nTo connect to MongoDB Atlas:');
    console.log('1. Open or create the .env file in this directory:');
    console.log('   MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/notes_lab?retryWrites=true&w=majority');
    console.log('2. Or run this script directly with your Atlas URI:');
    console.log('   node test-atlas.js "mongodb+srv://<user>:<password>@<cluster>.mongodb.net"\n');
    process.exit(0);
  }

  console.log(`Connecting to: ${maskUri(uri)}`);
  console.log(`Target Database: ${dbName}\n`);

  const client = new MongoClient(uri, { serverSelectionTimeoutMS: 8000 });

  try {
    console.log('⏳ Establishing secure TLS handshake with Atlas...');
    await client.connect();
    console.log(' Connected successfully to MongoDB Atlas!\n');

    const db = client.db(dbName);
    const collection = db.collection('notes');

    // Perform ping
    await db.command({ ping: 1 });
    console.log(' Ping test: OK');

    // Test write permission
    console.log(' Testing write capability...');
    const testDoc = {
      title: '__Atlas_Connection_Test__',
      content: 'Testing write capability from Node.js Express Notes App',
      category: 'Test',
      createdAt: new Date()
    };
    const insertResult = await collection.insertOne(testDoc);
    console.log(` Insert test: OK (Created document ID: ${insertResult.insertedId})`);

    // Test read permission
    const fetchedDoc = await collection.findOne({ _id: insertResult.insertedId });
    if (fetchedDoc && fetchedDoc.title === testDoc.title) {
      console.log(' Read test: OK (Document verified)');
    }

    // Clean up test doc
    await collection.deleteOne({ _id: insertResult.insertedId });
    console.log(' Cleanup test: OK (Temporary document removed)');

    console.log('\n======================================================');
    console.log('🎉 MongoDB Atlas is 100% READY for your Notes App!');
    console.log('   You can now start your server with:');
    console.log('   npm start');
    console.log('======================================================\n');
  } catch (err) {
    console.error('\n❌ Connection Failed:', err.message);
    console.error('\nTroubleshooting Checklist:');
    console.error('1. IP Whitelist: In Atlas Dashboard -> Security -> Network Access, click "Add IP Address" -> "Allow Access From Anywhere" (0.0.0.0/0).');
    console.error('2. Database User: In Atlas Dashboard -> Security -> Database Access, ensure your username and password are correct.');
    console.error('3. Special Characters: If your password contains characters like @, #, $, encode them (e.g. "@" becomes "%40").\n');
  } finally {
    await client.close();
  }
}

testAtlasConnection();
