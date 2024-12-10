require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const db = require('./db'); // Import the database connection
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173", // Your frontend URL
        methods: ["GET", "POST"]
    }
});

const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Use CORS middleware
app.use(cors({
    origin: 'http://localhost:5173' // Your frontend URL
}));

// Test Endpoint
app.get('/', (req, res) => {
  res.send('Chat server is running...');
});

// Socket.IO Connection
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // Send chat history to the connected client
    const query = 'SELECT user, text, timestamp FROM messages ORDER BY timestamp ASC';
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching messages:', err);
            return;
        }
        // Send the chat history to the client
        socket.emit('chat_history', results);
    });

    // Handle incoming messages
    socket.on('send_message', (data) => {
        const { user, text } = data;

        // Save the message to the database
        const query = 'INSERT INTO messages (user, text) VALUES (?, ?)';
        db.query(query, [user, text], (err, result) => {
            if (err) {
                console.error('Error inserting message:', err);
                return;
            }
            console.log('Message saved to database:', result.insertId);

            // Broadcast the message to all connected clients
            io.emit('receive_message', { user, text, timestamp: new Date() });
        });
    });

    socket.on('disconnect', () => {
        console.log('A user disconnected:', socket.id);
    });
});



// Start the server
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
