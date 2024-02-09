"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
require("dotenv").config();
const socket_io_1 = require("socket.io");
const cors_1 = __importDefault(require("cors"));
const fs_1 = __importDefault(require("fs"));
const https_1 = __importDefault(require("https"));
const PORT = process.env.PORT || 8000;
const app = (0, express_1.default)();
// const server = createServer(app);
const key = fs_1.default.readFileSync("./privKey.pem");
const cert = fs_1.default.readFileSync("./cert.pem");
//we changed our express setup so we can use https
//pass the key and cert to createServer on https
const expressServer = https_1.default.createServer({ key, cert }, app);
// const expressServer = createServer(app);
const io = new socket_io_1.Server(expressServer, {
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
app.use((0, cors_1.default)({
    origin: [
        "http://localhost:5173",
        "https://livetesting.tech"
    ],
}));
let usersToSocket = new Map();
let socketIdToUser = new Map();
let queue = [];
let rooms = new Map();
let socketIdToRoomId = new Map();
// socket ----------------
io.on("connection", (socket) => {
    console.log("New User connected", socket.id);
    //  function one -------------------
    const createRoom = (user1, user2) => {
        var _a, _b, _c, _d, _e, _f, _g;
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
        socketIdToRoomId.set((_b = (_a = usersToSocket.get(user1)) === null || _a === void 0 ? void 0 : _a.id) !== null && _b !== void 0 ? _b : "", roomID);
        socketIdToRoomId.set((_d = (_c = usersToSocket.get(user2)) === null || _c === void 0 ? void 0 : _c.id) !== null && _d !== void 0 ? _d : "", roomID);
        console.log("Room created for -----", user1, user2);
        (_e = usersToSocket.get(user1)) === null || _e === void 0 ? void 0 : _e.join(roomID);
        (_f = usersToSocket.get(user2)) === null || _f === void 0 ? void 0 : _f.join(roomID);
        io.to(roomID).emit("ConnectionFound", { user1, user2, roomID });
        // create offer --------
        (_g = usersToSocket.get(user1)) === null || _g === void 0 ? void 0 : _g.emit("createOffer");
    };
    //  function two -------------------
    const startPairing = (socket) => {
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
        console.log("added user --------------------", name, "---- User No - ", usersToSocket.size);
        queue.push(socket.id);
        socket.emit("GoToWaiting");
        setTimeout(() => {
            startPairing(socket);
        }, 1000);
    });
    socket.on("answerCreated", (answer) => {
        const roomID = socketIdToRoomId.get(socket.id);
        socket.broadcast.to(roomID).emit("answerResponse", answer);
    });
    socket.on("offerCreated", (offer) => {
        const roomID = socketIdToRoomId.get(socket.id);
        console.log(offer);
        socket.broadcast.to(roomID).emit("createAnswer", offer);
    });
    socket.on("sendIceCandidate", (iceCandidate) => {
        const roomID = socketIdToRoomId.get(socket.id);
        console.log(iceCandidate);
        socket.broadcast.to(roomID).emit("gotIceCandidate", iceCandidate);
    });
    socket.on("disconnect", () => {
        var _a, _b;
        let roomID = socketIdToRoomId.get(socket.id);
        if (roomID) {
            io.to(roomID).emit("room-destroyed");
            let bothUser = rooms.get(roomID);
            let socket1 = usersToSocket.get((_a = bothUser === null || bothUser === void 0 ? void 0 : bothUser.user1) !== null && _a !== void 0 ? _a : "");
            let socket2 = usersToSocket.get((_b = bothUser === null || bothUser === void 0 ? void 0 : bothUser.user2) !== null && _b !== void 0 ? _b : "");
            rooms.delete(roomID);
            socketIdToRoomId.delete(socket1 === null || socket1 === void 0 ? void 0 : socket1.id);
            socketIdToRoomId.delete(socket2 === null || socket2 === void 0 ? void 0 : socket2.id);
            if ((socket1 === null || socket1 === void 0 ? void 0 : socket1.id) === socket.id) {
                socket2 === null || socket2 === void 0 ? void 0 : socket2.leave(roomID);
                queue.push(socket2 === null || socket2 === void 0 ? void 0 : socket2.id);
                startPairing(socket2);
            }
            else {
                socket1 === null || socket1 === void 0 ? void 0 : socket1.leave(roomID);
                queue.push(socket1 === null || socket1 === void 0 ? void 0 : socket1.id);
                startPairing(socket1);
            }
        }
        else {
            queue = queue.filter(id => id !== socket.id);
        }
        let user = socketIdToUser.get(socket.id);
        if (user) {
            usersToSocket.delete(user);
        }
        socketIdToUser.delete(socket.id);
        console.log("User Disconnected --- UserCOunt --", usersToSocket.size);
        console.log("queue count", queue.length);
    });
});
// health http route --------------
app.get("/", (req, res) => {
    return res.send("Hello from the server");
});
expressServer.listen(PORT, () => {
    console.log("Server runnning at port", PORT);
});
//# sourceMappingURL=index.js.map