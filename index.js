require('dotenv').config()
const express = require('express');
const cors = require('cors');
const http = require('http');
const WebSocket = require('ws')
const jwt = require('jsonwebtoken')
const { expressjwt: expressJwt }  = require('express-jwt')

const app = express();
const port = process.env.PORT || 8080;

app.use(cors());
app.use(express.json())


const secretKey = process.env.SECRET_KEY || 'WJDLI120395DHJ'

//Middleware to protect routes
const authenticateJWT = expressJwt({
    secret: secretKey,
    algorithms: ["HS256"]
});

// A variable to store our number
let currentNumber = 100;
// Route to update the number

const server = http.createServer(app)
const wss = new WebSocket.Server({ server })

// Login is just an HTTP request
app.post('/login', (req, res) => {

    const {gamecode, password} = req.body;

    console.log("Login request recieved, given as " + gamecode + " " + password)

    // NOTE THAT THE LONGEST A USER CAN REMAIN CONNECTED IS DEPENDING ON THIS VALUE
    // TODO: Let admins decide the gamecode and passcode. Implement admin login.
    if (gamecode == 'test' && password == 'test') {
        var username = 'testUser';
        const token = jwt.sign({ username }, secretKey, {expiresIn: '2h'})
        console.log("Made it in");
        res.json( { token } )
    } else {
        // Sends 401 Not Authorized error.
        res.sendStatus(401);
    }

});

app.get('/protected', authenticateJWT, (req, res) => {

    res.send('This is a protected route.')

});

// Updated for websocket
wss.on('connection', (ws, req) => {
    const token = new URLSearchParams(req.url.slice(1)).get('token');

    if (!token) {
        ws.close();
        console.log('No token provided, closing connection');
        return;

    }


    jwt.verify(token, secretKey, (err, decoded) => {
        if (err) {
            ws.close();
            console.log('Unauthorized connection attempt');
            return;
        }

        console.log('Client connected', decoded.username);
        ws.send(JSON.stringify({ type: 'currentNumber', data: currentNumber }));

        ws.on ('message', (message) => {
            const parsedMessage = JSON.parse(message);
    
            if (parsedMessage.type == increment) {
                currentNumber++;
                console.log(currentNumber);
    
                // Broadcast the number to all connected clients
                wss.clients.forEach((client) => {
                    if (client.readyState == WebSocket.OPEN) {
                        client.send(JSON.stringify({type: 'currentNumber', data: currentNumber}));
                    }
    
                });
    
    
            }
        });
    
        ws.on('close', () => {
            console.log('Client disconnected');
        })

    });


});

// Starting the server
server.listen(port,'0.0.0.0', () => {
    console.log('Server running on port ${port}');
});


// ARCHIVAL CODE FOR HTTP SERVER



// // Route to get the current number
// app.get('/', (req, res) => {
//     res.json(currentNumber);
// });

// app.get('/increment', (req, res) => {
//     currentNumber++;
//     console.log(currentNumber);
//     res.json(currentNumber);
// });