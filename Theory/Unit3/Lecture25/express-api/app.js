// Import the express module
const express = require('express');
// Initialize the express application
const app = express();
const PORT = 3000;

// Built-in middleware to parse incoming JSON payloads
app.use(express.json());

// Basic Route Definition
// When a GET request is made to '/', this function executes
app.get('/', (req, res) => {
    // res.send sends a response back to the client
    res.send('Welcome to the Student Management API');
});

// Start the server to listen on the specified port
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
