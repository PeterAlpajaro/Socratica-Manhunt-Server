require('dotenv').config()
const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());

// A variable to store our number
let currentNumber = 100;
// Route to update the number

// Route to get the current number
app.get('/', (req, res) => {
    res.json(currentNumber);
});

app.get('/increment', (req, res) => {
    currentNumber++;
    console.log(currentNumber);
    res.json(currentNumber);
});

// Start the server
app.listen(port, '0.0.0.0', () => {
    console.log(`Server running on port ${port}`);
});