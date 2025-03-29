const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*", // Bisa diakses oleh siapa saja
        methods: ["GET", "POST"]
    }
});

app.use(cors());
app.use(express.json());

// Koneksi ke MongoDB (Gunakan MongoDB Atlas atau Supabase)
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("MongoDB Connected"))
    .catch(err => console.log(err));

// Model untuk menyimpan pesan
const Message = mongoose.model("Message", new mongoose.Schema({
    text: String,
    sender: String,
    timestamp: { type: Date, default: Date.now }
}));

// Socket.io Handling
io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("sendMessage", async (data) => {
        const message = new Message({ text: data.text, sender: data.sender });
        await message.save();
        io.emit("receiveMessage", message);
    });

    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
    });
});

// API Route
app.get("/", (req, res) => {
    res.send("Chat Server is Running!");
});

server.listen(process.env.PORT || 3000, () => {
    console.log("Server running on port", process.env.PORT || 3000);
});
