const express = require("express")
const { Server } = require("socket.io");
var http = require('http');
const cors = require("cors")

const app = express()
app.use(cors())
const server = http.createServer(app);

const socket = require("socket.io-client")("https://react-chat-app-8yak.vercel.app");

socket.on("connect_error", (err) => {
  console.log(`connect_error due to ${err.message}`);
});

const io = new Server(server, {
    cors: {
      origin: "http://localhost:3000",
      methods: ["GET", "POST"]
    }
  });

app.get("/", (req, res) => {res.send("Chat Backend Started"); res.end()})

// server-side
io.on("connection", (socket) => {
    console.log(socket.id)
  
    socket.on("joinRoom", room => {
          socket.join(room)
    })
  
    socket.on("newMessage", ({newMessage, room}) => {
      io.in(room).emit("getLatestMessage", newMessage)
    })  
});
  
  const port = process.env.PORT || 9000
  
  server.listen(port, console.log(`App started at port ${port}`))
