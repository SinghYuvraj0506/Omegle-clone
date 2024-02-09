import express from "express";
import { createServer } from "http";
require("dotenv").config();
import { Server, Socket } from "socket.io";
import cors from "cors";
import fs from "fs";
import https from "https";

const PORT = process.env.PORT || 8000;

const app = express();
// const server = createServer(app);

const key = fs.readFileSync("./privKey.pem");
const cert = fs.readFileSync("./cert.pem");

//we changed our express setup so we can use https
//pass the key and cert to createServer on https
// const expressServer = https.createServer({ key, cert }, app);
const expressServer = createServer(app);

const io = new Server(expressServer, {
  cors: {
    origin: [
      "http://localhost:5173",
      "https://livetesting.tech"
    ],
    methods: ["GET", "POST"], // Add any other methods you're using
    allowedHeaders: ["Access-Control-Allow-Origin"], // Add any custom headers you're using
    credentials: true // Allow credentials if needed
  }
});


app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://livetesting.tech"
    ],
  })
);

let usersToSocket = new Map<string, Socket>();
let socketIdToUser = new Map<string, string>();
let queue: string[] = [];
let rooms = new Map<
  string,
  {
    user1: string;
    user2: string;
  }
>();

let socketIdToRoomId = new Map<string, string>();

// socket ----------------
io.on("connection", (socket) => {
  console.log("New User connected", socket.id);

  //  function one -------------------
  const createRoom = (user1: string, user2: string) => {
    // Generate a random 4-digit number between 1000 and 9999
    const roomID = Math.floor(1000 + Math.random() * 9000).toString();

    // already room exists ------
    if (rooms.get(roomID)) {
      return createRoom(user1, user2);
    }

    rooms.set(roomID, {
      user1,
      user2,
    });

    socketIdToRoomId.set(usersToSocket.get(user1)?.id ?? "", roomID);
    socketIdToRoomId.set(usersToSocket.get(user2)?.id ?? "", roomID);

    console.log("Room created for -----", user1, user2);

    usersToSocket.get(user1)?.join(roomID);
    usersToSocket.get(user2)?.join(roomID);

    io.to(roomID).emit("ConnectionFound", { user1, user2, roomID });

    // create offer --------
    usersToSocket.get(user1)?.emit("createOffer")

  };

  //  function two -------------------
  const startPairing = (socket: Socket) => {
    // get a random other user -------------
    console.log("queue count -------------", queue.length);

    if (queue.length < 2) {
      return;
    }

    // Generate a random index within the range of the array length
    const randomIndex = Math.floor(Math.random() * queue.length);
    const randomUser = queue[randomIndex];

    // same iuser ----------
    if (randomUser === socket.id) {
      return startPairing(socket);
    }

    let user1 = socketIdToUser.get(socket.id);
    let user2 = socketIdToUser.get(randomUser);

    //  remove from queue -------------------------------
    queue.splice(randomIndex, 1);
    queue = queue.filter((e) => {
      e !== socket.id;
    });

    // if user has left ------------------
    if (!user1 || !user2) {
      return startPairing(socket);
    }

    createRoom(user1, user2);
  };

  socket.on("user-connect", (name) => {
    let already = usersToSocket.get(name);

    if (already) {
      socket.emit("ErrorOccured", "username already in use");
      return;
    }

    usersToSocket.set(name, socket);
    socketIdToUser.set(socket.id, name);

    console.log(
      "added user --------------------",
      name,
      "---- User No - ",
      usersToSocket.size
    );

    queue.push(socket.id);
    socket.emit("GoToWaiting");

    setTimeout(() => {
      startPairing(socket);
    }, 1000);

  });


  socket.on("answerCreated",(answer)=>{
    const roomID = socketIdToRoomId.get(socket.id)
    socket.broadcast.to(roomID).emit("answerResponse",answer)
  })

  socket.on("offerCreated",(offer)=>{
    const roomID = socketIdToRoomId.get(socket.id)
    socket.broadcast.to(roomID).emit("createAnswer",offer)
  })

  socket.on("sendNewMessage",(msg)=>{
    let roomId = socketIdToRoomId.get(socket.id)
    let sender = socketIdToUser.get(socket.id)
    io.to(roomId).emit("gotNewMessage",{msg,from:sender})
  })


  socket.on("sendIceCandidate",(iceCandidate)=>{
    const roomID = socketIdToRoomId.get(socket.id)
    socket.broadcast.to(roomID).emit("gotIceCandidate",iceCandidate)
  })



  socket.on("disconnect", () => {
    let roomID = socketIdToRoomId.get(socket.id);

    if (roomID) {
      io.to(roomID).emit("room-destroyed");
      let bothUser = rooms.get(roomID);
      let socket1 = usersToSocket.get(bothUser?.user1 ?? "");
      let socket2 = usersToSocket.get(bothUser?.user2 ?? "");
      rooms.delete(roomID);
      socketIdToRoomId.delete(socket1?.id);
      socketIdToRoomId.delete(socket2?.id);

      if (socket1?.id === socket.id) {
        socket2?.leave(roomID);
        queue.push(socket2?.id);
        startPairing(socket2);
      } else {
        socket1?.leave(roomID);
        queue.push(socket1?.id);
        startPairing(socket1);
      }
    }

    else{
      queue =queue.filter(id => id !== socket.id)
    }

    let user = socketIdToUser.get(socket.id);
    if (user) {
      usersToSocket.delete(user);
    }
    socketIdToUser.delete(socket.id);

    console.log("User Disconnected --- UserCOunt --", usersToSocket.size);
    console.log("queue count",queue.length)
  });
});

// health http route --------------
app.get("/", (req, res) => {
  return res.send("Hello from the server");
});

expressServer.listen(PORT, () => {
  console.log("Server runnning at port", PORT);
});
