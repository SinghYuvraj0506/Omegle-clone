import express from "express";
import { createServer } from "http";
require("dotenv").config();
import { Server } from "socket.io";
import cors from "cors";

const PORT = process.env.PORT || 8000;

const app = express();
const server = createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
  },
});

app.use(
  cors({
    origin: "http://localhost:5173",
  })
);

interface User {
  name: string;
  socketId: string;
  roomId?: string;
}

let users: User[] = [];


io.on("connection", (socket) => {
  console.log("a user connected", socket.id);

  socket.on("newUser", (user) => {
    socket.join("universal")
    users.push({
      ...user,
      socketId: socket.id,
      roomId:"universal"
    });
    io.to("universal").emit("new-user-joined", { name: user.name });
  });

  socket.on("new-message", (msg, roomId) => {
    if (!roomId) {
      const user = users.find((e) => {
        return e.socketId === socket.id;
      });
      io.to("universal").emit("message", { msg, user: user?.name });
    } else {
      const user = users.find((e) => {
        return e.socketId === socket.id;
      });
      io.to(roomId).emit("message", { msg, user: user?.name });
    }
  });

  socket.on("joinRoom", (roomId, user) => {
    socket.join(roomId)
    users.push({
        ...user,
        socketId: socket.id,
        roomId:roomId
      });
      io.to(roomId).emit("new-user-joined", { name: user?.name });
  });

  socket.on("disconnect", () => {
    users = users.filter((e) => {
      return e.socketId !== socket.id;
    });
    console.log("user disconnected");
  });
});

// health http route --------------
app.get("/", (req, res) => {
  return res.send("Hello from the server");
});

server.listen(PORT, () => {
  console.log("Server runnning at port", PORT);
});
